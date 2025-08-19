// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Reemplazar el uso de variables de entorno con el JSON de la cuenta de servicio proporcionado.
const serviceAccount = {
  "type": "service_account",
  "project_id": "websapmax",
  "private_key_id": "0ec54babb0c7f0f1ee7688fecd22c261a1d26297",
  "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDj4ywnbekZ4wG5\\nTxnphsXxAmwU+sbQhh+zrR7g0M/pj8ENJHxQ+arkWICucRYNqENUJNlNk0Y54obs\\nlTjRpbzqB91iTEgB13S6OcXwPvDNvQNRJfTRhDvCvS5YmepyLyrDd9Hq4lpAW1u6\\nZR56K72QDQPc/rrERS4xUEPrNminfIgnb7bSpsbtcUJNU5O2myq+UojgWTCKI6p5\\n87zrPLLuSODYrDDjvq0u1zUXsy6+65FnoIzK4Lk+5JtlRdmuPVmdKqqVqtKICJTH\\naQRR86PL1cys4/YP2YyLOFOQZsOZhjTIYkoV4J6lW5LwD3Hl+L4UWDo77ULHP/AU\\n96xhzccdAgMBAAECggEAAO0CF6nqZcTGk8RmwExgHv3Jxx8KsjutQstcAgFPKu1+\n1QkWKTUOdO2IHk1Oz+DkXyHkMRy9TwxkzG7Bw5ZHCXNdOqJBM6K2sm/8JiD3VPqk\\n2g5Lq5M8M+sVVl5PtcWLyK4CsA/Z2oOUgJIbGNd3Jm/rGVl+lEAMsz4WfIzkyXNl\\n2gFlQj7mB8y0KKutumohrbF7RbKSCFZNu2YB8jP0A5ooZgTv9QALvgzkxwY/VrFZ\\n+XC6UxUpB6Ig5ZDnPZxgiQKkh0iG1/qjwPSz5VzxRuvgl88IqUP1/AIDQswhnneW\\ndGGO1R/qAlxrnTihAZcc2i2elpF6RulRCiFOZQye8QKBgQD/eDCioEdw3DK1Tsn2\\nT1qCh69VfHqCL6gMgxvbCv7saMveMJmlqRgP953cgB889BXyczycRKxJIFOSC4VG\\nC+G+RduzEKg4z43aqz6hLTJW8G2N0t0MEaciTkMs3VCFn2zsrWM8zDUyCtabp41b\\nbLHShSF2h0rj+LNWlMxlw3OJjQKBgQDkXFHQg/Lm0sMJoTANVChKJ5SSKpJCwQpV\\narbcJRXno9nLcLQZWeWZhH5/2iNXDEYyQ8KiGof7A7uN2dMH9mBGHbAKlJTd+1Hh\\nMwsKYbm2wNFGmu05B3RHLF/cIBSjzTCsX0A6iw4XAXfE6JreQWVDQdcUSpC7N75n\\njcdBeB4n0QKBgBrplnYLXHtPNyhSfIQuJ+LIWHgw/NbqHlHzHeQdbG2LPK7Tf9wr\\nzBUiiMbJ2ICbVhSMfz4XHe82MJeaDxgp+EYLJfHfN1mEw/TdRWPFVyBBg8kFBbRX\\nx7udcwYu6mSpPthQC7xD5va2nZUYOZQAB1ueGsBZ0FHjyUC9vCqcRHehAoGAUhqr\\nQ8gdLkZ631x31WL7tWWzsjXiLmQPnhRnOJGQ5Z7wsIeOCUtcFK0hekBo0mRUXMAm\\nG3hkiaiW53J4wHUhujP0VmmDeKhikRB0GMB4MC/1TmhngEig0vIuaQuTwC0HIgKB\\nKktSvozFjiN/gweKK/thJCeHD/kD2WGNUYmpdfECgYAcbg/XHGFIS3bN7JCUnXEO\\ng37lJIHP8G72vOnIWuslcn9jiit2vMFGijR34AxmI8E6Z14NRKzqlWm3CDQHOTPE\\nrJSr8210h+UU2ZKO4vy6SuoDd/Rq/cPv0qGFtrczsZd3pt/u5fyFVZth30Gl8Am5\\nMGXjkzQ95a6A6IOiYLXqGg==\\n-----END PRIVATE KEY-----\\n".replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-fbsvc@websapmax.iam.gserviceaccount.com",
  "client_id": "105018771396187901451",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40websapmax.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

const storageBucket = "websapmax.appspot.com";

let adminApp: admin.app.App;
let adminAuth: admin.auth.Auth;
let adminDb: admin.firestore.Firestore;
let adminStorage: admin.storage.Storage;

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  
  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket,
    });
    console.log('✅ Firebase Admin SDK inicializado correctamente.');
    return app;
  } catch (error: any) {
    console.error('❌ Error al inicializar Firebase Admin SDK:', error.message);
    return null;
  }
}

adminApp = initializeFirebaseAdmin();

if (adminApp) {
  adminAuth = admin.auth(adminApp);
  adminDb = admin.firestore(adminApp);
  adminStorage = admin.storage(adminApp);
} else {
  console.error("🔴 La inicialización de Firebase Admin falló. Los servicios de admin no estarán disponibles.");
  const unavailableService = () => {
    throw new Error("Firebase Admin SDK no está disponible debido a un error de inicialización. Revisa los logs del servidor.");
  };
  // @ts-ignore
  adminAuth = unavailableService;
  // @ts-ignore
  adminDb = { collection: unavailableService };
  // @ts-ignore
  adminStorage = unavailableService;
}

export { adminAuth, adminDb, adminStorage };
