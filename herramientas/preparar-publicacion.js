/* ===================================================================
   preparar-publicacion.js — mueve el borrador del viernes a contenido/,
   reconstruye el sitio y verifica que todo pase. NO publica.

   Uso:  node herramientas/preparar-publicacion.js [--commit] [--dry-run]

   POR QUÉ ES UN SCRIPT Y NO INSTRUCCIONES EN PROSA
   Lo corre una tarea programada un lunes a la mañana, sin nadie mirando.
   El paso que importa no es mover el archivo: es DESHACERLO si la suite
   falla. Un repo a medias un lunes es peor que una tarea que no corrió, y
   eso no se puede dejar librado a que un agente se acuerde de revertir.
   Acá el revert está en un `finally`.

   LO QUE ESTE SCRIPT NO HACE, A PROPÓSITO: `git push`.
   Publicar sigue siendo una decisión de Marcelo. El buzón `reportes/`
   existe para que la revisión humana esté garantizada por la estructura y
   no por acordarse; si este script pusheara, esa garantía desaparecería.

   Códigos de salida — la tarea del lunes los distingue:
     0  listo para publicar
     2  no hay borrador (no es un error: no hubo semana)
     3  el repo no está limpio, no se toca nada
     1  el borrador no pasa: se revirtió todo
   =================================================================== */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const RAIZ = path.join(__dirname, "..");
const REPORTES = path.join(RAIZ, "reportes");
const CONTENIDO = path.join(RAIZ, "contenido");
const SITIO = path.join(RAIZ, "publico", "index.html");

const COMMIT = process.argv.includes("--commit");
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

/* ── 4. Listo. El commit es opcional; el push no existe acá. ─────── */
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

console.log("\nListo para publicar: «" + titulo + "»");
console.log("Para publicarlo:\n  cd \"" + RAIZ + "\" && git push origin main");
