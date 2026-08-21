# El Cuaderno de Obra

Boletín público donde VENTANA registra su construcción, semana a semana.
**No es una landing de venta**: no hay beta ni usuarios, y el cierre de cada entrada es una
pregunta al lector, nunca "solicitá acceso".

## Cómo se agrega una entrada

Se agrega **un archivo**, y nada más:

```
contenido/AAAA-Www-slug.md
```

Con front-matter y el cuerpo en markdown, un párrafo por bloque. El diseño no se toca: hay una
prueba que verifica que agregar una entrada no cambia ni un byte del HTML anterior al `<script>`.

Para escribir el texto, usar la skill **`cuaderno-escritura`** (gancho, giro, cierre y CTA).
Para tocar el diseño, la skill **`cuaderno-diseno`**.

## Comandos

```bash
node validar.js      # la puerta: cifras sin fuente, hype, promesas que no existen
node construir.js    # arma publico/index.html desde contenido/*.md
node pruebas.js      # la suite completa, sin navegador
```

El orden de trabajo es siempre: **validar → construir → probar → commit**. El commit es la
publicación: Cloudflare Pages sirve `publico/` en cada push.

## Estructura

| Carpeta | Qué es |
|---|---|
| `reportes/` | Buzón. Acá cae el reporte que se genera solo los viernes desde `C:\dev\VENTANA` |
| `contenido/` | Una entrada publicada por archivo |
| `plantilla/base.html` | El diseño. Tiene el marcador `/*__ENTRADAS__*/[]` donde se inyecta el contenido |
| `publico/` | Lo único que se sirve. Se genera; no se edita a mano |

`leer.js` es la única lectura de entradas: lo usan el generador, el validador y las pruebas,
para que no existan tres copias que después divergen.

## Reglas duras

1. **Ninguna cifra sin fuente.** `valor`, `denominador`, `unidad`, `que_mide` y `fuente` son
   obligatorios; sin eso el archivo no se lee siquiera.
2. **`NUCLEO.md` es la única fuente de números.** El validador rechaza cualquier cifra
   afirmada que no esté ahí, en `content.ts`, o que no sea la cifra de la entrada.
3. **Nada de hype ni de promesas que no existen.** No hay beta: el validador rechaza
   "sumate a la beta" y similares.
4. **Nada se publica sin que Marcelo lo revise.**
5. **Acá nunca entran datos sensibles.** Por eso este repo está separado de `Marketing-OS`,
   que guarda análisis reales.

## Dónde vive

**https://elcuadernodeobra.com** (y `www`). Dominio registrado en Hostinger, DNS y hosting en
Cloudflare. Publicar es un `git push` a `main`; cada rama tiene su propia URL de vista previa,
así que un cambio se puede ver en vivo antes de tocar producción.

La tarea de los viernes deja el reporte de la semana y un borrador de entrada en `reportes/`.
Va ahí y no a `contenido/` a propósito: así nada se publica por accidente.

## La suscripción

El sitio tiene **una sola ruta con código**: `POST /suscribir`, en `worker/index.mjs`.
Todo lo demás son archivos, y Cloudflare los sirve primero — por eso agregar el endpoint no
puede romper una página que ya funciona.

```bash
node pruebas-worker.mjs    # el endpoint, sin desplegar nada
```

Las pruebas reemplazan Resend por un doble que registra las llamadas, así se verifica que
**nunca se anota a nadie** en los casos que deben rechazarse, sin tocar la lista real.

### Lo que hace falta configurar una sola vez

El deploy es por Git, así que el secreto se carga en el panel, no con `wrangler`:

**Workers & Pages → `cuaderno-de-obra` → Settings → Variables and Secrets**, tipo *Secret*,
nombre `RESEND_API_KEY`. **La clave nunca va al repositorio.**

El id de la lista sí vive en `wrangler.jsonc` → `vars.RESEND_AUDIENCE_ID`: identifica, no
autoriza.

**Si falta cualquiera de los dos, el endpoint falla ruidoso y lo dice en el registro.** Es a
propósito: lo peor que puede pasar es responder "listo" y perder el correo de alguien que
quiso anotarse.
