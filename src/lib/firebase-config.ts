// # ============================ #
// # 🚫 NO MODIFICAR ESTE ARCHIVO
// # 🔒 CREDENCIALES VALIDADAS
// # ✅ CONFIGURACIÓN FUNCIONAL
// # ============================ #

// src/lib/firebase-config.ts

// --- Configuración del Cliente (Pública y Segura) ---
export const firebaseConfig = {
    apiKey: "AIzaSyC3UzUVh_OPavejyo-kviYVX_Zy9494yjg",
    authDomain: "websapmax.firebaseapp.com",
    projectId: "websapmax",
    storageBucket: "websapmax.appspot.com",
    messagingSenderId: "560613070255",
    appId: "1:560613070255:web:7ce75870dbe6b19a084b5a",
    measurementId: "G-DD5JWPV701"
};

// --- Configuración del Servidor/Admin (Privada) ---
// Estas credenciales son para el backend y NUNCA deben exponerse en el cliente.
export const firebaseAdminConfig = {
  "type": "service_account",
  "project_id": "websapmax",
  "private_key_id": "1cc54f138c526f5a66b8bbd2bfa5b3ad1ecf0679",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDiEM/cfLU3+Edu\nzqEqCg6clBODmqWFXywQOIjpdMDxeW9Af/VMB1I6/YeoUHXO4oFapy5ZA43hT+cb\nuIsAEoMTqDpD8ofNz/14oT8Tix7tLeQAvUGTLWRn+RktyfSP15h7Vf4zzJs6veBD\nsRl7mSu4zq7UNjxCt0Ks+vW5rc4FAGDDcEe6/oOoXJADgY7Jbv0vhN7jfTLd8i2O\nIEp6ZJo/H5lfF/7utLIcjliD5FVqx5Sxu/fbCPqwRPA4cj+VfkYZKp6BXMcy5oPN\n7QDXdexvqT7ksdk4/6SLfgTHopsiCLNSjX+N+GIXJINuf8OoVlZZexLzmUCEFRHv\n2L6XpZYBAgMBAAECggEAAMk1JZW0082sZsRmXBNnWjtxCmN4mfWPfsn9AcdGHZgx\nujADBnZAhBF7JBG01kml0mxBp3rpUmCUaOVk407sLwzvaXJ+5xHIF2nt80vl766Q\n7L7nBowhuS5rE2pVJLunLoxwoNZCrnS7i0B1kZVXK4U/0rY19e6eu8Ntqn7t1pna\nWOK+uetXFZx7vSTTDX9pyUEPDQeYkWG4nBe+lSnSnkvzBqn5d9x+eFXCrbTgV1BI\nt05xkmKaebPjHBjy2J9b52VybFqTgkDQ8PMn1S4MUBKmtKEDYUFz5r8/X49c7UWs\noYGyXXUL5Y7j4U2yIzy2xj17W317oKz5Ho0goY6MiwKBgQDyTe4ilcLYeehDM8ED\nxOL5hQ87pJNpG3CWofV0NYWPwTMABtLd9i7avxeAuwy5nYP69g9IrW4wm+E6FFsq\nNTxfTeAdScdXbZrKUxRGIX8Co88MDdi7H3ncLaYBeCn+2UDljDkyr4kxowf8Jm49\nwpaN+MuwklbMx4szF3eS4UuUxwKBgQDu1+mDcNmAtv/CiQdJMFMwzJcWUz+PJ222\nc736P2cyzgHt3MJdrcgTrK6Lxq4xJ+MgF3xwtlTHBaB/ZAFQ2giHXtbl1RpU1WCc\ndAo1xmO435bPqalFcxDLQxVehhGAs3rLqVHlFuQ+UdC+EJ6BYi/G2zUWOAqVimk9\n7/baYMCm9wKBgQDV26hpyAqgLACuh5g87mJyXllSh/A/XaOin7HXboHCnn+X723f\n0DAMi4p/6RfTH85kCxb0S3Ys2vgP3fWUrEXry/0ZfIu/g5KSLn9/YoMKXnAYsIPw\nrFhO189kDp3qO/AGahv1u254a+9ZQsYcJonhJo0I/DA2L4yRfI3iCo098wKBgClc\nQHbfkvrENfQlMJrPAIkB1OQr1GTg6hHfZzWvxxo4LINZaFs6ndwyWiOga0fd5WoI\nRydpm7K/WbTVx5iNuU5f8Qzp415veQR+38nCKkC4j3A0rDh3nZ/lZQzyYJOOASTF\nlIX8edgE6QYQ8LHtI+Lm0QGhAMw2pNTx+iiE+revAoGBAM9KiK+DXoz30ZHslisi\n054COiPH+Gm8OSsUA15Hp2WnuMWvTGDwdkY4NIgPBs6kd60Nik9edIxKA5G0MHyl\nudNI7mNz2O3cB5ZsuNC9AEpX8O07XLtW3KqgjeFwu4tYTNwWYhIdoFBHPxBlFaRD\nNFJk9aS777Hs/6BdnEPHAqfz\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@websapmax.iam.gserviceaccount.com",
  "client_id": "105018771396187901451",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40websapmax.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};


// VALIDACIÓN: Asegura que todas las claves necesarias para la configuración de Firebase estén presentes.
export const isFirebaseConfigValid = () => {
    const missingKeys = Object.entries(firebaseConfig)
        .filter(([key, value]) => !value && key !== 'measurementId') // measurementId es opcional
        .map(([key]) => key);

    if (missingKeys.length > 0) {
        console.error("❌ Error Crítico de Configuración de Firebase: Faltan las siguientes claves en el objeto firebaseConfig:");
        missingKeys.forEach(key => console.error(`   - ${key}`));
        console.error("Por favor, verifica el objeto de configuración en src/lib/firebase-config.ts.");
        return false;
    }
    return true;
};
