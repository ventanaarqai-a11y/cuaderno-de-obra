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

## Qué falta

- Comprar `elcuadernodeobra.com` (~USD 10,44/año, Cloudflare Registrar) — está libre.
- Crear el repo remoto y conectarlo a Cloudflare Pages.
- La tarea de los viernes que deja el reporte en `reportes/`.
