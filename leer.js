/* ===================================================================
   leer.js — carga las entradas desde contenido/*.md
   Lo usan el generador, el validador y las pruebas: una sola lectura,
   no tres copias que después divergen.

   Formato de una entrada: front-matter entre --- y el cuerpo en
   markdown, con un párrafo por bloque separado por línea en blanco.

   Todo lo que falta o no se entiende ABORTA con el nombre del archivo
   y la línea. Un default silencioso acá es una entrada publicada mal.
   =================================================================== */
const fs = require("fs");
const path = require("path");

const AREAS = { datos: "Datos", agentes: "Agentes", infra: "Infraestructura", producto: "Producto" };
const DIAGRAMAS = ["cobertura", "agentes", "pipeline", "estados"];
const ESTADOS = ["hecho", "pendiente", "bloqueado"];
const OBLIGATORIOS = ["fecha", "semana", "revision", "area", "titulo", "resumen",
                      "firma", "cita", "diagrama", "cifra", "checklist", "cta"];
const CIFRA_OBLIGATORIA = ["valor", "denominador", "unidad", "que_mide", "fuente"];

class ErrorDeEntrada extends Error {
  constructor(archivo, linea, mensaje) {
    super(archivo + (linea ? ":" + linea : "") + " — " + mensaje);
    this.name = "ErrorDeEntrada";
  }
}

/* Un escalar: número si lo parece, texto si viene entre comillas JSON,
   texto crudo si no. No adivina booleanos: acá no se usan. */
function escalar(bruto) {
  const s = bruto.trim();
  if (s.startsWith('"')) {
    try { return JSON.parse(s); } catch { return s.slice(1, -1); }
  }
  if (/^-?\d+$/.test(s)) return Number(s);
  return s;
}

function partirFrontMatter(texto, archivo) {
  const lineas = texto.replace(/\r\n/g, "\n").split("\n");
  if (lineas[0].trim() !== "---") throw new ErrorDeEntrada(archivo, 1, "falta el front-matter (--- en la primera línea)");
  const cierre = lineas.indexOf("---", 1);
  if (cierre < 0) throw new ErrorDeEntrada(archivo, 1, "el front-matter no cierra con ---");
  return { cabecera: lineas.slice(1, cierre), cuerpo: lineas.slice(cierre + 1).join("\n") };
}

function parsearCabecera(lineas, archivo) {
  const meta = {};
  let clave = null;      /* la clave abierta que está recibiendo hijos */

  lineas.forEach((linea, i) => {
    const nro = i + 2;
    if (!linea.trim() || linea.trim().startsWith("#")) return;

    const hijoLista = linea.match(/^ {2}- ([a-z_]+): ([\s\S]*)$/);
    const hijoMapa  = linea.match(/^ {2}([a-z_]+): ([\s\S]*)$/);
    const raiz      = linea.match(/^([a-z_]+):[ ]?([\s\S]*)$/);

    if (hijoLista) {
      if (!Array.isArray(meta[clave])) throw new ErrorDeEntrada(archivo, nro, "hay un ítem de lista sin una clave de lista abierta");
      meta[clave].push({ estado: hijoLista[1], texto: escalar(hijoLista[2]) });
    } else if (hijoMapa) {
      if (!clave || typeof meta[clave] !== "object" || Array.isArray(meta[clave]))
        throw new ErrorDeEntrada(archivo, nro, "hay una clave anidada sin un objeto abierto");
      meta[clave][hijoMapa[1]] = escalar(hijoMapa[2]);
    } else if (raiz) {
      clave = raiz[1];
      const valor = raiz[2].trim();
      if (valor === "") meta[clave] = clave === "checklist" ? [] : {};
      else meta[clave] = escalar(raiz[2]);
    } else {
      throw new ErrorDeEntrada(archivo, nro, "línea que no se entiende: " + JSON.stringify(linea));
    }
  });
  return meta;
}

function validarForma(e, archivo) {
  OBLIGATORIOS.forEach(k => {
    if (e[k] === undefined || e[k] === "" ) throw new ErrorDeEntrada(archivo, null, "falta el campo obligatorio `" + k + "`");
  });
  if (!AREAS[e.area]) throw new ErrorDeEntrada(archivo, null, "área desconocida: " + e.area + " (válidas: " + Object.keys(AREAS).join(", ") + ")");
  if (!DIAGRAMAS.includes(e.diagrama)) throw new ErrorDeEntrada(archivo, null, "diagrama desconocido: " + e.diagrama + " (válidos: " + DIAGRAMAS.join(", ") + ")");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.fecha)) throw new ErrorDeEntrada(archivo, null, "fecha con formato inválido: " + e.fecha);

  /* La regla de la cifra: sin fuente y sin denominador, no se renderiza. */
  CIFRA_OBLIGATORIA.forEach(k => {
    if (e.cifra[k] === undefined || e.cifra[k] === "") throw new ErrorDeEntrada(archivo, null, "la cifra no declara `" + k + "`");
  });
  if (typeof e.cifra.valor !== "number" || typeof e.cifra.denominador !== "number")
    throw new ErrorDeEntrada(archivo, null, "valor y denominador de la cifra tienen que ser números");
  if (e.cifra.denominador < e.cifra.valor)
    throw new ErrorDeEntrada(archivo, null, "el denominador (" + e.cifra.denominador + ") no puede ser menor que el valor (" + e.cifra.valor + ")");

  /* `fuente` dice de dónde salió el número; `fuente_url` deja que el lector
     lo compruebe, y `analisis` dice quién lo compiló. Son tres cosas
     distintas y no se colapsan: reemplazar la procedencia por la firma es
     exactamente lo que este producto existe para no hacer.

     Los dos nuevos son opcionales —hay cifras que salen de un archivo del
     repo y no de una publicación— pero si `fuente_url` viene, tiene que ser
     una URL de verdad. Una ruta de repo en un campo que el sitio va a
     renderizar como link le promete al lector algo que no puede abrir. */
  if (e.cifra.fuente_url !== undefined && !/^https?:\/\/[^\s]+$/.test(e.cifra.fuente_url))
    throw new ErrorDeEntrada(archivo, null, "`fuente_url` tiene que ser una URL http(s), y vino: " + e.cifra.fuente_url);

  if (!e.checklist.length) throw new ErrorDeEntrada(archivo, null, "el checklist está vacío");
  e.checklist.forEach(it => {
    if (!ESTADOS.includes(it.estado)) throw new ErrorDeEntrada(archivo, null, "estado desconocido en el checklist: " + it.estado);
  });
  if (!e.cuerpo.length) throw new ErrorDeEntrada(archivo, null, "el cuerpo está vacío");
  if (!String(e.cta).includes("?")) throw new ErrorDeEntrada(archivo, null, "el cierre tiene que ser una pregunta (ver la skill cuaderno-escritura §5)");
}

function leerEntrada(rutaArchivo) {
  const archivo = path.basename(rutaArchivo);
  const { cabecera, cuerpo } = partirFrontMatter(fs.readFileSync(rutaArchivo, "utf8"), archivo);
  const e = parsearCabecera(cabecera, archivo);
  e.cuerpo = cuerpo.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  e.slug = archivo.replace(/\.md$/, "").toLowerCase();
  validarForma(e, archivo);
  return e;
}

/* Todas las entradas, la más reciente primero. Con la fecha empatada
   desempata la revisión, que es lo que ordena dos entradas del mismo día. */
function leerTodas(dir) {
  const carpeta = dir || path.join(__dirname, "contenido");
  const archivos = fs.readdirSync(carpeta).filter(f => f.endsWith(".md")).sort();
  if (!archivos.length) throw new Error("no hay ninguna entrada en " + carpeta);
  return archivos.map(f => leerEntrada(path.join(carpeta, f)))
                 .sort((a, b) => b.fecha.localeCompare(a.fecha) || String(b.revision).localeCompare(String(a.revision)));
}

module.exports = { leerEntrada, leerTodas, AREAS, DIAGRAMAS, ESTADOS, ErrorDeEntrada };
