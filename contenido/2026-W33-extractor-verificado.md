---
fecha: 2026-08-12
semana: 33
revision: "02"
area: datos
titulo: Le metí veintiocho errores a propósito a mi propio sistema
resumen: Un test en verde no prueba nada. La única forma de saber si sirve es romperlo y ver si se da cuenta.
firma: Marcelo Acurio
cita: Las veintiocho cayeron. Si alguna hubiese quedado en verde, ese test estaba de adorno y yo no lo sabía.
diagrama: pipeline
cifra:
  valor: 28
  denominador: 28
  unidad: mutaciones
  que_mide: Defectos inyectados a propósito que los tests detectaron
  fuente: docs/ESTADO_Y_PRIORIDADES.md §Fase C
checklist:
  - hecho: Transcripción por modelo con verificación literal
  - hecho: 28 de 28 mutaciones detectadas
  - hecho: Claves de municipio validadas contra el padrón oficial
  - hecho: "Moneda local: sin esto no emite en 5 de 6 países"
cta: ¿Vos cómo sabés que tus controles de calidad controlan algo? ¿Alguna vez rompiste algo a propósito para verlos fallar?
---
Le inyecté veintiocho errores a propósito a mi propio sistema, uno por uno, para ver si los controles se daban cuenta.

El motivo: hasta esta semana, leer una fuente nueva significaba escribir un programa a medida para ese sitio. Con doce agentes y seis países, ese método no termina nunca. El reemplazo tiene dos mitades: el modelo transcribe lo que dice el documento, y después una comparación literal exige que cada número extraído aparezca tal cual en el texto original. Si no aparece, no se guarda. El modelo no puede aportar una cifra que el documento no tenga.

El problema es que eso, escrito así, suena bien y no prueba nada. Un test en verde puede estar en verde por el motivo equivocado. Ya me había pasado: uno que decía verificar un control abortaba antes en otro, así que deshabilitar el control importante lo dejaba igual de verde.

Por eso las veintiocho mutaciones, una por vez, restaurando después de cada una. Las veintiocho cayeron. Si alguna hubiese quedado en verde, ese test estaba de adorno y yo no lo sabía.

Sumar una fuente pasó a ser una línea declarativa en una lista, y cuesta cinco diezmilésimos de dólar por documento. En la misma tanda entraron tres municipios nuevos.
