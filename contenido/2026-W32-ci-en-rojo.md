---
fecha: 2026-08-10
semana: 32
revision: "01"
area: infra
titulo: El error estaba escrito, con su nombre, en un archivo que nadie abrió
resumen: El documento de traspaso culpaba a la infraestructura. Dos minutos de verificación mostraron que era falso.
firma: Marcelo Acurio
cita: "No faltaba infraestructura. Faltaba abrir el registro: llevaba cuatro corridas en rojo con el error exacto adentro."
diagrama: pipeline
cifra:
  valor: 4
  denominador: 4
  unidad: corridas
  que_mide: Corridas de integración en rojo antes de que alguien las leyera
  fuente: docs/ESTADO_Y_PRIORIDADES.md §Sesión 2026-08-10
checklist:
  - hecho: Causa raíz reproducida antes de arreglar
  - hecho: Guarda agregada en todas las revisiones que crean el objeto
  - hecho: Verificado por mutación en los dos niveles de prueba
  - hecho: Producción sirviendo la versión nueva
cta: "Pregunta honesta: ¿cuánto hace que no abrís el registro de tu propia integración continua?"
---
El documento de traspaso decía que el problema no se podía reproducir fuera de producción. El problema estaba escrito, con su nombre completo, en un archivo que nadie había abierto.

La causa raíz declarada era que las migraciones de base de datos sólo se ejercían en el servidor real. Dos minutos de verificación mostraron que eso era falso: el sistema de integración ya levantaba una base igual a la de producción y las corría en cada envío. No faltaba infraestructura. Faltaba mirar el resultado.

La causa real: dos ramas de trabajo paralelas creaban la misma tabla. El chequeo estándar —que exista una sola cabeza en el grafo de migraciones— no cubre ese caso, así que pasaba en verde mientras la cadena reventaba por debajo.

Y arreglar el primero destapó dos más: un detector de credenciales dando falsos positivos, y un archivo de configuración generado en Windows que en Linux es rojo permanente. Cuando se destraba algo que lleva tiempo roto, conviene presupuestar que no es un error sino una pila.

Se reprodujo el fallo antes de tocar una línea, y después se volvió a romper a propósito para confirmar que los dos niveles de prueba se ponían en rojo por ese motivo y no por otro.
