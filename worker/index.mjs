/* ===================================================================
   worker/index.js — el único código que corre en el servidor.

   El sitio sigue siendo archivos estáticos: Cloudflare los sirve PRIMERO
   y sólo llama acá cuando ninguna ruta coincide. Es decir, este archivo
   no puede romper una página que ya funciona: sólo atiende lo que antes
   daba 404.

   Hace una sola cosa: recibir un correo y anotarlo en la lista de Resend.
   =================================================================== */

const ORIGEN = "https://elcuadernodeobra.com";
const ORIGENES_OK = [ORIGEN, "https://www.elcuadernodeobra.com"];

/* Los previews viven en *.workers.dev; se permiten para poder probar
   antes de mergear, pero nunca un origen cualquiera. */
const esOrigenPermitido = origen =>
  !!origen && (ORIGENES_OK.includes(origen) || /^https:\/\/[a-z0-9-]+\.workers\.dev$/.test(origen));

const json = (datos, estado, origen) =>
  new Response(JSON.stringify(datos), {
    status: estado,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(esOrigenPermitido(origen) ? { "access-control-allow-origin": origen } : {})
    }
  });

/* Validación deliberadamente simple. No se intenta adivinar si la casilla
   existe —eso no se puede saber sin mandarle algo— sólo que tenga forma de
   correo. El largo tiene tope porque un campo sin tope es una invitación. */
function correoValido(valor) {
  if (typeof valor !== "string") return false;
  const v = valor.trim();
  if (v.length < 6 || v.length > 254) return false;
  if (/\s/.test(v)) return false;
  const partes = v.split("@");
  if (partes.length !== 2) return false;
  const [usuario, dominio] = partes;
  if (!usuario || usuario.length > 64) return false;
  if (!dominio.includes(".") || dominio.startsWith(".") || dominio.endsWith(".")) return false;
  if (dominio.includes("..")) return false;
  return /^[^@\s]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(v);
}

async function anotar(correo, env) {
  /* Si falta la configuración, se grita. Lo peor que puede pasar acá es
     responder "listo" y perder el correo de alguien que quiso anotarse. */
  if (!env.RESEND_API_KEY) throw new Error("falta el secreto RESEND_API_KEY en el Worker");
  if (!env.RESEND_AUDIENCE_ID) throw new Error("falta la variable RESEND_AUDIENCE_ID en el Worker");

  const r = await fetch(
    "https://api.resend.com/audiences/" + env.RESEND_AUDIENCE_ID + "/contacts",
    {
      method: "POST",
      headers: {
        authorization: "Bearer " + env.RESEND_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({ email: correo, unsubscribed: false })
    }
  );

  if (r.ok) return "anotado";

  const cuerpo = await r.text();
  /* Anotarse dos veces no es un error para quien lo hace. */
  if (r.status === 409 || /already exists|duplicate/i.test(cuerpo)) return "ya estaba";
  throw new Error("Resend respondió " + r.status + ": " + cuerpo.slice(0, 200));
}

export default {
  async fetch(peticion, env) {
    const url = new URL(peticion.url);
    const origen = peticion.headers.get("origin");

    if (url.pathname !== "/suscribir") {
      /* Cualquier otra cosa que llegue hasta acá es una ruta que no existe:
         los archivos del sitio se sirven antes y nunca pasan por este código. */
      return new Response("No existe", { status: 404 });
    }

    if (peticion.method === "OPTIONS") {
      return new Response(null, {
        status: esOrigenPermitido(origen) ? 204 : 403,
        headers: esOrigenPermitido(origen)
          ? {
              "access-control-allow-origin": origen,
              "access-control-allow-methods": "POST, OPTIONS",
              "access-control-allow-headers": "content-type",
              "access-control-max-age": "86400"
            }
          : {}
      });
    }

    if (peticion.method !== "POST") {
      return json({ ok: false, mensaje: "Método no permitido." }, 405, origen);
    }

    /* Sólo desde el sitio. Sin esto, el formulario es de cualquiera. */
    if (!esOrigenPermitido(origen)) {
      return json({ ok: false, mensaje: "Origen no permitido." }, 403, origen);
    }

    let datos;
    try {
      datos = await peticion.json();
    } catch {
      return json({ ok: false, mensaje: "No pude leer el formulario." }, 400, origen);
    }

    /* Trampa para robots: un campo que una persona nunca ve ni completa.
       Si viene lleno, se responde que sí y no se anota nada — un robot que
       recibe un error reintenta; uno que recibe un OK se va. */
    if (datos && typeof datos.web === "string" && datos.web.trim() !== "") {
      return json({ ok: true, estado: "anotado" }, 200, origen);
    }

    const correo = typeof datos?.correo === "string" ? datos.correo.trim().toLowerCase() : "";
    if (!correoValido(correo)) {
      return json(
        { ok: false, mensaje: "Eso no parece un correo. Fijate que tenga un @ y un punto." },
        400,
        origen
      );
    }

    try {
      const estado = await anotar(correo, env);
      return json({ ok: true, estado }, 200, origen);
    } catch (err) {
      /* El motivo real va al registro del Worker, no a la pantalla del
         visitante: un mensaje de error de una API es información nuestra. */
      console.error("suscripcion fallida:", err.message);
      return json(
        { ok: false, mensaje: "Algo se rompió de mi lado. Probá de nuevo en un minuto." },
        502,
        origen
      );
    }
  }
};
