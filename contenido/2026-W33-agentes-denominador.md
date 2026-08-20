---
fecha: 2026-08-13
semana: 33
revision: "03"
area: agentes
titulo: Diez de doce no sabían sobre cuántos casos opinaban
resumen: Medir la cobertura de cada agente destapó que ni siquiera compartían la misma unidad de medida.
firma: Marcelo Acurio
cita: El mapeo estaba escrito tres veces en tres archivos, las tres copias habían divergido, y el cliente leía «sin datos locales» sobre datos que sí existían.
diagrama: agentes
cifra:
  valor: 12
  denominador: 12
  unidad: agentes
  que_mide: Agentes con unidad natural y cobertura medida
  fuente: docs/handoffs/CONTINUIDAD_DATOS.md §1
checklist:
  - hecho: Unidad natural declarada para los 12 agentes
  - hecho: Cobertura medida contra un denominador real
  - hecho: Las tres copias del mapeo unificadas en una
  - hecho: Zonas sísmicas con geometría y distancia, no conteo por radio
cta: "Si medís cobertura de datos en tu trabajo: ¿escribís el denominador antes de empezar, o lo armás cuando ya tenés los resultados?"
---
Un porcentaje de cobertura sin denominador escrito de antemano no es una medición: es una opinión con formato de número. Diez de los doce agentes venían dando esa opinión.

Sabían cuántos casos tenían dato. No sobre cuántos. Escribir primero el denominador —la lista completa contra la que se mide— y recién después contar, es la diferencia entre saber dónde estás y creer que sabés.

Medirlo destapó que la unidad natural no es la misma para todos. Mercado, comercial, construcción y regulatorio miran un municipio. Macro, político y financiero miran un país entero. Sísmico y ambiental miran una coordenada. Y el técnico mira el proyecto, sin territorio ninguno. Compararlos con la misma regla venía escondiendo el problema en vez de mostrarlo.

Y apareció algo peor que un número mal contado. El mapeo de qué agente lee qué campo estaba escrito tres veces, en tres archivos distintos, y las tres copias habían divergido. Consecuencia para quien recibe el informe: leía «sin datos locales» en un dominio donde el dato sí estaba cargado. No es un error de cálculo, es un error que el cliente ve.

Ahora los doce tienen unidad declarada y denominador medido, y el mapeo vive en un solo lugar.
