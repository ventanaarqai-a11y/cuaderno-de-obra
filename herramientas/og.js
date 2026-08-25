/* ===================================================================
   og.js — genera publico/og.png, la imagen de vista previa.

   Es lo que se ve al compartir el link en X, LinkedIn o WhatsApp, ANTES
   de que nadie entre. Hasta el 2026-08-24 el sitio no tenía ninguna, ni
   un solo meta tag: compartirlo no mostraba una imagen rota, no mostraba
   nada.

   Uso:  node herramientas/og.js

   POR QUÉ ESTO NO ES PARTE DE construir.js
   El repo es Node puro, sin una sola dependencia, y esa propiedad vale:
   `construir.js` corre en cualquier lado sin instalar nada. Renderizar un
   PNG necesita un navegador, así que esta herramienta pide Playwright y
   se corre A MANO cuando cambia la marca. El PNG resultante se commitea.
   Si Playwright no está, el sitio se construye igual — sólo no se puede
   regenerar la imagen.

   POR QUÉ UNA SOLA IMAGEN Y NO UNA POR ENTRADA
   El sitio rutea por hash (`#/entrada/slug`) y el fragmento no se manda
   al servidor: los crawlers de X, LinkedIn y WhatsApp leen SIEMPRE la
   portada. Una imagen por entrada no llegaría a verse. Para tenerla hay
   que sacar el ruteo por hash primero, y eso es una fase aparte.
   =================================================================== */
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const SALIDA = path.join(RAIZ, "publico", "og.png");
const ANCHO = 1200, ALTO = 630;   /* la medida que piden las tres plataformas */

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error(
    "Falta Playwright, que es lo único que esta herramienta necesita.\n" +
    "  npm install --no-save playwright && npx playwright install chromium\n" +
    "El sitio se construye igual sin esto: `construir.js` no lo importa.");
  process.exit(1);
}

/* El mismo sistema del sitio: papel, tinta, la mono y el fondo pautado.
   Los tamaños son mayores que los del sitio a propósito — esto se mira
   como miniatura en un feed, no como una página. */
const PAGINA = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Martian+Mono:wdth,wght@75..112.5,300..800&family=Prompt:ital,wght@0,300;0,400;0,500&display=swap">
<style>
  :root {
    --papel: #FAF9F5; --papel-2: #F2F1EA; --linea: #DDDDD6;
    --tinta: #141413; --tinta-70: rgba(20,20,19,.70); --tinta-62: rgba(20,20,19,.62);
    --tinta-25: rgba(20,20,19,.25); --bordo: #6E2233;
    --grafico: "Martian Mono", monospace; --lectura: "Prompt", sans-serif;
  }
  * { box-sizing: border-box; margin: 0; }
  body {
    width: ${ANCHO}px; height: ${ALTO}px; overflow: hidden;
    background: var(--papel); color: var(--tinta);
    font-family: var(--lectura); font-weight: 300;
    -webkit-font-smoothing: antialiased;
    background-image:
      repeating-linear-gradient(to right,  rgba(20,20,19,.055) 0 1px, transparent 1px 96px),
      repeating-linear-gradient(to bottom, rgba(20,20,19,.055) 0 1px, transparent 1px 96px),
      repeating-linear-gradient(to bottom, rgba(20,20,19,.045) 0 1px, transparent 1px 32px);
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 46px 72px 44px; position: relative;
  }
  /* El margen del cuaderno, igual que en el sitio. */
  .margen { position: absolute; left: 46px; top: 0; bottom: 0; width: 1px; background: rgba(110,34,51,.28); }
  .rot { font-family: var(--grafico); font-weight: 400; font-size: 15px;
         letter-spacing: .30em; text-transform: uppercase; color: var(--tinta-62); }
  h1 { font-family: var(--grafico); font-weight: 700; font-variation-settings: "wdth" 75;
       text-transform: uppercase; font-size: 76px; line-height: 1.0; letter-spacing: -.03em; }
  .bajada { font-size: 24px; line-height: 1.5; max-width: 52ch; color: var(--tinta-70); margin-top: 18px; }
  .pie { display: flex; justify-content: space-between; align-items: flex-end; gap: 40px; }
  .frase { font-family: var(--grafico); font-weight: 500; font-size: 17px;
           letter-spacing: .12em; text-transform: uppercase; color: var(--tinta); }
  .sitio { font-family: var(--grafico); font-size: 17px; letter-spacing: .10em; color: var(--tinta-62); }
  /* El campo de municipios: la MISMA grilla que la lámina del sitio,
     73 x 29 = 2.117 celdas exactas. En la primera versión lo achiqué a
     28 x 26 = 728 para que entrara en una esquina, y el rótulo seguía
     diciendo 2.117: el dibujo decía otra cosa que el texto. Va como banda
     al pie, que es donde entra a paso completo. */
  .campo { position: relative; width: 1022px; height: 232px; margin-top: 26px;
    background-image: radial-gradient(circle at 1.5px 1.5px, var(--tinta-25) 1.4px, transparent 1.5px);
    background-size: 14px 8px; }
  .campo i { position: absolute; width: 6px; height: 6px; background: var(--tinta); display: block; }
  .campo-rot { font-family: var(--grafico); font-size: 13px; letter-spacing: .16em;
    text-transform: uppercase; color: var(--tinta-62); margin-top: 14px; }
</style></head>
<body>
  <div class="margen"></div>
  <div>
    <p class="rot">Registro público de VENTANA</p>
    <h1>El Cuaderno de Obra</h1>
    <p class="bajada">Cómo se construye un diagnóstico de timing inmobiliario en LATAM. Una entrada por semana, con lo hecho y lo pendiente.</p>
    <div class="campo" id="campo"></div>
    <p class="campo-rot">Un cuadro = un municipio argentino · 32 de 2.117 con precio de mercado medido</p>
  </div>
  <div class="pie">
    <span class="frase">Construyendo a conciencia, en público</span>
    <span class="sitio">elcuadernodeobra.com</span>
  </div>
  <script>
    /* Las mismas 32 posiciones que dibuja el sitio, con el mismo paso
       coprimo: la imagen y la lámina cuentan lo mismo. */
    (function () {
      var campo = document.getElementById("campo");
      var COLS = 73, FILAS = 29, PASO = 997, DEN = 2117, frag = document.createDocumentFragment();
        if (COLS * FILAS !== DEN) throw new Error("el campo dibujaria " + (COLS*FILAS) + " celdas y el rotulo dice " + DEN);
      for (var i = 0, p = 7; i < 32; i++, p = (p + PASO) % DEN) {
        var m = document.createElement("i");
        m.style.left = ((p % COLS) / COLS * 100).toFixed(2) + "%";
        m.style.top = (Math.floor(p / COLS) / FILAS * 100).toFixed(2) + "%";
        frag.appendChild(m);
      }
      campo.appendChild(frag);
    })();
  </script>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: ANCHO, height: ALTO }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.setContent(PAGINA, { waitUntil: "networkidle" });

  /* Las dos tipografías tienen que haber cargado DE VERDAD. Si el render
     sale con la fuente de respaldo, la imagen queda mal para siempre y no
     hay forma de notarlo mirando el PNG meses después. */
  await page.waitForFunction(
    () => document.fonts.check('700 76px "Martian Mono"') && document.fonts.check('300 24px "Prompt"'),
    null, { timeout: 15000 }
  ).catch(() => { throw new Error("las tipografías no cargaron: la imagen saldría con la fuente de respaldo"); });

  await page.screenshot({ path: SALIDA });
  await browser.close();

  const { size } = fs.statSync(SALIDA);
  console.log("publico/og.png  " + ANCHO + "x" + ALTO + " (@2x)  " +
              (size / 1024).toFixed(0) + " KB");
  if (size > 1024 * 1024) console.error("AVISO: pasa 1 MB, algunas plataformas lo descartan.");
})();
