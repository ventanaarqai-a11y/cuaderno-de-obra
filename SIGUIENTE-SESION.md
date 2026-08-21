# El Cuaderno de Obra — para arrancar la próxima sesión

Este archivo existe para que una sesión nueva no tenga que reconstruir el acuerdo.
El prompt copiable está al final.

---

## Qué es

Boletín público semanal donde VENTANA registra su propia construcción. Vive en
`elcuadernodeobra.com`, se publica con un `git push` (Cloudflare Pages sirve `publico/`)
y mide con Cloudflare Web Analytics. **No es una landing de venta**: no hay beta ni
usuarios, y cada entrada cierra con una pregunta, nunca con "solicitá acceso".

Repo: `D:\INFORMACION\MARCA PERSONAL\cuaderno-de-obra` — rama `main`, limpia, `b759c85`.

## Dónde quedó

| | estado |
|---|---|
| Sitio en vivo, dominio, DNS | ✅ funcionando |
| 5 entradas publicadas | ✅ |
| Captura de correo (`POST /suscribir` → Resend) | ✅ 33 pruebas, verificado en el navegador |
| Skills `cuaderno-diseno` y `cuaderno-escritura` | ✅ escritas y al día |
| **El giro a papel** | 🟡 **maqueta verificada, NO aplicada al sitio** |
| El diagrama de cobertura optimizado | 🟡 probado en la maqueta, no en el sitio |
| Fase 3 — el correo del lunes | ❌ no empezada |
| Skill de lectura de métricas | ❌ no empezada |

## Lo abierto, en orden

1. **Aplicar el papel al sitio real.** `plantilla/base.html` sigue en negro
   (`--negro:#000000`, `--tinta:#ffffff`, línea 21). La maqueta aprobada está en
   `C:\Users\marce\OneDrive\Desktop\VENTANA\propuestas-ui\cuaderno-papel.html`:
   fondo `#FAF9F5`, tinta `#141413`, cuerpo 19px/1.6, medida 60-66ch, titular 62px/1.05
   con tracking negativo. Todo eso está escrito en `cuaderno-diseno` §2 y §2bis.
2. **Seguir afinando el background.** Es lo que el dueño quiere mirar de nuevo: hoy la
   maqueta tiene papel liso y él pidió "blanco con líneas negras". La grilla de líneas
   todavía no está resuelta.
3. **Llevar la optimización del diagrama al sitio.** Medido: la lámina son **39 nodos**
   contra los **2.117 rects** que el sitio sirve hoy — el 93% del DOM.
4. **Renombrar "entradas"** (al dueño no le gusta la palabra). Propuestas sobre la mesa:
   *partes*, *asientos*, *fojas*.
5. **Fase 3 — el correo del lunes**: se genera del mismo `.md` de la entrada, nunca se
   escribe aparte, y **nunca sale sin revisión del dueño**. Sumar el conteo de suscriptos
   al reporte del viernes.

## Reglas duras — ya se pagaron, no se rediscuten

- **Un solo lector de entradas** (`leer.js`). Nada de copias divergentes.
- **Ninguna cifra sin `valor`, `denominador`, `unidad`, `que_mide` y `fuente`.** `validar.js`
  es la puerta y aborta con `archivo:línea`.
- **Verde no es evidencia.** Cualquier prueba nueva se verifica rompiendo lo que dice
  proteger. En este repo ya hubo cuatro falsos verdes.
- **Ningún secreto en el repo ni en el chat.** `RESEND_API_KEY` vive como secreto del Worker.
- **`assets` se sirve primero**; sólo `/suscribir` va al Worker. Agregar código no puede
  romper una página que ya anda.
- **Tipos prohibidos entre 13 y 16px** (`cuaderno-diseno`). Es la banda ilegible.

## Comandos

```bash
node validar.js && node construir.js && node pruebas.js
```

```bash
node pruebas-worker.mjs
```

## Salvedades honestas

- La maqueta de papel **no está verificada en móvil**: el último intento de achicar el
  viewport a 375px devolvió `vw:1280`, o sea que no redimensionó. Hay que rehacerlo.
- La maqueta usa **Martian Mono** como reemplazo libre de **Oficía MONO**, que todavía no
  tiene licencia web comprada. Los dos son mono, pero no son la misma letra.

## Del lado del dueño

- Borrar de Resend los dos contactos de prueba (los dos terminan en `@ejemplo.com`).
- Verificar si Resend **deduplica**: `prueba-borrar@ejemplo.com` se mandó 6 veces y las 6
  respondieron 200. Si crea duplicados, un suscripto recibiría el correo dos veces.
- Comprar la licencia web de Oficía MONO.

---

## Prompt para pegar en la sesión nueva

> Trabajo en **El Cuaderno de Obra**, el boletín público de VENTANA
> (`elcuadernodeobra.com`). El repo es `D:\INFORMACION\MARCA PERSONAL\cuaderno-de-obra`
> y está limpio en `main`.
>
> Antes de tocar nada, leé `SIGUIENTE-SESION.md` del repo, y cargá las skills
> `cuaderno-diseno` y `cuaderno-escritura`
> (`C:\Users\marce\OneDrive\Desktop\VENTANA\.claude\skills\`).
>
> **La tarea de hoy es el diseño, y sólo el diseño.** El sitio en vivo sigue en fondo
> negro y quiero pasarlo a papel. La maqueta que ya aprobé está en
> `C:\Users\marce\OneDrive\Desktop\VENTANA\propuestas-ui\cuaderno-papel.html` — abrila
> primero y trabajá desde ahí.
>
> En este orden:
> 1. Aplicá el papel a `plantilla/base.html` sin que cambie nada de la estructura.
> 2. **Afiná el background**: quiero blanco con líneas negras, no papel liso. Mostrame
>    dos o tres variantes antes de elegir.
> 3. Revisá interlineado y tipografía contra lo que dice `cuaderno-diseno` §2bis.
> 4. Verificá en móvil de verdad (375px) — la última vez no redimensionó y quedó sin probar.
>
> Cerrá con `node validar.js && node construir.js && node pruebas.js` en verde, y
> mostrame capturas antes de proponer el commit. **No publiques sin que yo lo vea.**
