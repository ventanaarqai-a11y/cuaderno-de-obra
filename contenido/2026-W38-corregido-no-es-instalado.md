---
fecha: 2026-09-12
semana: 38
revision: "01"
area: infra
titulo: Corregí cuatro errores reales, y ninguno salió
resumen: Una auditoría de punta a punta encontró cuatro fallas reales en lo que recibe el cliente —entre ellas, un número de inflación que el sistema se calculaba solo en vez de usar el que el propio organismo ya publica. Las cuatro están corregidas y probadas. Ninguna llegó todavía a lo que el cliente ve.
firma: Marcelo Acurio
cita: Corregido y verificado no es lo mismo que instalado.
diagrama: estados
cifra:
  valor: 4
  denominador: 4
  unidad: correcciones
  que_mide: Errores reales encontrados y corregidos en la auditoría de esta quincena que todavía no llegaron al informe que recibe el cliente
  fuente: Auditoría interna de punta a punta de VENTANA sobre el informe real que recibe el cliente, y registro de publicación del repositorio
  analisis: Medición propia de VENTANA · septiembre 2026
checklist:
  - hecho: Se corrió el diagnóstico real dos veces y se auditó cada número contra su fuente en vivo
  - hecho: El número de inflación pasó a usar el dato que el organismo ya publica, no una cuenta propia
  - hecho: Los cuatro arreglos se probaron rompiéndolos a propósito, para confirmar que el control los agarraba
  - pendiente: Que las cuatro correcciones lleguen a lo que el cliente efectivamente recibe
  - bloqueado: Publicar esta rama a producción
cta: Cuando te toca aplicar un ajuste de obra por inflación, ¿usás el índice que publica el organismo oficial, o armás la cuenta con los datos que tenés a mano?
---

Le hice una auditoría de punta a punta al informe que recibe el cliente, dos veces, como si
fuera una obra ajena y no la mía. Encontré cuatro errores reales. Los corregí, los probé
rompiéndolos a propósito para ver si el control los detectaba, y los di por cerrados. Ninguno
de los cuatro llegó todavía a lo que el cliente efectivamente ve.

## El número que me armaba solo

El más caro de los cuatro estaba en la inflación anual de Argentina, uno de los datos que más
pesa en el diagnóstico. El sistema la calculaba por su cuenta: tomaba el dato mensual y lo
multiplicaba por doce. El mismo organismo que publica ese dato mensual publica también la
variación interanual real, mes contra el mismo mes del año anterior — el número que de verdad
importa cuando pensás una escalación de obra. Los dos números no coincidían. La cuenta propia
daba ocho puntos y medio menos que el dato oficial.

Ocho puntos y medio no es un redondeo. Es la diferencia entre presupuestar con un índice que
vos armaste y presupuestar con el que publica quien tiene la autoridad para publicarlo. Ese
número entraba a tres cálculos distintos del diagnóstico al mismo tiempo, sin que nada lo
marcara como una estimación casera.

## Corregido no es lo mismo que instalado

Arreglé los cuatro. Los probé rompiéndolos a propósito, uno por uno, para confirmar que si
alguien volvía a introducir el mismo error, algo lo iba a agarrar. Los cuatro pasaron esa
prueba. Escribí el resultado, con la fecha y el motivo de cada uno, en la carpeta donde
llevo el registro del avance.

Y ahí quedaron. En la carpeta de correcciones, no en la que usa la obra.

**Corregido y verificado no es lo mismo que instalado.** Es la misma distancia que hay entre
firmar una modificación de proyecto y que la cuadrilla reciba el plano nuevo: si el plano
corregido se queda en el escritorio, la obra sigue construyendo con el error, aunque en la
oficina esté todo prolijamente resuelto. Van dos semanas seguidas encontrando esta misma
distancia — la vez anterior era trabajo sin enviar; esta vez es trabajo enviado a medias,
que llegó hasta la carpeta de revisión y no un paso más allá.

## Lo que queda abierto

Las cuatro correcciones están firmadas. La carpeta que efectivamente se usa para lo que ve el
cliente sigue siendo la de antes. No hay una moraleja prolija para esto todavía — hay una
carpeta que falta mover, y una razón por la que no se movió sola que todavía no encontré.

Cuando te toca aplicar un ajuste de obra por inflación: ¿usás el índice que publica el
organismo oficial, o armás vos la cuenta con los datos que tenés a mano?
