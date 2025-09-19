# Guía Rápida para Actualizar tu Repositorio en GitHub

Esta guía te mostrará los pasos esenciales para subir tus cambios locales (código, archivos, etc.) a tu repositorio en GitHub. Estos comandos son la base del trabajo con Git.

## Pasos para Actualizar

Sigue estos comandos en tu terminal, desde la carpeta raíz de tu proyecto.

### Paso 1: Revisa el Estado de tus Cambios

Antes de subir nada, es una buena práctica ver qué archivos has modificado.

```bash
git status
```

Este comando te mostrará una lista de los archivos que han sido cambiados, los que son nuevos y los que están listos para ser subidos.

### Paso 2: Prepara tus Cambios para Subir

A continuación, necesitas "preparar" todos los archivos que quieres guardar en el historial del proyecto. A esto se le conoce como "staging".

Para añadir todos los cambios (archivos modificados, nuevos y eliminados), usa el siguiente comando:

```bash
git add .
```

El `.` significa "todos los archivos en el directorio actual y subdirectorios".

### Paso 3: Guarda tus Cambios en el Historial Local

Ahora que los archivos están preparados, debes "confirmar" estos cambios con un mensaje que describa lo que hiciste. Esto crea una especie de "punto de guardado" en el historial de tu proyecto.

```bash
git commit -m "Aquí escribe un mensaje descriptivo de tus cambios"
```

**Ejemplos de buenos mensajes:**
* `git commit -m "Agrega la sección de testimonios a la landing page"`
* `git commit -m "Corrige el error 404 en la página de contacto"`
* `git commit -m "Actualiza el logo del restaurante en el perfil"`

### Paso 4: Sube tus Cambios a GitHub

Finalmente, sube los cambios que acabas de guardar a tu repositorio remoto en GitHub.

```bash
git push origin main
```

*   `git push`: Es el comando para enviar cambios.
*   `origin`: Es el nombre por defecto de tu repositorio remoto (el que está en GitHub).
*   `main`: Es el nombre de la rama principal a la que estás subiendo los cambios. A veces puede llamarse `master`.

---

¡Y eso es todo! Después de ejecutar el último comando, si vas a tu repositorio en GitHub, verás que todos tus cambios ya están reflejados.
