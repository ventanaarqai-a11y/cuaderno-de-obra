/* ===================================================================
   pruebas.js — la suite del cuaderno, sin navegador
   Uso:  node pruebas.js
   Sale con código 1 si algo falla.

   Cubre tres capas: leer una entrada, construir el sitio, y lo que el
   sitio renderiza. Cada aserción está escrita para poder ponerse ROJA:
   si una no se rompe al mutar el código, no sirve y hay que rehacerla.
   =================================================================== */
const fs = require("fs");
const path = require("path");
const { leerTodas, leerEntrada } = require("./leer.js");
const { construir } = require("./construir.js");
const { validarEntrada, cifrasAfirmadas } = require("./validar.js");

const RAIZ = __dirname;
const CONTENIDO = path.join(RAIZ, "contenido");

let fallos = 0;
const afirmar = (que, obtenido, esperado) => {
  const bien = JSON.stringify(obtenido) === JSON.stringify(esperado);
  console.log((bien ? "ok     " : "FALLA  ") + que.padEnd(48) +
              JSON.stringify(obtenido) + (bien ? "" : "   esperado " + JSON.stringify(esperado)));
  if (!bien) fallos++;
};
const afirmarQueFalla = (que, fn, fragmento) => {
  let mensaje = null;
  try { fn(); } catch (e) { mensaje = e.message; }
  const bien = mensaje !== null && (!fragmento || mensaje.includes(fragmento));
  console.log((bien ? "ok     " : "FALLA  ") + que.padEnd(48) +
              (mensaje ? "abortó: " + mensaje.slice(0, 62) : "NO ABORTÓ"));
  if (!bien) fallos++;
};
const titulo = t => console.log("\n── " + t + " " + "─".repeat(Math.max(0, 58 - t.length)));

/* ── 1. Leer una entrada ──────────────────────────────────────────── */
titulo("leer");
const entradas = leerTodas();
afirmar("hay entradas", entradas.length > 0, true);
afirmar("orden: la más reciente primero",
  entradas.every((e, i) => i === 0 || entradas[i - 1].fecha >= e.fecha), true);
afirmar("slugs únicos", new Set(entradas.map(e => e.slug)).size, entradas.length);
afirmar("toda entrada tiene gancho, cifra, firma y cta",
  entradas.filter(e => e.cuerpo.length >= 3 && e.cifra.fuente && e.firma && e.cita && e.cta).length,
  entradas.length);
afirmar("todo cta es una pregunta", entradas.filter(e => e.cta.includes("?")).length, entradas.length);

/* El lector tiene que abortar, no adivinar. Se le da basura a propósito. */
const tmp = path.join(CONTENIDO, "_prueba_temporal.md");
const buena = fs.readFileSync(path.join(CONTENIDO, fs.readdirSync(CONTENIDO).filter(f => f.endsWith(".md"))[0]), "utf8");
const conMutacion = (reemplazos, fn) => {
  let s = buena;
  reemplazos.forEach(([a, b]) => { s = s.replace(a, b); });
  fs.writeFileSync(tmp, s, "utf8");
  try { fn(); } finally { fs.unlinkSync(tmp); }
};

conMutacion([["area: datos", "area: inventada"]], () =>
  afirmarQueFalla("rechaza un área inexistente", () => leerEntrada(tmp), "área desconocida"));
conMutacion([["diagrama: cobertura", "diagrama: ninguno"]], () =>
  afirmarQueFalla("rechaza un diagrama inexistente", () => leerEntrada(tmp), "diagrama desconocido"));
conMutacion([[/^  fuente: .*$/m, "  fuente: \"\""]], () =>
  afirmarQueFalla("rechaza una cifra sin fuente", () => leerEntrada(tmp), "no declara"));
conMutacion([["denominador: 2117", "denominador: 1"]], () =>
  afirmarQueFalla("rechaza un denominador menor que el valor", () => leerEntrada(tmp), "no puede ser menor"));
conMutacion([[/^cta: .*$/m, "cta: Seguinos para no perderte nada."]], () =>
  afirmarQueFalla("rechaza un cierre que no es pregunta", () => leerEntrada(tmp), "pregunta"));
conMutacion([["---\nfecha:", "fecha:"]], () =>
  afirmarQueFalla("rechaza un archivo sin front-matter", () => leerEntrada(tmp), "front-matter"));

/* ── 2. Construir el sitio ────────────────────────────────────────── */
titulo("construir");
const r = construir();
const html = fs.readFileSync(path.join(RAIZ, "publico", "index.html"), "utf8");
afirmar("el marcador quedó reemplazado", html.includes("__ENTRADAS__"), false);
afirmar("inyectó todas las entradas", (html.match(/"slug":/g) || []).length, entradas.length);
afirmar("pide las dos tipografías",
  html.includes("Martian+Mono") && html.includes("Prompt:ital"), true);
afirmar("no quedó ninguna tipografía vieja",
  /Space\+Grotesk|IBM\+Plex|family=Inter/.test(html), false);
afirmar("declara el sustituto de tipografía", html.includes("Nota de tipograf"), true);
afirmar("sin tamaños en la banda prohibida 13-16 px",
  (html.split("<style>")[1].split("</style>")[0].match(/font-size: ?1[3-6](\.[0-9])?px/g) || []), []);

/* ── 3. Lo que el sitio renderiza ─────────────────────────────────── */
titulo("renderizar");
const js = html.match(/<script>([\s\S]*)<\/script>/)[1].split("const quieto = window.matchMedia")[0];
global.window = { matchMedia: () => ({ matches: false }) };
const ambito = {};
eval(js + "\nObject.assign(ambito, { vistaHome, vistaIndice, vistaEntrada, ordenCajon, cifraHTML, posicionPorProgreso, ENTRADAS, AREAS });");
const S = ambito;

const vistas = { home: S.vistaHome(), indice: S.vistaIndice(), "404": S.vistaEntrada("no-existe") };
S.ENTRADAS.forEach(e => vistas["entrada:" + e.slug] = S.vistaEntrada(e.slug));
const cuenta = (s, sub) => s.split(sub).length - 1;
const ETIQ = ["div", "section", "article", "p", "span", "ul", "li", "svg", "figure", "dl", "nav", "button"];
for (const k of Object.keys(vistas)) {
  const v = vistas[k], malos = [];
  if (!v || v.length < 200) malos.push("vacía");
  ["undefined", "NaN", "[object Object]"].forEach(m => { if (cuenta(v, m)) malos.push(m); });
  ETIQ.forEach(t => {
    const a = cuenta(v, "<" + t + " ") + cuenta(v, "<" + t + ">"), b = cuenta(v, "</" + t + ">");
    if (a !== b) malos.push(t + " " + a + "/" + b);
  });
  console.log((malos.length ? "FALLA  " : "ok     ") + k.padEnd(48) + String(v.length).padStart(7) + "  " + malos.join(", "));
  if (malos.length) fallos++;
}

titulo("el cajón");
const N = S.ENTRADAS.length;
const enPct = f => S.posicionPorProgreso(f * 1000, 1000, N);
afirmar("arranca cerrado", enPct(0), -1);
afirmar("abre la primera al 6 %", enPct(0.06), 0);
afirmar("el final abre la última", enPct(1), N - 1);
afirmar("nunca se pasa del final", enPct(1.6), N - 1);
afirmar("sin recorrido abre la primera", S.posicionPorProgreso(0, 0, N), 0);
const alcanzables = new Set();
for (let i = 0; i <= 1000; i++) { const k = enPct(i / 1000); if (k >= 0) alcanzables.add(k); }
afirmar("todas las carpetas son alcanzables", alcanzables.size, N);

const orden = S.ordenCajon();
const areasEnOrden = orden.map(i => S.ENTRADAS[i].area);
const bloques = areasEnOrden.filter((a, i) => i === 0 || a !== areasEnOrden[i - 1]);
afirmar("un bloque por área, no uno por entrada", bloques.length, new Set(areasEnOrden).size);
afirmar("un divisor por bloque", cuenta(vistas.indice, 'class="divisor"'), bloques.length);
afirmar("una carpeta por entrada", cuenta(vistas.indice, 'class="carpeta"'), N);

titulo("el dibujo dice lo mismo que la cifra");
const c0 = S.ENTRADAS[0].cifra;
const enc = cuenta(vistas.home, 'fill="#fafafa"'), apa = cuenta(vistas.home, 'fill="#333333"');
afirmar("cuadros encendidos = valor", enc, c0.valor);
afirmar("encendidos + apagados = denominador", enc + apa, c0.denominador);
S.ENTRADAS.forEach(e => {
  const conBarra = S.cifraHTML(e.cifra).includes("data-barra");
  const deberia = e.cifra.denominador > e.cifra.valor;
  afirmar("barra sólo si el denominador dice algo · " + e.slug.slice(0, 18), conBarra, deberia);
});

/* ── 4. Agregar una entrada es agregar un archivo ─────────────────── */
titulo("agregar una entrada no toca el diseño");
const disenoAntes = html.split("<script>")[0];
const nueva = buena
  .replace(/^titulo: .*$/m, "titulo: Entrada de prueba que se borra sola")
  .replace(/^fecha: .*$/m, "fecha: 2026-08-19")
  .replace(/^revision: .*$/m, 'revision: "99"');
fs.writeFileSync(tmp, nueva, "utf8");
try {
  const r2 = construir();
  const html2 = fs.readFileSync(path.join(RAIZ, "publico", "index.html"), "utf8");
  afirmar("la entrada nueva entra", r2.entradas.length, entradas.length + 1);
  afirmar("y queda primera por fecha", r2.entradas[0].titulo, "Entrada de prueba que se borra sola");
  afirmar("aparece en el cajón", (html2.match(/"slug":/g) || []).length, entradas.length + 1);
  afirmar("el diseño no cambió ni un byte", html2.split("<script>")[0] === disenoAntes, true);
} finally {
  fs.unlinkSync(tmp);
  construir();   /* deja el sitio como estaba */
}

/* ── 5. El validador ──────────────────────────────────────────────── */
titulo("el validador");
const verdad = fs.existsSync("D:/INFORMACION/MARCA PERSONAL/Marketing-OS/NUCLEO.md")
  ? fs.readFileSync("D:/INFORMACION/MARCA PERSONAL/Marketing-OS/NUCLEO.md", "utf8") : "";
afirmar("las entradas reales pasan",
  entradas.reduce((n, e) => n + validarEntrada(e, verdad).length, 0), 0);
const sucia = JSON.parse(JSON.stringify(entradas[0]));
sucia.cuerpo = sucia.cuerpo.concat(["Nuestro enfoque revolucionario tiene 94,7 % de acierto. Sumate a la beta."]);
const p = validarEntrada(sucia, verdad);
afirmar("caza el hype", p.some(x => x.includes("revolucionario")), true);
afirmar("caza la beta que no existe", p.some(x => x.includes("beta")), true);
afirmar("caza la cifra sin respaldo", p.some(x => x.includes("94,7")), true);
afirmar("los años no cuentan como cifra afirmada",
  cifrasAfirmadas("Rosario eliminó el FOT en 2008 y en 2026 sigue igual"), []);

console.log("");
console.log(fallos ? "═══ " + fallos + " PROBLEMA(S) ═══" : "═══ TODO OK ═══");
process.exit(fallos ? 1 : 0);
