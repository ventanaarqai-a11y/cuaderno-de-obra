---
fecha: 2026-08-30
semana: 36
revision: "01"
area: datos
titulo: Cargué el dato más completo y no movió nada
resumen: La fuente que cubre 2.048 de 2.117 municipios argentinos entró al sistema un día antes de que algún agente supiera leerla.
firma: Marcelo Acurio
cita: Un día de diferencia entre tener el dato adentro y que alguien lo use.
diagrama: cobertura
cifra:
  valor: 2048
  denominador: 2117
  unidad: municipios
  que_mide: Municipios argentinos con dato de demanda estructural desde el Censo 2022
  fuente: INDEC — Censo Nacional de Población, Hogares y Viviendas 2022
  fuente_url: https://datos.gob.ar/dataset/censo-nacional-de-poblacion-hogares-y-viviendas-2022
  analisis: Medición propia de VENTANA sobre el Censo 2022 · agosto 2026
checklist:
  - hecho: Censo 2022 cableado como fuente — 2.048 de 2.117 municipios
  - hecho: Agente de demanda estructural construido, consumiendo ese dato
  - hecho: Cobertura ponderada de Argentina, medida antes y después del cableado
  - pendiente: El registro de sesiones del proyecto no anotó este cambio
  - bloqueado: Publicar esta rama a producción
cta: ¿Tenés algún estudio o relevamiento ya armado en tu oficina que nadie usa para decidir, y sabés por qué quedó así?
---

Cargué el dato más completo que tiene el sistema y no cambió nada.

El Censo 2022 es la única fuente de todo el proyecto que cubre la Argentina entera: 2.048 de 2.117 municipios, con viviendas, hacinamiento y acceso a agua y cloaca por gobierno local. Todo lo demás que hay cableado hoy —precios de mercado, ordenanzas, permisos de obra— está en el orden de las decenas. Este dato iba a mover la aguja de un salto.

Terminó de importarse un jueves a la noche. El número de cobertura del sistema no se movió ni un punto.

## El dato estaba, y nadie lo leía

Los agentes que arman el diagnóstico de cada municipio sólo miran los campos que tienen declarados de antemano, y ninguno tenía escrito "mirá el censo". El dato más grande del repositorio quedó guardado en una tabla, tan invisible para el cliente como si nunca se hubiera cargado.

Hizo falta un segundo trabajo, al día siguiente: escribir el agente que efectivamente lee esa tabla y la convierte en un puntaje de demanda. Recién ahí el número de cobertura ponderada de Argentina se movió, y subió varios puntos de un saque. Un día de diferencia entre tener el dato adentro y que alguien lo use.

En el medio apareció algo que no se veía a simple vista. La Ciudad de Buenos Aires —el mercado más grande del país— resolvía cero de sus quince comunas. No faltaba el dato: el padrón oficial las tiene, las quince. Faltaba que el sistema entendiera que "Caba" y "Ciudad Autónoma de Buenos Aires" son el mismo lugar escrito distinto. Una diferencia de tipeo le estaba costando al agente la ciudad más importante que iba a puntuar.

## Cargar y usar son dos pasos distintos

Ya había aprendido esta lección del lado de la procedencia: un dato con fuente y fecha no sirve si el campo que lo guarda no llega a la pantalla del cliente. Ahora apareció del lado de la cobertura, con la misma forma exacta: un dato que cubre el país entero no cuenta mientras ningún agente lo consulte.

Y queda algo pendiente de esta misma semana, sin resolver todavía. El registro donde se supone que anoto cada sesión de trabajo no tiene renglón para este cambio. El dato quedó cableado. El registro, no.
