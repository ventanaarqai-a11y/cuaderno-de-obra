---
fecha: 2026-08-24
semana: 35
revision: "01"
area: infra
titulo: Ensayé la rutina y falló los cuatro casos
resumen: La escribí para que esto se publicara solo cada lunes. Ninguno de los cuatro defectos que encontré estaba en el código nuevo.
firma: Marcelo Acurio
cita: Dos de los cuatro tests daban verde por casualidad: la última entrada publicada era justo la que ellos esperaban.
diagrama: estados
cifra:
  valor: 4
  denominador: 4
  unidad: casos
  que_mide: Casos de la rutina de publicación que fallaron la primera vez que se ensayaron
  fuente: Ensayo de la cadena de publicación del cuaderno
  analisis: Medición propia de VENTANA · agosto 2026
checklist:
  - hecho: La rutina mueve, valida, construye, prueba y deshace todo si algo no pasa
  - hecho: Los cuatro defectos que destapó el ensayo, corregidos
  - hecho: Dieciséis mutaciones cazadas por la aserción que dice protegerlas
  - pendiente: La causa de que la tarea del viernes corriera sin dejar rastro
  - bloqueado: El programa de datos, sin moverse desde el 18 de agosto
cta: ¿Vos qué ensayás antes de entregar una instalación, y qué das por bueno porque el plano está bien?
---

Escribí una rutina para que este cuaderno se publicara solo cada lunes. Antes de confiarle el sitio, la ensayé con una entrada de prueba. Falló los cuatro casos.

Ninguno de los cuatro defectos estaba en el código que acababa de escribir.

Nadie entrega una instalación sin abrirle el agua. Se puede revisar el plano diez veces, y el plano puede estar impecable, y aun así la prueba hidráulica es otra cosa: es la única que somete la instalación a lo que va a pasarle de verdad. Con el software pasa igual, sólo que es más fácil convencerse de que leer alcanza.

Yo había leído el código. Estaba bien.

## Los tests eran el problema

Los cuatro defectos estaban en las pruebas automáticas, esas que se supone que cuidan el sitio. Llevaban semanas en verde.

Una exigía que el repositorio estuviera limpio antes de publicar, pero no hacía la excepción del buzón donde el viernes deja el borrador sin guardar. Es decir: la condición para publicar era que no hubiera nada que publicar. Esa sola habría bloqueado todos los lunes.

Otra tomaba la entrada más reciente y le exigía la cifra de un diagrama que esa entrada no tenía por qué usar. Cualquier semana con un diagrama distinto —lo normal— habría puesto todo en rojo.

## Dos daban verde por casualidad

Acá está lo que no esperaba. Dos de esas pruebas no funcionaban: coincidían. Daban verde porque la última entrada publicada era justo la que ellas esperaban encontrar, y la primera entrada distinta las iba a romper.

Una tercera estaba directamente clavada a una fecha del diecinueve de agosto. Iba a caducar sola el lunes siguiente, sin que nada estuviera roto.

El sistema estaba armado para fallar la primera vez que se usara de verdad. Mientras nadie lo usara, todo iba a seguir en verde.

## Lo que sí sirvió

La parte que importaba era la que deshace: si la verificación no pasa, la rutina tiene que devolver el borrador a su lugar y dejar el sitio como estaba. Eso funcionó al primer intento, y lo comprobé rompiendo la entrada a propósito para ver si volvía todo a su sitio.

Un repositorio a medias un lunes a la mañana, sin nadie mirando, es peor que una rutina que no corrió.

Después probé lo mismo al revés: rompí a propósito cada una de las dieciséis defensas del sitio, una por una, para confirmar que cada una se pone roja por el motivo que dice y no por otro. Las dieciséis avisaron. Un verde que no sabés poner en rojo no es una garantía, es una costumbre.
