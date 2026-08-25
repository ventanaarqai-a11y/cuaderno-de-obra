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

/* El lector tiene que abortar, no adivinar. Se le da basura a propósito.

   La base es una FIXTURE escrita acá, no un archivo real de contenido/.
   Antes se mutaba "el primer archivo que devolviera el sistema de archivos"
   y ese orden no está garantizado: cambió al reescribir el historial, la
   mutación dejó de reemplazar nada, y cuatro tests pasaron sin probar nada.
   Una fixture propia deja todo lo demás válido y aísla un guard por vez. */
const tmp = path.join(CONTENIDO, "_prueba_temporal.md");
const buena = [
  "---",
  "fecha: 2026-01-02",
  "semana: 1",
  'revision: "01"',
  "area: datos",
  "titulo: Entrada de prueba",
  "resumen: Existe sólo para que las mutaciones tengan de dónde partir.",
  "firma: Nadie",
  "cita: Una cita cualquiera.",
  "diagrama: cobertura",
  "cifra:",
  "  valor: 32",
  "  denominador: 2117",
  "  unidad: municipios",
  "  que_mide: Algo medible",
  "  fuente: contenido/_fixture",
  "checklist:",
  "  - hecho: Un ítem",
  "cta: ¿Una pregunta?",
  "---",
  "",
  "Un párrafo.",
  "",
  "Otro párrafo.",
  "",
  "Un tercero, para que el cuerpo tenga tres.",
  ""
].join("\n");

/* Si la fixture no fuera válida, todo lo de abajo probaría otra cosa. */
fs.writeFileSync(tmp, buena, "utf8");
try {
  const f = leerEntrada(tmp);
  afirmar("la fixture base es válida (si no, no se prueba nada)", f.cuerpo.length, 3);
} finally { fs.unlinkSync(tmp); }
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
/* La declaración de que Martian Mono es un SUSTITUTO de Oficía MONO salió
   del pie visible el 2026-08-21 —le hablaba a quien mantiene el sitio, no a
   quien lo lee, y ocupaba cinco líneas— pero no puede desaparecer: el día
   que se compre la licencia hay que saber qué se está reemplazando. Vive en
   el comentario del bloque de tokens y se verifica ahí. */
afirmar("declara que la mono es un sustituto",
  /SUSTITUIDA por[\s\S]{0,120}Martian Mono/.test(html) && html.includes("Oficía"), true);

/* El giro a papel del 2026-08-21. Un token del mundo oscuro que sobreviva
   deja texto invisible sin que nadie se entere, y el rename tocó 99 usos
   repartidos entre el <style> y los generadores de SVG del <script>: se
   revisa el archivo ENTERO, no sólo la hoja de estilos. */
afirmar("ningún token del mundo oscuro sobrevive",
  (html.match(/--(negro|panel|fondo-2|tinta-[2-6])(?![\w-])/g) || []), []);
afirmar("ni un hex del mundo oscuro en los diagramas",
  (html.match(/#(fafafa|333333|161616|111111|3d3d3d|2a2a2a|555555|888888|aaaaaa|1c1c1c|0d0d0d|050505|000000)\b/gi) || []), []);
afirmar("el cuerpo se pinta papel", html.includes("background: var(--papel);"), true);

/* La vista previa: lo que se ve al compartir el link antes de que nadie
   entre. Se rompe en silencio de tres formas y las tres tienen su aserción:
   que falte un tag, que og:image sea relativa (el archivo local se ve bien y
   el crawler no la encuentra), y que el PNG no exista o no mida 1200x630. */
titulo("la vista previa al compartir el link");
const cabeza = html.split("</head>")[0];
[["description", /<meta name="description" content="[^"]{60,}"/],
 ["og:title", /<meta property="og:title" content="[^"]{10,}"/],
 ["og:description", /<meta property="og:description" content="[^"]{60,}"/],
 ["og:url", /<meta property="og:url" content="https:\/\//],
 ["og:type", /<meta property="og:type"/],
 ["og:image:alt", /<meta property="og:image:alt" content="[^"]{20,}"/],
 ["twitter:card", /content="summary_large_image"/]
].forEach(([que, re]) => afirmar("declara " + que.padEnd(16), re.test(cabeza), true));

/* Absolutas, no relativas. Es LA falla clásica de una vista previa. */
(html.match(/(?:og|twitter):image" content="([^"]+)"/g) || []).forEach(m => {
  const url = m.match(/content="([^"]+)"/)[1];
  afirmar("la imagen se pide absoluta", /^https:\/\//.test(url), true);
});

/* Y que el archivo exista de verdad, con la medida que piden las plataformas.
   Un meta tag apuntando a un PNG que no está es peor que no tener el tag:
   el crawler pide, no encuentra, y la tarjeta sale vacía. */
const OG = path.join(RAIZ, "publico", "og.png");
afirmar("la imagen existe en publico/", fs.existsSync(OG), true);
if (fs.existsSync(OG)) {
  const b = fs.readFileSync(OG);
  /* Las dimensiones viven en el chunk IHDR de todo PNG, bytes 16-24. */
  /* El PNG se renderiza a @2x para que no se vea blando en pantallas
     retina: mide 2400x1260 fisicos y las plataformas lo escalan al 1200x630
     que declaran los meta. La proporcion es lo que tiene que dar 1,905. */
  afirmar("mide 2400x1260 (el 1200x630 a @2x)", [b.readUInt32BE(16), b.readUInt32BE(20)], [2400, 1260]);
  afirmar("y respeta la proporcion 1.91:1",
    Math.abs(b.readUInt32BE(16) / b.readUInt32BE(20) - 1200 / 630) < 0.01, true);
  afirmar("pesa menos de 1 MB", b.length < 1024 * 1024, true);
}

/* El pie es la única forma de contacto que tiene el sitio: el cuaderno existe
   para que haya gente esperando cuando abra la beta. Un href vacío, un `#` o
   un placeholder sin reemplazar lo rompe sin que nadie se entere. */
const pie = html.split('<footer')[1] || "";
afirmar("el pie tiene las tres formas de contacto",
  (pie.match(/href="(https?:\/\/|mailto:)[^"]+"/g) || []).length, 3);
afirmar("ningún link del pie quedó sin completar",
  /href="(#|\s*|__[A-Z]+__|\.\.\.)"/.test(pie), false);
afirmar("la hoja es hueso, no blanco puro", html.includes("--papel:    #FAF9F5;"), true);
afirmar("la tinta es negra cálida, no negro puro", html.includes("--tinta:     #141413;"), true);

/* Los alfas .45 y .25 NO pasan AA sobre el papel (2,95:1 y 1,73:1, medidos):
   existen para puntos, tramas y contornos. Si alguno aterriza en una regla
   de `color`, eso es texto ilegible. El piso para texto es --tinta-62. */
/* El lookbehind es necesario: sin él, `text-decoration-color: var(--tinta-45)`
   cazaba como si fuera texto. El color de un subrayado no es texto pintado, y
   un test que se pone rojo por algo que no dice medir es tan inútil como uno
   que se queda verde. */
afirmar("ningún texto pintado con un alfa que no pasa AA",
  (html.split("<style>")[1].split("</style>")[0].match(/(?<![-\w])color: var\(--tinta-(45|25)\)/g) || []), []);
afirmar("sin tamaños en la banda prohibida 13-16 px",
  (html.split("<style>")[1].split("</style>")[0].match(/font-size: ?1[3-6](\.[0-9])?px/g) || []), []);

/* CINCO TAMAÑOS Y NADA MÁS: 9 · 12 · 19 · 30 · 48, cada salto ≥ 1,33.

   Medido el 2026-08-21 contra cuatro referencias: el PICO —el elemento
   mayor dividido por el cuerpo— vive entre 1,6 y 2,4 en rerun, antimetal,
   every.to y pragmaticengineer. Esta página estaba en 9,4 con DOCE tamaños
   y cinco pares que se diferenciaban menos del 15 %: dos escalones que
   nadie distingue no son jerarquía, son ruido.

   Se revisan el <style> Y los estilos escritos a mano en el <script>: la
   mitad de los tamaños sueltos vivían en atributos `style=` del JS, que la
   aserción de la banda prohibida no mira. Los `clamp()` se verifican por su
   MÁXIMO, que es lo que se ve en escritorio; el mínimo puede ser cualquier
   valor de la escala hacia abajo. */
const ESCALA = [9, 12, 19, 30, 48];
const tamanosDeclarados = texto => {
  const sueltos = [...texto.matchAll(/font-size: ?([0-9.]+)px/g)].map(m => +m[1]);
  const topes = [...texto.matchAll(/clamp\(\s*([0-9.]+)px\s*,[^,]+,\s*([0-9.]+)px\s*\)/g)]
    .flatMap(m => [+m[1], +m[2]]);
  return [...new Set(sueltos.concat(topes))].sort((a, b) => a - b);
};
const estilos = html.split("<style>")[1].split("</style>")[0];
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
afirmar("cinco tamaños y nada más, en el CSS",
  tamanosDeclarados(estilos).filter(t => !ESCALA.includes(t)), []);
afirmar("cinco tamaños y nada más, también en el JS",
  tamanosDeclarados(script).filter(t => !ESCALA.includes(t)), []);

/* ── 3. Lo que el sitio renderiza ─────────────────────────────────── */
titulo("renderizar");
const js = html.match(/<script>([\s\S]*)<\/script>/)[1].split("const quieto = window.matchMedia")[0];
global.window = { matchMedia: () => ({ matches: false }) };
const ambito = {};
eval(js + "\nObject.assign(ambito, { vistaHome, vistaIndice, vistaEntrada, ordenCajon, cifraHTML, posicionPorProgreso, svgCobertura, diagramaDe, ENTRADAS, AREAS });");
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
afirmar("arranca con la primera abierta", enPct(0), 0);
afirmar("y sigue en la primera al 6 %", enPct(0.06), 0);
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

/* `cuaderno-diseno` §3: una lámina lleva rótulo, escala, cotas Y cuadro de
   referencias — la leyenda es lo que convierte una trama de símbolos en algo
   que alguien del rubro entiende sin preguntar. Dos de las cuatro láminas se
   publicaron meses sin ella. Esto pone la regla en un test en vez de en la
   buena voluntad: se ejerce CADA diagrama, no el que toca hoy. */
titulo("ninguna lámina se publica sin leyenda");
const DIAGRAMAS = ["cobertura", "agentes", "pipeline", "estados"];
const cifraFalsa = { valor: 32, denominador: 2117, unidad: "municipios",
                     que_mide: "Fabricada acá", fuente: "pruebas.js" };
DIAGRAMAS.forEach(d => {
  const html = S.diagramaDe({ diagrama: d, cifra: cifraFalsa });
  const refs = html.split('class="lamina-refs"')[1] || "";
  const simbolos = (refs.match(/class="ref-[a-z]+"/g) || []).length;
  afirmar("la lámina de " + d.padEnd(10) + " declara sus símbolos", simbolos >= 2, true);
  afirmar("la lámina de " + d.padEnd(10) + " trae lectura y fuente",
    html.includes("Lectura —") && /Fuentes? —/.test(html), true);
});

titulo("el dibujo dice lo mismo que la cifra");
/* La entrada que USA el campo, no «la más reciente». Antes decía
   ENTRADAS[0] y funcionaba de casualidad: la última entrada era la de
   cobertura. El ensayo de la rutina del lunes lo destapó — al entrar una
   entrada nueva con `diagrama: estados` y denominador 3, `svgCobertura`
   abortaba con «el campo dibuja 2117 celdas y la cifra declara 3» y la
   suite entera se ponía roja. O sea: cualquier semana cuya entrada no
   fuera de cobertura habría bloqueado la publicación del lunes. */
const entradaCobertura = S.ENTRADAS.find(e => e.diagrama === "cobertura");
afirmar("hay una entrada que usa el campo de cobertura", !!entradaCobertura, true);
const c0 = entradaCobertura.cifra;

/* Los 2.085 apagados dejaron de ser 2.085 rectángulos y pasaron a ser UN
   elemento con patrón, así que ya no se pueden contar de a uno. Se afirma
   lo mismo por otra vía: los encendidos se cuentan, y el denominador se lee
   de la GEOMETRÍA del campo — cuántas celdas entran en el rectángulo.

   Y se ejerce el GENERADOR con una cifra fabricada distinta de la real: un
   test que lee el artefacto ya construido pasa aunque el generador esté
   roto, y ese falso verde ya ocurrió en este repo. */
const celdasDelCampo = svg => {
  const pat = svg.match(/<pattern[^>]*width="([\d.]+)" height="([\d.]+)"/);
  const campo = svg.match(/<rect[^>]*width="([\d.]+)" height="([\d.]+)" fill="url\(#apagados\)"/);
  if (!pat || !campo) return null;
  return Math.round(campo[1] / pat[1]) * Math.round(campo[2] / pat[2]);
};
const encendidos = svg => cuenta(svg, 'fill="var(--tinta)"/>');

const fabricada = { valor: 500, denominador: 2117, unidad: "municipios",
                    que_mide: "Fabricada acá para que no pueda pasar de casualidad", fuente: "pruebas.js" };
const svgF = S.svgCobertura(fabricada);
afirmar("el generador dibuja tantos encendidos como valor", encendidos(svgF), 500);
afirmar("y el campo cubre exactamente el denominador", celdasDelCampo(svgF), 2117);

const svgR = S.svgCobertura(c0);
afirmar("la entrada real: encendidos = valor", encendidos(svgR), c0.valor);
afirmar("la entrada real: campo = denominador", celdasDelCampo(svgR), c0.denominador);
/* Y que el campo haya llegado a la PAGINA de esa entrada. Mirar la home
   solo funcionaba mientras la entrada de cobertura fuera la mas reciente. */
afirmar("y el campo llegó a la página",
  celdasDelCampo(vistas["entrada:" + entradaCobertura.slug]), c0.denominador);

/* La optimización, afirmada y no narrada: el SVG entero son los encendidos
   más el rectángulo del campo y la celda del patrón. Antes eran 2.117. */
afirmar("un nodo por municipio medido, no uno por municipio",
  cuenta(svgR, "<rect"), c0.valor + 2);

/* Si la grilla y la cifra dejaran de coincidir, el dibujo diría otra cosa
   que el texto. Tiene que abortar, no dibujar de más. */
afirmarQueFalla("aborta si el campo no cubre el denominador",
  () => S.svgCobertura({ valor: 32, denominador: 2118 }), "no puede decir otra cosa");

/* ── El pie de la lámina ──────────────────────────────────────────────
   Un plano lleva rótulo, escala, cotas Y CUADRO DE REFERENCIAS: sin la
   leyenda, un cuadro lleno y uno vacío no significan nada para quien llega.
   Y la fuente tiene que ser algo que el lector pueda abrir — el pie decía
   `docs/ESTADO_Y_PRIORIDADES.md §Fase E`, la ruta de un repo privado. */
/* De la página de la entrada que USA el campo, no de la home. La home
   muestra la entrada más reciente, y en cuanto entra una de otro diagrama
   —que es lo normal— estas cuatro aserciones miran una lámina que no es la
   que dicen mirar. Lo destapó el ensayo de la rutina del lunes: dos se
   pusieron rojas por eso y habrían bloqueado la publicación de la semana. */
const laminaCobertura = vistas["entrada:" + entradaCobertura.slug].split('class="lamina"')[1] || "";
afirmar("la lámina de cobertura declara sus referencias",
  cuenta(laminaCobertura, 'class="ref-lleno"') === 1 && cuenta(laminaCobertura, 'class="ref-vacio"') === 1, true);
afirmar("los dos números de la leyenda suman el denominador",
  (laminaCobertura.match(/— ([\d.]+)</g) || []).slice(0, 2)
    .map(x => +x.replace(/[^\d]/g, "")).reduce((a, b) => a + b, 0), c0.denominador);
afirmar("la lámina dice qué NO es el campo",
  laminaCobertura.includes("no es geográfica"), true);
afirmar("la fuente con URL se renderiza como link",
  /Fuentes — <a href="https?:\/\//.test(laminaCobertura), true);
afirmar("y el análisis va en su propia línea, no mezclado con la fuente",
  laminaCobertura.includes("Análisis — ") && !laminaCobertura.includes("Fuentes — Relevamiento"), true);
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
