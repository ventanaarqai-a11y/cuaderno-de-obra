---
fecha: 2026-08-18
semana: 34
revision: "04"
area: infra
titulo: Un plano terminado no es un plano enviado
resumen: Seis días de trabajo hecho y guardado que, desde cualquier otro lado, no existía. El problema no era el trabajo: era que la diferencia no se veía.
firma: Marcelo Acurio
cita: El arreglo no fue publicar. Fue que la diferencia entre los tres estados se vea en cinco segundos en vez de en seis días.
diagrama: estados
cifra:
  valor: 25
  denominador: 25
  unidad: commits
  que_mide: Commits que estaban en disco y no en el servidor
  fuente: Historial del repositorio de VENTANA
  analisis: Medición propia de VENTANA · agosto 2026
checklist:
  - hecho: Los 25 commits publicados en el servidor
  - hecho: Comando de control documentado en el handoff
  - hecho: Verificación del SHA remoto después de cada publicación
  - bloqueado: Pasar el programa de datos a producción
cta: ¿Cómo controlás vos que lo que hiciste esta semana está donde tiene que estar, y no sólo en tu disco?
---

Un plano terminado, un plano enviado y un plano del que ya se está construyendo son tres cosas distintas. En una obra nadie las confunde. Yo las confundí seis días seguidos.

En software pasa igual y se nota menos. <em>Guardado</em>: está en el historial de mi computadora. <em>Publicado</em>: está en el servidor, y cualquiera puede verlo. <em>En producción</em>: es lo que corre para el usuario final. Tres fases completas de trabajo estuvieron en el primero y en ninguno de los otros dos.

No era un problema de comunicación. Cuando alguien preguntaba cómo venía, no había nada que mostrar: literalmente no había qué mirar. Veinticinco commits vivían en un disco.

El arreglo no fue publicar —eso tardó un minuto—. Fue darme cuenta de que el problema real era que la diferencia entre los tres estados era invisible hasta que alguien la buscaba. Si trabajás con una carpeta compartida, un tablero o un repositorio, la pregunta que sirve no es «¿está hecho?» sino **«¿desde dónde más se puede ver?»**. Ahora eso se responde en cinco segundos con un solo comando, al abrir y al cerrar la jornada.

Y para no cometer el error en la otra dirección: <strong>nada de este programa está en producción todavía</strong>. Está publicado, está a la vista, y sigue sin ser lo que corre para nadie.
