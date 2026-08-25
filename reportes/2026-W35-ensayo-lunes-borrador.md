---
fecha: 2026-08-24
semana: 35
revision: "01"
area: infra
titulo: Un borrador de ensayo que se borra solo
resumen: Existe nada más para probar que la rutina del lunes revierte cuando algo no pasa.
firma: Marcelo Acurio
cita: Si la suite falla un lunes a la mañana, el repo tiene que quedar como estaba.
diagrama: estados
cifra:
  valor: 3
  denominador: 3
  unidad: ensayos
  que_mide: Ensayos de la cadena viernes a lunes que se corrieron de punta a punta
  fuente: Ensayo de la rutina de publicación
  analisis: Medición propia de VENTANA · agosto 2026
checklist:
  - hecho: El caso sin borrador devuelve 2 y no toca nada
  - hecho: El caso feliz deja el sitio construido
  - pendiente: El caso que falla revierte solo
cta: ¿Vos qué automatizás del lunes, y qué dejás para una persona?
---

Este borrador no cuenta nada real: existe para ejercer la rutina del lunes de punta a punta.

La rutina mueve el borrador del viernes a contenido, reconstruye el sitio y corre la suite. Si algo no pasa, tiene que deshacer todo.

Lo que se prueba acá es el revert, que es la parte que nadie mira hasta que falla.
