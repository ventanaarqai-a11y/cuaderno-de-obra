/* ===================================================================
   preparar-publicacion.js — mueve el borrador del viernes a contenido/,
   reconstruye el sitio, verifica que todo pase y —con --publicar— publica.

   Uso:  node herramientas/preparar-publicacion.js [--publicar|--commit|--dry-run]

   POR QUÉ ES UN SCRIPT Y NO INSTRUCCIONES EN PROSA
   Lo corre una tarea programada un lunes a la mañana, sin nadie mirando.
   El paso que importa no es mover el archivo: es DESHACERLO si la suite
   falla. Un repo a medias un lunes es peor que una tarea que no corrió, y
   eso no se puede dejar librado a que un agente se acuerde de revertir.
   Acá el revert está en un `finally`.

   `--publicar` PUBLICA DE VERDAD: hace `git push` y la entrada sale a
   elcuadernodeobra.com sin que nadie la haya leído.

   Es una decisión explícita del dueño del 2026-08-24, que revocó el
   esquema anterior de "dejar listo y esperar el OK". Lo que hay que tener
   presente al tocar este archivo: **al sacar la revisión humana, los
   únicos guardianes que quedan son `validar.js` y `pruebas.js`**. Ahí se
   caza el hype, la cifra sin respaldo, la beta que no existe y el cierre
   que no es pregunta. Lo que NO puede cazar ninguno de los dos es que lo
   que cuenta la entrada sea falso: eso depende de que el borrador se haya
   escrito leyendo el avance real. Aflojar un guard de validar.js ahora
   tiene consecuencias directas en lo que ve un lector.

   Códigos de salida — la tarea del lunes los distingue:
     0  publicado (con --publicar) o listo para publicar
     2  no hay borrador (no es un error: no hubo semana)
     3  el repo no está limpio, no se toca nada
     1  el borrador no pasa: se revirtió todo
     4  pasó todo pero el push falló: quedó commiteado sin publicar
   =================================================================== */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const RAIZ = path.join(__dirname, "..");
const REPORTES = path.join(RAIZ, "reportes");
const CONTENIDO = path.join(RAIZ, "contenido");
const SITIO = path.join(RAIZ, "publico", "index.html");

const PUBLICAR = process.argv.includes("--publicar");
const COMMIT = process.argv.includes("--commit") || PUBLICAR;   /* publicar implica commitear */
const ENSAYO = process.argv.includes("--dry-run");

const correr = (cmd, args) => execFileSync(cmd, args, { cwd: RAIZ, encoding: "utf8", stdio: "pipe" });
const salir = (codigo, mensaje) => { console.log(mensaje); process.exit(codigo); };

/* ── 1. ¿Hay borrador? ───────────────────────────────────────────── */
const borradores = fs.readdirSync(REPORTES)
  .filter(f => f.endsWith("-borrador.md"))
  .sort();                                   /* AAAA-Www ordena solo */

if (!borradores.length)
  salir(2, "No hay borrador en reportes/. No se toca nada.\n" +
           "Si el viernes corrió, su reporte dice por qué no lo produjo.");

const borrador = borradores[borradores.length - 1];
const destino = borrador.replace(/-borrador\.md$/, ".md");
const rutaBorrador = path.join(REPORTES, borrador);
const rutaDestino = path.join(CONTENIDO, destino);

if (fs.existsSync(rutaDestino))
  salir(3, "Ya existe contenido/" + destino + ". El borrador quedaría pisando una entrada publicada.");

/* ── 2. Todo tiene que estar limpio, MENOS el buzón ──────────────────
   Y no es un atajo: el viernes deja su reporte y su borrador en reportes/
   sin commitear, así que ese directorio SIEMPRE tiene cambios cuando corre
   el lunes. Exigir el repo entero limpio hacía que la rutina abortara todos
   los lunes con «cambios sin commitear» — lo cazó el ensayo de punta a
   punta, no la lectura del código.
   Lo que sí tiene que estar limpio es el resto: algo a medias en contenido/
   o en la plantilla se publicaría de rebote con la entrada de la semana. */
const sucio = correr("git", ["status", "--porcelain"])
  .split("\n")
  .filter(l => l.trim() && !/^..\s+"?reportes\//.test(l))
  .join("\n");
if (sucio)
  salir(3, "Hay cambios sin commitear fuera del buzón:\n" + sucio +
           "\nNo se mueve nada: mezclar esto con la publicación semanal deja un commit ilegible.");

console.log("Borrador:  reportes/" + borrador);
console.log("Destino:   contenido/" + destino);
if (ENSAYO) salir(0, "\n--dry-run: hasta acá llega. No se movió nada.");

/* ── 3. Mover, verificar, y deshacer si algo falla ───────────────── */
const sitioAntes = fs.readFileSync(SITIO, "utf8");
let listo = false;

try {
  fs.renameSync(rutaBorrador, rutaDestino);

  for (const paso of ["validar.js", "construir.js", "pruebas.js"]) {
    process.stdout.write("  " + paso.padEnd(16));
    try {
      correr("node", [paso]);
      console.log("ok");
    } catch (e) {
      console.log("FALLA");
      const salida = String(e.stdout || "") + String(e.stderr || "");
      console.log(salida.split("\n").filter(l => /FALLA|Error|error|✗|rechaz/.test(l)).slice(0, 8).join("\n"));
      throw new Error(paso + " no pasa");
    }
  }
  listo = true;
} catch (e) {
  console.log("\n" + e.message + " — se deshace todo y el repo queda como estaba.");
} finally {
  if (!listo) {
    /* El orden importa: primero el archivo, después el sitio. Si se
       reconstruyera con la entrada todavía puesta, quedaría publicada. */
    if (fs.existsSync(rutaDestino)) fs.renameSync(rutaDestino, rutaBorrador);
    fs.writeFileSync(SITIO, sitioAntes, "utf8");
  }
}

if (!listo) {
  /* Mismo filtro que el guard: el borrador vuelve al buzon sin commitear,
     y eso es lo esperado — no un revert incompleto. */
  const quedo = correr("git", ["status", "--porcelain"])
    .split("\n")
    .filter(l => l.trim() && !/^..\s+"?reportes\//.test(l))
    .join("\n");
  console.log(quedo ? "AVISO: el repo NO quedó limpio:\n" + quedo
                    : "Repo limpio: el revert funcionó.");
  process.exit(1);
}

/* ── 4. Commitear ────────────────────────────────────────────────── */
const titulo = (fs.readFileSync(rutaDestino, "utf8").match(/^titulo:\s*(.+)$/m) || [, destino])[1].trim();

if (COMMIT) {
  /* Se agrega SÓLO lo de esta publicación, nunca `git add -A`. El buzón
     puede tener el borrador de otra semana esperando, y `-A` lo arrastraría
     a un commit que dice publicar otra cosa. Pasó en el ensayo: un borrador
     de prueba terminó dentro de un commit que no lo mencionaba.
     El reporte de la semana sí entra: es el registro de dónde salió. */
  const reporte = "reportes/" + destino.slice(0, 9) + ".md";   /* AAAA-Www */
  const aAgregar = [path.join("contenido", destino), path.join("publico", "index.html")];
  if (fs.existsSync(path.join(RAIZ, reporte))) aAgregar.push(reporte);
  correr("git", ["add", "--", ...aAgregar]);
  correr("git", ["commit", "-m", titulo + "\n\nEntrada de la semana, preparada por la rutina del lunes.\n" +
    "Sin publicar: falta `git push origin main`.\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>"]);
  console.log("\nCommit hecho, SIN pushear: " + correr("git", ["log", "--oneline", "-1"]).trim());
}

if (!PUBLICAR) {
  console.log("\nListo para publicar: «" + titulo + "»");
  console.log("Para publicarlo:\n  cd \"" + RAIZ + "\" && git push origin main");
  process.exit(0);
}

/* ── 5. Publicar ─────────────────────────────────────────────────────
   Un push puede reportar error y mover el ref igual, o reportar éxito y
   no emitir el evento que dispara el deploy. Ya pasó en este repo. Así
   que el resultado NO se lee de la salida del push: se lee del remoto. */
console.log("\nPublicando…");
let errorPush = null;
try { correr("git", ["push", "origin", "main"]); }
catch (e) { errorPush = String(e.stderr || e.stdout || e.message).trim(); }

correr("git", ["fetch", "origin"]);
const local = correr("git", ["rev-parse", "HEAD"]).trim();
const remoto = correr("git", ["rev-parse", "origin/main"]).trim();

if (local !== remoto) {
  console.log("EL PUSH NO LLEGÓ. El commit está hecho pero la entrada NO está publicada.");
  if (errorPush) console.log(errorPush.split("\n").slice(0, 4).join("\n"));
  console.log("local  " + local.slice(0, 7) + "\nremoto " + remoto.slice(0, 7));
  console.log("Se recupera con:  cd \"" + RAIZ + "\" && git push origin main");
  process.exit(4);
}

console.log("PUBLICADO: «" + titulo + "»  ·  " + remoto.slice(0, 7));
if (errorPush) console.log("(el push reportó un error pero el remoto avanzó igual)");
console.log("Cloudflare Pages tarda uno o dos minutos en servir la versión nueva.");
