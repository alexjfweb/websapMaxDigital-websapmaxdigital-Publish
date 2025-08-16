# Cómo Obtener las Credenciales de la Cuenta de Servicio de Firebase

Este documento explica paso a paso cómo generar y utilizar el archivo de credenciales JSON para la cuenta de servicio de tu proyecto de Firebase. Estas credenciales son necesarias para que el backend de tu aplicación (el servidor de Next.js) pueda comunicarse con los servicios de Firebase con privilegios de administrador.

**IMPORTANTE:** El archivo JSON de la cuenta de servicio es altamente sensible. Contiene claves privadas que otorgan acceso completo a tu proyecto de Firebase. **Nunca compartas este archivo ni lo subas a un repositorio público (como GitHub).**

---

### Pasos para Generar la Clave

1.  **Ir a la Consola de Firebase:**
    *   Abre tu navegador y navega a la [Consola de Firebase](https://console.firebase.google.com/).
    *   Inicia sesión con la cuenta de Google asociada a tu proyecto.

2.  **Seleccionar el Proyecto:**
    *   En la lista de proyectos, haz clic en el que deseas configurar (en este caso, **`websapmax`**).

3.  **Abrir la Configuración del Proyecto:**
    *   En el menú de navegación de la izquierda, junto a "Project Overview" (o "Descripción general del proyecto"), haz clic en el **ícono de engranaje (⚙️)**.
    *   En el menú desplegable, selecciona **"Configuración del proyecto"**.

    ![Paso 3: Configuración del proyecto](https://firebase.google.com/static/docs/admin/setup/images/project-settings.png)

4.  **Navegar a Cuentas de Servicio:**
    *   Dentro de la página de configuración, haz clic en la pestaña **"Cuentas de servicio"** (Service Accounts).

    ![Paso 4: Pestaña Cuentas de Servicio](https://firebase.google.com/static/docs/admin/setup/images/service-accounts.png)

5.  **Generar Nueva Clave Privada:**
    *   Busca la sección del "SDK de Firebase Admin".
    *   Haz clic en el botón azul que dice **"Generar nueva clave privada"** (Generate new private key).
    *   El sistema mostrará una advertencia de seguridad. Confirma la acción haciendo clic en el botón **"Generar clave"**.

6.  **Descargar y Usar el Archivo JSON:**
    *   El navegador descargará automáticamente un archivo con un nombre similar a `tu-proyecto-firebase-adminsdk.json`.
    *   **Abre este archivo JSON** con un editor de texto (como VS Code, Bloc de notas, etc.).
    *   **Selecciona y copia todo el contenido** del archivo, desde el `{` de apertura hasta el `}` de cierre.

### Cómo Configurar la Variable de Entorno

Una vez que tengas el contenido del archivo JSON copiado, debes configurarlo en tu archivo `.env.local`.

1.  Abre el archivo `.env.local` en la raíz de tu proyecto.
2.  Busca la línea `FIREBASE_SERVICE_ACCOUNT=...`.
3.  Pega el contenido completo del JSON como el valor de esa variable, asegurándote de que esté todo entre comillas dobles.

**Ejemplo en `.env.local`:**

```env
# ... otras variables de entorno ...

FIREBASE_SERVICE_ACCOUNT="{ \"type\": \"service_account\", \"project_id\": \"websapmax\", \"private_key_id\": \"...\", \"private_key\": \"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n\", \"client_email\": \"...\", ... }"
```

**¡Listo!** Una vez que guardes el archivo `.env.local`, reinicia tu servidor de desarrollo para que los cambios surtan efecto.
