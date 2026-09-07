---
fecha: 2026-09-04
semana: 37
revision: "01"
area: datos
titulo: Iba a mostrarte un número que nadie midió
resumen: Una hipótesis con la aritmética perfecta decía que ya teníamos el costo de obra de más de mil municipios argentinos. El documento que se suponía la respaldaba decía lo contrario.
firma: Marcelo Acurio
cita: El número era aritméticamente correcto y estaba inventado.
diagrama: cobertura
cifra:
  valor: 24
  denominador: 2117
  unidad: municipios
  que_mide: Municipios argentinos con costo de obra real cableado, cada uno dentro del área que su propia fuente declara medir
  fuente: VENTANA — auditoría de las fuentes de costo de obra cableadas (dirección de estadística de Córdoba, instituto de estadística de Santa Fe, instituto de estadística de la Ciudad de Buenos Aires, entre otras), contra el documento metodológico primario de cada una
  fuente_url: https://prensa.cba.gov.ar/informacion-general/en-mayo-el-costo-de-la-construccion-en-cordoba-aumento-13/
  analisis: Medición propia de VENTANA · septiembre 2026
checklist:
  - hecho: Se verificó, contra el documento metodológico de cada fuente, qué ciudad mide en realidad
  - hecho: Se escribió una regla nueva - un dato se expande sólo al área que su propia fuente declara, nunca a la provincia entera
  - hecho: Se sumó una fuente de costo de obra para la Ciudad de Buenos Aires, que hasta esta semana no tenía ninguna
  - pendiente: Aplicar la misma verificación a las fuentes de precio de mercado, que recién empezó
  - bloqueado: Publicar esta rama a producción
cta: Si trabajás con un índice de costo de obra provincial - ¿alguna vez abriste el documento metodológico para confirmar qué ciudad mide en realidad?
---

Tenía la tabla armada. Seis fuentes de costo de obra, cada una atada a una provincia entera, sumaban más de mil municipios argentinos con dato de construcción. Estuve a punto de mostrarla así.

La aritmética estaba perfecta. Cada fuente declara la provincia a la que pertenece, y sumar esas provincias da ese número. Lo único que no había hecho todavía era abrir el documento metodológico de cada una y leer qué ciudad miden en realidad.

## Lo que decía el papel

El primer índice que abrí es de la dirección de estadística de la provincia de Córdoba. La propia metodología dice que el área del relevamiento es la ciudad de Córdoba. No la provincia. El segundo, de la provincia de Santa Fe, dice lo mismo de la ciudad de Santa Fe: los materiales se compran y la mano de obra se contrata ahí, en esa ciudad puntual, ninguna otra.

Los dos organismos son provinciales. Los dos miden una sola ciudad. Publicar su número como si valiera para toda la provincia habría puesto en Río Cuarto, o en Rafaela, un costo que nadie relevó ahí.

**El número era aritméticamente correcto y estaba inventado.**

## El error contrario, escondido en el mismo papel

Arreglando eso apareció el error opuesto, que es peor porque no se nota. El mismo informe de Santa Fe dice, literal, que mide el aglomerado Gran Rosario — once municipios, no uno. Y en el sistema esa fuente estaba cableada a un solo municipio: Rosario. Cubría también a Funes, a Roldán, a Villa Gobernador Gálvez, y el sistema los dejaba afuera sin que ningún error se disparara. No hay ningún cartel rojo para un dato que cubre menos de lo que dice cubrir.

## La regla que quedó

El área de un dato la fija su metodología, no el nombre de quien lo publica ni la ciudad que uno eligió cablear primero. Se expande sólo contra un padrón oficial de terceros — en este caso, la lista de localidades que usa el censo nacional para armar cada aglomerado — nunca por parecido de nombre.

Con esa regla, la ciudad de Córdoba se queda como está. El aglomerado de Rosario pasa de un municipio a once. Y de paso apareció una fuente nueva para la Ciudad de Buenos Aires — la ciudad más grande del país, y hasta esta semana la única sin un solo dato de costo de obra.

Hoy son 24 de 2.117 municipios argentinos con un costo de obra real, cada uno verificado contra lo que su propia fuente dice medir. Es menos de la décima parte de lo que casi mostré la semana pasada. Es el número correcto.

Si trabajás con un índice de costo de obra provincial: ¿alguna vez abriste el documento metodológico para confirmar qué ciudad mide en realidad?
