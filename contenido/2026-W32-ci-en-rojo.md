---
fecha: 2026-08-10
semana: 32
revision: "01"
area: infra
titulo: El informe decía una cosa y el registro decía otra
resumen: El documento de traspaso daba una causa. Dos minutos de mirar el registro crudo mostraron que era falsa, y que el error estaba escrito ahí hacía cuatro días.
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

Cualquiera que haya recibido una obra empezada conoce esto: el parte dice una cosa y el registro dice otra. Me pasó con mi propio proyecto, y me costó días.

El documento de traspaso daba por causa que el problema sólo se podía reproducir en producción. Dos minutos de verificación mostraron que era falso: el sistema de control automático ya lo estaba probando en cada envío. No faltaba infraestructura. Faltaba abrir el registro, que llevaba cuatro corridas en rojo con el error exacto adentro.

La causa real era otra y más silenciosa: dos líneas de trabajo paralelas creaban lo mismo dos veces. El chequeo estándar no cubre ese caso, así que pasaba en verde mientras la cadena reventaba por debajo.

Y arreglar el primero destapó dos más. Cuando se destraba algo que lleva tiempo roto, conviene presupuestar que no es <em>un</em> error sino una pila.

Lo que me llevé, y sirve fuera del software: **antes de aceptar la causa que declara un documento, abrí el registro crudo vos mismo.** Cuesta dos minutos, y es la diferencia entre arreglar el problema y arreglar lo que alguien creyó que era el problema.
