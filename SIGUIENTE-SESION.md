# El Cuaderno de Obra — para arrancar la próxima sesión

Este archivo existe para que una sesión nueva no tenga que reconstruir el acuerdo.
El prompt copiable está al final.

---

## Qué es

Boletín público semanal donde VENTANA registra su propia construcción. Vive en
`elcuadernodeobra.com`, se publica con un `git push` (Cloudflare Pages sirve `publico/`)
y mide con Cloudflare Web Analytics. **No es una landing de venta**: no hay beta ni
usuarios, y cada entrada cierra con una pregunta, nunca con "solicitá acceso".

Repo: `D:\INFORMACION\MARCA PERSONAL\cuaderno-de-obra` — rama `main`.

## Dónde quedó

| | estado |
|---|---|
| Sitio en vivo, dominio, DNS | ✅ funcionando |
| 5 entradas publicadas | ✅ |
| Captura de correo (`POST /suscribir` → Resend) | ✅ verificado en el navegador |
| **El giro a papel** | ✅ **PUBLICADO el 2026-08-21 — `edd9ec6`, verificado en elcuadernodeobra.com** |
| El fondo (cuaderno pautado) | ✅ elegido entre 5 variantes y aplicado |
| El cajón como carpeta manila + pestaña bordeaux | ✅ |
| El diagrama optimizado (2.117 nodos → 34) | ✅ con su test rehecho |
| El pie con redes (LinkedIn, X) y correo de contacto | ✅ | |
| La estructura (jerarquía, ejes, escala) | ✅ **aplicada: pico 9,4 → 2,5, ejes 3 → 1, tamaños 12 → 5** |
| El pie de la lámina con leyenda, link y autoría | ✅ y el modelo de contenido ganó `fuente_url` y `analisis` |
| La imagen de vista previa y sus meta tags | ✅ `publico/og.png` + el bloque entero, que no existía |
| Las láminas: las cuatro con cuadro de referencias | ✅ con test que ejerce cada diagrama |
| **La cadena viernes → lunes** | ✅ **conectada y ensayada de punta a punta** |
| Fase 3 — el correo del lunes | ❌ no empezada |

## Lo que se hizo el 2026-08-21

**El papel, aplicado de verdad al sitio.** El rename tocó 99 usos de token repartidos entre
el `<style>` y los generadores de SVG del `<script>`. Dos aserciones nuevas en `pruebas.js`
impiden que sobreviva un token o un hex del mundo oscuro en cualquier parte del archivo.

**Los alfas de tinta se corrigieron por contraste medido, no por gusto.** El sistema viejo
pintaba rótulos de 9 px con el equivalente a `--tinta-45` = **2,95:1**, que no pasa AA. El
piso para texto ahora es `--tinta-62` = **5,07:1**, y hay un test que se pone rojo si un
`color:` aterriza en `--tinta-45` o `--tinta-25`.

**Tres bugs que la verificación destapó, ninguno buscado:**

1. **El generador de posiciones del campo sólo podía producir 252 de 2.117 celdas.** Era un
   LCG multiplicativo (`s = s*48271 % 2117`); su órbita desde `s=7` mide 252. Con
   `valor > 252` el `while` no terminaba nunca y **colgaba la construcción del sitio**. Ahora
   es un paso coprimo (997) que recorre el campo entero y no puede no terminar.
2. **A 375 px el índice tenía scroll horizontal** (543 px de ancho). Las pestañas del cajón
   medían 364 px y nada las acotaba. Era preexistente: lo tenía que haber cazado la
   verificación de móvil que nunca se hizo.
3. **La ficha del cajón se comía el puntero.** Abierta, se montaba encima de las carpetas con
   `pointer-events:auto`: no se podía llegar a ninguna otra carpeta y había que volver al tope
   de la página. Ahora sale **por debajo** de la pila y no intercepta nada.

**La estructura, medida contra cuatro referencias.** El dueño marcó que VENTANA se veía
enorme al lado de un titular más importante y que las palabras quedaban desparramadas. Se
midió en vivo a 1280 px:

| | pico | ejes de titular | tamaños |
|---|---|---|---|
| **El Cuaderno** | **9,4** | **3** | **12** |
| antimetal.com | 2,3 | 2 | 9 |
| rerun.io/blog | 2,3 | 1 | 5 |
| every.to | 2,4 | 5 | 12 |
| pragmaticengineer | 1,6 | 0 | 5 |

*Pico* = tamaño del elemento mayor ÷ cuerpo. Las referencias caen entre 1,6 y 2,4; el
cuaderno está 4× afuera, y lo que domina es el nombre del producto, no lo que se lee.
La propuesta completa está en `propuestas-ui/cuaderno-estructura.html`.

## Lo que se hizo el 2026-08-24

**La vista previa al compartir el link.** El sitio no tenía **ni un** meta tag: ni `og:`, ni
`twitter:`, ni `description`. Compartirlo no mostraba una imagen rota — no mostraba nada.
Ahora tiene el bloque entero y `publico/og.png`, que genera `herramientas/og.js` con
Playwright y se commitea. **No es parte de `construir.js` a propósito**: el repo es Node puro
sin una sola dependencia y esa propiedad vale.

Es **una** imagen para todo el sitio, no una por entrada, y el motivo es estructural: el sitio
rutea por hash y el fragmento no viaja al servidor, así que el crawler lee siempre la portada.
Una por entrada necesita sacar el ruteo por hash primero.

**La cadena viernes → lunes, conectada.** `herramientas/preparar-publicacion.js` mueve el
borrador, valida, construye, corre la suite, y **si algo falla deshace todo**. La tarea
`cuaderno-publicar-lunes` (lunes 09:15) lo invoca y avisa. **No hay `git push` en ningún
paso**: publicar sigue siendo un comando de Marcelo. La revisión humana la garantiza la
estructura, no la memoria.

**El viernes ya no puede fallar callado.** Corrió el 2026-08-24 y no dejó ni un archivo, con
material disponible. Ahora tiene que escribir el reporte SIEMPRE, decir en él por qué no hay
borrador si no lo hay, y cerrar con un bloque de estado verificable que es lo que lee el lunes.

**El ensayo encontró cuatro defectos que habrían roto la publicación todos los lunes**, y
ninguno se veía leyendo el código:

1. El guard de "repo limpio" no excluía el buzón — y el viernes deja ahí su borrador sin
   commitear, así que la rutina habría abortado siempre.
2. Un test tomaba `ENTRADAS[0]` y le exigía la cifra del campo de cobertura: **cualquier
   entrada de otro diagrama ponía la suite en rojo**.
3. Otras cuatro aserciones miraban la portada creyendo ver esa misma lámina.
4. Un test estaba clavado a la fecha `2026-08-19` y caducaba con la primera entrada posterior.

**Las cuatro entradas viejas** mostraban como fuente la ruta de un repo privado. Sus cifras son
mediciones del propio proyecto —4 corridas de CI en rojo, 12 agentes, 28 mutaciones, 25
commits— así que **no hay URL pública que linkear**: ahora dicen qué se midió y quién lo midió,
sin inventarles un link.

## Lo abierto, en orden

1. **Commitear y publicar.** Todo está verde, verificado y medido, pero **sin commitear**. El
   sitio en vivo sigue negro. Es lo único que falta para que exista.
3. **La imagen OG no existe.** Se sacó del índice el bloque que la mostraba (era una nota de
   trabajo interna en una vista pública) y con él `ogHTML()`, que quedaba sin llamador. Pero
   **el sitio sigue sin imagen de vista previa**: al compartir el link en X, LinkedIn o
   WhatsApp no se ve nada. Es un pendiente de marca, no de código.
4. **Las cuatro entradas viejas siguen sin `fuente_url`.** Sólo la W34 tiene link. Las otras
   cuatro renderizan `Fuente — <ruta de repo>`, que para un lector externo no sirve.
5. **Las láminas de `agentes`, `pipeline` y `estados` tienen lectura pero no referencias.**
   Sólo `cobertura` tiene la leyenda completa.
6. **Renombrar "entradas"** (al dueño no le gusta la palabra): *partes*, *asientos*, *fojas*.
7. **Fase 3 — el correo del lunes**: se genera del mismo `.md`, nunca se escribe aparte, y
   nunca sale sin revisión del dueño.

## Anotado para OTROS proyectos, explícitamente NO para el cuaderno

El dueño pidió explorar estos diagramas como **motion en Claude Design**, o como **carrusel**,
para explicaciones más largas — y aclaró que **no es para este blog**. Acá no entra: una entrada
semanal se lee en dos minutos y una animación pide quedarse. Va al backlog de marca, no al del
cuaderno.

## Reglas duras — ya se pagaron, no se rediscuten

- **Un solo lector de entradas** (`leer.js`). Nada de copias divergentes.
- **Ninguna cifra sin `valor`, `denominador`, `unidad`, `que_mide` y `fuente`.** `validar.js`
  es la puerta y aborta con `archivo:línea`.
- **Verde no es evidencia.** Cualquier prueba nueva se verifica rompiendo lo que dice proteger.
  El barrido de hoy: **16 de 16 mutaciones cazadas por la aserción correcta**.
- **La nota de tipografía salió del pie visible** pero la declaración de que Martian Mono es
  un SUSTITUTO de Oficía MONO vive en el comentario del bloque de tokens, con su test.
- **El texto vive en `--tinta-62` o más oscuro.** `.45` y `.25` son para puntos y tramas.
- **El bordeaux sólo aparece en cuatro lugares** (§2 de `cuaderno-diseno`). No viaja.
- **El dibujo dice lo mismo que la cifra**, y el generador aborta si el campo no cubre el
  denominador.
- **Ningún secreto en el repo ni en el chat.** `RESEND_API_KEY` vive como secreto del Worker.
- **Tipos prohibidos entre 13 y 16 px.** Es la banda ilegible.

## Comandos

```bash
node validar.js && node construir.js && node pruebas.js
```

Para mirar el sitio y las propuestas (dos servidores, en `.claude/launch.json` de VENTANA):
`cuaderno` en el puerto 8940 y `propuestas-ui` en el 8931.

## Salvedades honestas

- El papel **está publicado y verificado en vivo**: fondo `rgb(250,249,245)`, pico 2,5 a 1280 y
  1,6 a 375, sin scroll horizontal, consola limpia, las dos tipografías cargando de verdad.
- La maqueta usa **Martian Mono** como reemplazo libre de **Oficía MONO**, que todavía no tiene
  licencia web comprada. Los dos son mono, pero no son la misma letra.
- El cierre de la ficha al sacar el puntero está verificado **a mano en el navegador**, no por
  un test de la suite: `pruebas.js` corre sin navegador y no puede ejercer eventos de puntero.

## Del lado del dueño

- Las tres decisiones de estructura del punto 2.
- Borrar de Resend los dos contactos de prueba (los dos terminan en `@ejemplo.com`).
- Verificar si Resend **deduplica**: `prueba-borrar@ejemplo.com` se mandó 6 veces y las 6
  respondieron 200. Si crea duplicados, un suscripto recibiría el correo dos veces.
- Comprar la licencia web de Oficía MONO.

---

## Prompt para pegar en la sesión nueva

> Trabajo en **El Cuaderno de Obra**, el boletín público de VENTANA
> (`elcuadernodeobra.com`). El repo es `D:\INFORMACION\MARCA PERSONAL\cuaderno-de-obra`.
>
> Antes de tocar nada, leé `SIGUIENTE-SESION.md` del repo y cargá las skills
> `cuaderno-diseno` y `cuaderno-escritura`
> (`C:\Users\marce\OneDrive\Desktop\VENTANA\.claude\skills\`).
>
> **El giro a papel ya está aplicado y verificado, pero sin commitear: el sitio en vivo sigue
> en negro.** Lo que falta es la ESTRUCTURA. Abrí
> `C:\Users\marce\OneDrive\Desktop\VENTANA\propuestas-ui\cuaderno-estructura.html` —ahí está la
> medición contra cuatro referencias y las tres decisiones pendientes— y arrancá preguntándome
> esas tres.
>
> Con eso decidido:
> 1. Aplicá la estructura a `plantilla/base.html` y **volvé a medir el pico** para confirmar
>    que entró en la banda 2–3. La medición no se estima: se corre con un navegador real.
> 2. Sumale a la lámina el **cuadro de referencias** y la línea de lectura.
> 3. Verificá a 1280 y a 375 px de verdad — afirmá `window.innerWidth` antes de sacar la
>    captura, y que no haya scroll horizontal en ninguna vista.
>
> Cerrá con `node validar.js && node construir.js && node pruebas.js` en verde y **el barrido de
> mutación**: un verde que no se pone rojo al romper lo que dice proteger no vale.
> Mostrame capturas antes de proponer el commit. **No publiques sin que yo lo vea.**
