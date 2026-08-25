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

/* ── 2. El repo tiene que estar limpio ───────────────────────────── */
const sucio = correr("git", ["status", "--porcelain"]).trim();
if (sucio)
  salir(3, "El repo tiene cambios sin commitear:\n" + sucio +
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
  const quedo = correr("git", ["status", "--porcelain"]).trim();
  console.log(quedo ? "AVISO: el repo NO quedó limpio:\n" + quedo
                    : "Repo limpio: el revert funcionó.");
  process.exit(1);
}

/* ── 4. Listo. El commit es opcional; el push no existe acá. ─────── */
const titulo = (fs.readFileSync(rutaDestino, "utf8").match(/^titulo:\s*(.+)$/m) || [, destino])[1].trim();

if (COMMIT) {
  correr("git", ["add", "-A"]);
  correr("git", ["commit", "-m", titulo + "\n\nEntrada de la semana, preparada por la rutina del lunes.\n" +
    "Sin publicar: falta `git push origin main`.\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>"]);
  console.log("\nCommit hecho, SIN pushear: " + correr("git", ["log", "--oneline", "-1"]).trim());
}

console.log("\nListo para publicar: «" + titulo + "»");
console.log("Para publicarlo:\n  cd \"" + RAIZ + "\" && git push origin main");
