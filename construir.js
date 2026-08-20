/* ===================================================================
   construir.js — arma el sitio desde contenido/*.md
   Uso:  node construir.js
   Salida: publico/index.html  (lo único que sirve Cloudflare Pages)

   El diseño vive en plantilla/base.html y NO se toca para agregar una
   entrada: agregar una entrada es agregar un archivo .md.
   =================================================================== */
const fs = require("fs");
const path = require("path");
const { leerTodas } = require("./leer.js");

const RAIZ = __dirname;
const PLANTILLA = path.join(RAIZ, "plantilla", "base.html");
const SALIDA_DIR = path.join(RAIZ, "publico");
const SALIDA = path.join(SALIDA_DIR, "index.html");
const MARCA = "/*__ENTRADAS__*/[]";

/* Sólo viajan al sitio los campos que el sitio usa. Si mañana el
   front-matter gana un campo interno, no se filtra a la página solo. */
const CAMPOS = ["slug", "fecha", "semana", "revision", "area", "firma",
                "titulo", "resumen", "cita", "diagrama", "cifra", "cuerpo",
                "cta", "checklist"];

/* Tres secuencias que romperían el <script> del sitio si aparecieran
   dentro de una entrada. Los dos separadores Unicode son saltos de línea
   para el parser de JS aunque en pantalla no se vean, así que se nombran
   por código: escribirlos literales parte el archivo que los escribe. */
const PELIGROSOS = [
  [new RegExp("</script", "gi"), "<\\/script"],
  [new RegExp(String.fromCharCode(0x2028), "g"), "\\u2028"],
  [new RegExp(String.fromCharCode(0x2029), "g"), "\\u2029"]
];

function serializar(entradas) {
  let s = JSON.stringify(entradas, null, 2);
  for (const [patron, reemplazo] of PELIGROSOS) s = s.replace(patron, reemplazo);
  return s;
}

function construir() {
  const entradas = leerTodas();

  const paraElSitio = entradas.map(e => {
    const o = {};
    CAMPOS.forEach(k => { o[k] = e[k]; });
    return o;
  });

  let html = fs.readFileSync(PLANTILLA, "utf8");
  if (!html.includes(MARCA)) {
    throw new Error("la plantilla perdió el marcador " + MARCA + " — no se puede inyectar el contenido");
  }

  html = html.replace(MARCA, serializar(paraElSitio));

  fs.mkdirSync(SALIDA_DIR, { recursive: true });
  fs.writeFileSync(SALIDA, html, "utf8");

  return { entradas, bytes: html.length };
}

if (require.main === module) {
  try {
    const r = construir();
    console.log("publico/index.html  " + r.bytes.toLocaleString("es-AR") + " bytes");
    console.log(r.entradas.length + " entradas:");
    r.entradas.forEach(e => console.log("   " + e.fecha + "  " + e.area.padEnd(8) + "  " + e.titulo));
  } catch (err) {
    console.error("\nNO SE CONSTRUYÓ: " + err.message + "\n");
    process.exit(1);
  }
}

module.exports = { construir, serializar };
