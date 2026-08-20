/* ===================================================================
   validar.js — la puerta antes de publicar
   Uso:  node validar.js            (todas las entradas)
         node validar.js <archivo>  (una sola)

   Sale con código 1 si algo no pasa. Es lo que impide que un número sin
   fuente, o una promesa que no existe, llegue a la página.

   Qué NO hace: no juzga si la entrada está bien escrita. Eso es criterio
   y vive en la skill `cuaderno-escritura`; acá sólo están las reglas que
   se pueden verificar sin opinar.
   =================================================================== */
const fs = require("fs");
const path = require("path");
const { leerTodas, leerEntrada } = require("./leer.js");

const NUCLEO = "D:/INFORMACION/MARCA PERSONAL/Marketing-OS/NUCLEO.md";
const CONTENT_TS = "C:/dev/VENTANA/web/src/lib/content.ts";

/* De voice.md. Se comparan en minúsculas y sin acentos. */
const VOCABULARIO_PROHIBIDO = [
  "revolucionario", "game-changer", "game changer", "disrupcion", "disruptivo",
  "al siguiente nivel", "soluciones inmobiliarias", "ia que reemplaza",
  "sumate a la beta", "escribi probar", "backtesteado", "backtesteados",
  "garantizamos", "precision del", "accuracy"
];

/* Promesas que hoy son falsas: no hay beta abierta ni usuarios externos. */
const PROMESAS_FALSAS = ["beta abierta", "proba la beta", "acceso anticipado", "lista de espera"];

const sinAcentos = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function fuentesDeVerdad() {
  const textos = [];
  for (const f of [NUCLEO, CONTENT_TS]) {
    if (fs.existsSync(f)) textos.push(fs.readFileSync(f, "utf8"));
    else textos.push("__FALTA__" + f);
  }
  return textos.join("\n");
}

/* Un número "de afirmación": 100 o más, con decimales, o con porcentaje.
   Los conteos chicos de la prosa ("seis fuentes", "dos ciudades") son
   narración, no una cifra publicada, y marcarlos volvería inútil esto. */
function cifrasAfirmadas(texto) {
  const encontradas = new Set();
  const re = /\d[\d.,]*\s?%|\d[\d.,]{2,}|\d+[.,]\d+/g;
  let m;
  while ((m = re.exec(texto)) !== null) {
    const crudo = m[0].trim();
    const n = Number(crudo.replace(/\s?%$/, "").replace(/\./g, "").replace(",", "."));
    if (Number.isFinite(n) && n >= 1900 && n <= 2100 && !crudo.includes("%")) continue; /* años */
    encontradas.add(crudo);
  }
  return [...encontradas];
}

function normalizarNumero(s) {
  return s.replace(/\s?%$/, "").replace(/[.,]/g, "");
}

function validarEntrada(e, verdad) {
  const problemas = [];
  const textoVisible = [e.titulo, e.resumen, e.cita, e.cta, ...e.cuerpo,
                        ...e.checklist.map(i => i.texto)].join("\n");
  const plano = sinAcentos(textoVisible);

  /* 1. Vocabulario prohibido y promesas que no existen. */
  VOCABULARIO_PROHIBIDO.forEach(t => {
    if (plano.includes(sinAcentos(t))) problemas.push('vocabulario prohibido: "' + t + '"');
  });
  PROMESAS_FALSAS.forEach(t => {
    if (plano.includes(sinAcentos(t))) problemas.push('promete algo que no existe: "' + t + '"');
  });

  /* 2. Cada cifra afirmada tiene que estar respaldada. */
  const propias = new Set([String(e.cifra.valor), String(e.cifra.denominador)].map(normalizarNumero));
  cifrasAfirmadas(textoVisible).forEach(c => {
    const n = normalizarNumero(c);
    if (propias.has(n)) return;
    if (normalizarNumero(verdad).includes(n)) return;
    problemas.push("cifra sin respaldo: " + c + " — no está en NUCLEO.md, ni en content.ts, ni es la cifra de la entrada");
  });

  /* 3. La cifra de la entrada declara su fuente y su denominador (leer.js ya
        lo exige, pero se repite acá porque este archivo es la puerta). */
  if (!e.cifra.fuente) problemas.push("la cifra no declara fuente");
  if (!e.cifra.denominador) problemas.push("la cifra no declara denominador");

  return problemas;
}

function validar(objetivo) {
  const verdad = fuentesDeVerdad();
  const faltantes = [NUCLEO, CONTENT_TS].filter(f => !fs.existsSync(f));
  const entradas = objetivo ? [leerEntrada(objetivo)] : leerTodas();

  let total = 0;
  const informe = entradas.map(e => {
    const p = validarEntrada(e, verdad);
    total += p.length;
    return { entrada: e, problemas: p };
  });
  return { informe, total, faltantes };
}

if (require.main === module) {
  let r;
  try {
    r = validar(process.argv[2]);
  } catch (err) {
    console.error("\nNO SE PUDO LEER: " + err.message + "\n");
    process.exit(1);
  }

  r.faltantes.forEach(f => console.log("aviso   no encuentro la fuente de verdad " + f + " — se valida con lo que hay"));

  r.informe.forEach(({ entrada, problemas }) => {
    console.log((problemas.length ? "RECHAZA " : "ok      ") + entrada.slug);
    problemas.forEach(p => console.log("           " + p));
  });

  console.log("");
  if (r.total) {
    console.log(r.total + " problema(s). No se publica.");
    process.exit(1);
  }
  console.log("Las " + r.informe.length + " entradas pasan. Se puede publicar.");
}

module.exports = { validar, validarEntrada, cifrasAfirmadas, VOCABULARIO_PROHIBIDO, PROMESAS_FALSAS };
