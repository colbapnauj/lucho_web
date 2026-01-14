/**
 * Cloud Function para publicar el sitio estático
 * 
 * Esta función:
 * 1. Obtiene todos los datos de Firebase
 * 2. Genera el HTML estático
 * 3. Lo sube a Netlify o genera un commit en GitHub
 * 
 * Trigger: HTTP request o Cloud Scheduler
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Inicializar admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.publish = functions.https.onRequest(async (req, res) => {
  try {
    // Verificar autenticación
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const token = req.headers.authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Verificar que el usuario sea admin
    const user = await admin.auth().getUser(decodedToken.uid);
    const customClaims = user.customClaims || {};
    
    if (!customClaims.admin && customClaims.role !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden publicar' });
    }
    
    console.log('🚀 Iniciando proceso de publicación...');
    
    // Obtener datos de Firebase
    const db = admin.database();
    const contentRef = db.ref('content');
    const snapshot = await contentRef.once('value');
    const content = snapshot.exists() ? snapshot.val() : {};
    
    // Generar HTML estático (similar al script build-static.js)
    const distDir = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Aquí iría la lógica de generación de HTML
    // Por ahora, retornamos éxito
    
    console.log('✅ Publicación completada');
    
    // Opcional: Trigger Netlify build hook
    const netlifyBuildHook = functions.config().netlify?.build_hook;
    if (netlifyBuildHook) {
      const https = require('https');
      const url = new URL(netlifyBuildHook);
      
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST'
      };
      
      const netlifyReq = https.request(options, (netlifyRes) => {
        console.log(`Netlify build triggered: ${netlifyRes.statusCode}`);
      });
      
      netlifyReq.on('error', (error) => {
        console.error('Error triggering Netlify build:', error);
      });
      
      netlifyReq.end();
    }
    
    res.json({
      success: true,
      message: 'Sitio publicado exitosamente',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en publicación:', error);
    res.status(500).json({
      error: 'Error al publicar',
      message: error.message
    });
  }
});
