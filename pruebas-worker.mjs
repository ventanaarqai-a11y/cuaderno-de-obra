/* ===================================================================
   pruebas-worker.mjs — el endpoint de suscripción, sin desplegar nada.
   Uso:  node pruebas-worker.mjs

   Se le llama al `fetch` del Worker con peticiones armadas a mano y se
   afirma qué responde. Resend se reemplaza por un doble que registra
   lo que se le pidió: así se puede verificar que NUNCA se anota a nadie
   en los casos que deben rechazarse, sin tocar la lista real.
   =================================================================== */
import worker from "./worker/index.mjs";

const ORIGEN = "https://elcuadernodeobra.com";
let fallos = 0;

const afirmar = (que, obtenido, esperado) => {
  const bien = JSON.stringify(obtenido) === JSON.stringify(esperado);
  console.log((bien ? "ok     " : "FALLA  ") + que.padEnd(52) +
              JSON.stringify(obtenido) + (bien ? "" : "   esperado " + JSON.stringify(esperado)));
  if (!bien) fallos++;
};
const titulo = t => console.log("\n── " + t + " " + "─".repeat(Math.max(0, 56 - t.length)));

/* Doble de Resend: registra las llamadas y no sale a internet. */
function prepararResend({ estado = 200, cuerpo = "{}" } = {}) {
  const llamadas = [];
  globalThis.fetch = async (url, opciones) => {
    llamadas.push({ url: String(url), cuerpo: JSON.parse(opciones.body || "{}") });
    return new Response(cuerpo, { status: estado });
  };
  return llamadas;
}

const ENV = { RESEND_API_KEY: "clave-de-prueba", RESEND_AUDIENCE_ID: "lista-de-prueba" };

const pedir = (cuerpo, { metodo = "POST", origen = ORIGEN, ruta = "/suscribir" } = {}) =>
  worker.fetch(
    new Request("https://elcuadernodeobra.com" + ruta, {
      method: metodo,
      headers: { "content-type": "application/json", ...(origen ? { origin: origen } : {}) },
      body: metodo === "POST" ? JSON.stringify(cuerpo) : undefined
    }),
    ENV
  );

/* ── 1. Un correo válido se anota ─────────────────────────────────── */
titulo("el camino feliz");
{
  const llamadas = prepararResend();
  const r = await pedir({ correo: "marcelo@ejemplo.com" });
  const datos = await r.json();
  afirmar("responde 200", r.status, 200);
  afirmar("dice que quedó anotado", datos, { ok: true, estado: "anotado" });
  afirmar("llamó a Resend una vez", llamadas.length, 1);
  afirmar("le mandó el correo correcto", llamadas[0]?.cuerpo.email, "marcelo@ejemplo.com");
  afirmar("usó la lista configurada", llamadas[0]?.url.includes("lista-de-prueba"), true);
  afirmar("permite el origen del sitio", r.headers.get("access-control-allow-origin"), ORIGEN);
}

/* ── 2. Correos que no deben anotarse ─────────────────────────────── */
titulo("lo que se rechaza (y no llega a la lista)");
for (const [valor, caso] of [
  ["marcelo@gmial", "sin punto en el dominio"],
  ["sin-arroba.com", "sin arroba"],
  ["", "vacío"],
  ["   ", "sólo espacios"],
  ["a@b.c d@e.fg", "dos correos pegados"],
  ["marcelo@@ejemplo.com", "dos arrobas"],
  ["marcelo@ejemplo..com", "punto doble"],
  ["marcelo@.ejemplo.com", "dominio que arranca con punto"],
  ["a".repeat(70) + "@ejemplo.com", "usuario larguísimo"],
  ["a@" + "b".repeat(250) + ".com", "dominio larguísimo"],
  /* Estos dos pasan TODOS los chequeos previos y sólo los caza la regla
     final. Sin ellos, aflojar esa regla no rompía ninguna prueba: los
     casos abortaban antes en otro guard, que es un falso verde. */
  ["marcelo@ejemplo.c", "dominio de una sola letra al final"],
  ["marcelo@ejem_plo.com", "guión bajo en el dominio"]
]) {
  const llamadas = prepararResend();
  const r = await pedir({ correo: valor });
  const bien = r.status === 400 && llamadas.length === 0;
  console.log((bien ? "ok     " : "FALLA  ") + ("rechaza: " + caso).padEnd(52) +
              r.status + (llamadas.length ? "  PERO LO ANOTÓ" : ""));
  if (!bien) fallos++;
}

/* ── 3. Robots y orígenes ajenos ──────────────────────────────────── */
titulo("robots y orígenes ajenos");
{
  const llamadas = prepararResend();
  const r = await pedir({ correo: "robot@spam.com", web: "http://spam.example" });
  afirmar("al robot le responde que sí", r.status, 200);
  afirmar("pero NO lo anota", llamadas.length, 0);
}
{
  const llamadas = prepararResend();
  const r = await pedir({ correo: "alguien@ejemplo.com" }, { origen: "https://sitio-ajeno.com" });
  afirmar("rechaza un origen ajeno", r.status, 403);
  afirmar("y no anota nada", llamadas.length, 0);
}
{
  const r = await pedir({ correo: "a@b.com" }, { origen: null });
  afirmar("rechaza una petición sin origen", r.status, 403);
}
/* Esto lo encontró el navegador, no curl: el origen de un preview lleva
   DOS etiquetas antes de la cuenta, y la primera regla sólo aceptaba una.
   Con curl no aparecía porque el origen se mandaba a mano. */
{
  prepararResend();
  const r = await pedir({ correo: "a@b.com" },
    { origen: "https://feat-suscripcion-cuaderno-de-obra.ventanaarq-ai.workers.dev" });
  afirmar("acepta el preview de una rama", r.status, 200);
}
{
  const llamadas = prepararResend();
  const r = await pedir({ correo: "a@b.com" }, { origen: "https://otro-usuario.workers.dev" });
  afirmar("rechaza un workers.dev de otra cuenta", r.status, 403);
  afirmar("y no anota nada", llamadas.length, 0);
}
{
  const r = await pedir({ correo: "a@b.com" }, { origen: "https://ventanaarq-ai.workers.dev.malo.com" });
  afirmar("rechaza un dominio que sólo lo imita", r.status, 403);
}
{
  const r = await pedir({}, { metodo: "GET" });
  afirmar("un GET a /suscribir no anota", r.status, 405);
}
{
  const r = await pedir({}, { metodo: "GET", ruta: "/cualquier-otra-cosa" });
  afirmar("otra ruta devuelve 404", r.status, 404);
}

/* ── 4. Fallos: nunca decir "listo" si no se anotó ────────────────── */
titulo("cuando algo se rompe, no miente");
{
  prepararResend({ estado: 500, cuerpo: "boom" });
  const r = await pedir({ correo: "marcelo@ejemplo.com" });
  const datos = await r.json();
  afirmar("si Resend falla, responde error", r.status, 502);
  afirmar("y NO dice que quedó anotado", datos.ok, false);
}
{
  prepararResend({ estado: 409, cuerpo: '{"message":"Contact already exists"}' });
  const r = await pedir({ correo: "marcelo@ejemplo.com" });
  const datos = await r.json();
  afirmar("anotarse dos veces no es un error", r.status, 200);
  afirmar("y lo dice", datos.estado, "ya estaba");
}
{
  prepararResend();
  const r = await worker.fetch(
    new Request("https://elcuadernodeobra.com/suscribir", {
      method: "POST", headers: { origin: ORIGEN, "content-type": "application/json" },
      body: JSON.stringify({ correo: "marcelo@ejemplo.com" })
    }),
    { RESEND_AUDIENCE_ID: "lista" }   /* sin la clave */
  );
  afirmar("sin la clave configurada, falla ruidoso", r.status, 502);
}
{
  prepararResend();
  const r = await worker.fetch(
    new Request("https://elcuadernodeobra.com/suscribir", {
      method: "POST", headers: { origin: ORIGEN, "content-type": "application/json" },
      body: "esto no es json"
    }),
    ENV
  );
  afirmar("un cuerpo ilegible no rompe el Worker", r.status, 400);
}

/* ── 5. Normalización ─────────────────────────────────────────────── */
titulo("normalización");
{
  const llamadas = prepararResend();
  await pedir({ correo: "  Marcelo@Ejemplo.COM  " });
  afirmar("guarda en minúsculas y sin espacios", llamadas[0]?.cuerpo.email, "marcelo@ejemplo.com");
}

console.log("");
console.log(fallos ? "═══ " + fallos + " PROBLEMA(S) ═══" : "═══ TODO OK ═══");
process.exit(fallos ? 1 : 0);
