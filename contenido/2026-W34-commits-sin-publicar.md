---
fecha: 2026-08-18
semana: 34
revision: "04"
area: infra
titulo: Seis días creyendo que avanzaba
resumen: El trabajo estaba hecho y guardado. Desde cualquier otra máquina, no existía.
firma: Marcelo Acurio
cita: El arreglo no fue publicar. Fue que la diferencia entre los tres estados se vea en cinco segundos en vez de en seis días.
diagrama: estados
cifra:
  valor: 25
  denominador: 25
  unidad: commits
  que_mide: Commits que estaban en disco y no en el servidor
  fuente: docs/handoffs/CONTINUIDAD_DATOS.md §1
checklist:
  - hecho: Los 25 commits publicados en el servidor
  - hecho: Comando de control documentado en el handoff
  - hecho: Verificación del SHA remoto después de cada publicación
  - bloqueado: Pasar el programa de datos a producción
cta: ¿Cómo controlás vos que lo que hiciste esta semana está donde tiene que estar, y no sólo en tu disco?
---
Durante seis días estuve avanzando de verdad. Y durante seis días, desde cualquier otra máquina, ese avance no existía.

Hay tres estados que es fácil confundir, y confundirlos sale caro. <em>Guardado</em>: está en el historial de esta computadora. <em>Publicado</em>: está en el servidor, y cualquiera puede verlo. <em>En producción</em>: es lo que corre para el usuario final. Tres fases completas de trabajo estuvieron en el primero y en ninguno de los otros dos.

No era un problema de comunicación. Cuando alguien preguntaba cómo venía, no había nada que mostrar: literalmente no había qué mirar. Veinticinco commits vivían en un disco.

El arreglo no fue publicar —eso tardó un minuto—. Fue darme cuenta de que el problema real era que la diferencia entre los tres estados era invisible hasta que alguien la buscaba. Ahora hay un comando de control que se corre al abrir y al cerrar cada sesión, y la hace visible en cinco segundos.

Y para no cometer el error en la otra dirección: <strong>nada de este programa está en producción todavía</strong>. Está publicado, está a la vista, y sigue sin ser lo que corre para nadie.
