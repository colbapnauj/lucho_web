#!/usr/bin/env node

/**
 * Script para generar build estático desde Firebase Realtime Database
 * 
 * Este script:
 * 1. Lee todos los datos de Firebase Realtime Database
 * 2. Genera archivos HTML estáticos con los datos incrustados
 * 3. Copia assets necesarios
 * 4. Crea un dist/ listo para deploy en Netlify
 * 
 * Uso:
 *   node scripts/build-static.js
 */

import admin from 'firebase-admin';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar service account key
// Primero intenta desde variable de entorno (para Netlify)
// Luego desde archivo (para local y GitHub Actions)

let serviceAccount;

// Opción 1: Desde variable de entorno (Netlify)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('✅ Service account cargado desde variable de entorno');
  } catch (error) {
    console.error('❌ Error parseando FIREBASE_SERVICE_ACCOUNT:', error.message);
    process.exit(1);
  }
} else {
  // Opción 2: Desde archivo (local y GitHub Actions)
  const serviceAccountPath = join(__dirname, '..', 'service-account-key.json');
  try {
    const serviceAccountFile = readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(serviceAccountFile);
    console.log('✅ Service account cargado desde archivo');
  } catch (error) {
    console.error('❌ Error: No se encontró el archivo service-account-key.json');
    console.error('   Este script requiere credenciales de servicio para leer Firebase');
    console.error('   Opciones:');
    console.error('   1. Tener el archivo service-account-key.json en la raíz');
    console.error('   2. O configurar la variable de entorno FIREBASE_SERVICE_ACCOUNT');
    process.exit(1);
  }
}

// Inicializar Firebase Admin
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://lucho-web-cms-default-rtdb.firebaseio.com'
    });
  }
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    console.error('❌ Error inicializando Firebase Admin:', error.message);
    process.exit(1);
  }
}

const distDir = join(__dirname, '..', 'dist');
const rootDir = join(__dirname, '..');

/**
 * Obtiene todos los datos de Firebase
 */
async function fetchAllContent() {
  console.log('📥 Obteniendo datos de Firebase Realtime Database...');
  
  try {
    const db = admin.database();
    const contentRef = db.ref('content');
    const snapshot = await contentRef.once('value');
    
    if (!snapshot.exists()) {
      console.warn('⚠️  No se encontraron datos en Firebase');
      return {};
    }
    
    const content = snapshot.val();
    console.log('✅ Datos obtenidos exitosamente');
    return content;
  } catch (error) {
    console.error('❌ Error obteniendo datos:', error.message);
    throw error;
  }
}

/**
 * Genera el HTML estático con los datos incrustados
 */
function generateStaticHTML(content) {
  console.log('📄 Generando HTML estático...');
  
  // Leer el template de index.html
  const indexTemplatePath = join(rootDir, 'index.html');
  let html = readFileSync(indexTemplatePath, 'utf8');
  
  // Reemplazar datos del Hero
  if (content.hero) {
    const hero = content.hero;
    
    // Imagen
    if (hero.imageUrl) {
      html = html.replace(
        /id="hero-image"[^>]*src="[^"]*"/,
        `id="hero-image" src="${hero.imageUrl}"`
      );
    }
    
    // Pre-título
    if (hero.pretitle) {
      html = html.replace(
        /<p[^>]*id="hero-pretitle"[^>]*>.*?<\/p>/,
        `<p class="hero-pretitle" id="hero-pretitle" data-cms-field="pretitle">${escapeHtml(hero.pretitle)}</p>`
      );
    }
    
    // Título
    if (hero.title) {
      html = html.replace(
        /<h1[^>]*id="hero-title"[^>]*>.*?<\/h1>/,
        `<h1 class="hero-title" id="hero-title" data-cms-field="title">${escapeHtml(hero.title)}</h1>`
      );
    }
    
    // Botón
    if (hero.buttonText) {
      html = html.replace(
        /<button[^>]*id="hero-button"[^>]*>.*?<\/button>/,
        `<button class="btn btn-hero" id="hero-button" data-cms-field="buttonText">${escapeHtml(hero.buttonText)}</button>`
      );
    }
  }
  
  // Reemplazar datos de Services
  if (content.services) {
    const services = content.services;
    
    if (services.header) {
      html = html.replace(
        /<p[^>]*class="services-header"[^>]*>.*?<\/p>/,
        `<p class="services-header">${escapeHtml(services.header)}</p>`
      );
    }
    
    if (services.title) {
      html = html.replace(
        /<h1[^>]*class="services-title"[^>]*>.*?<\/h1>/,
        `<h1 class="services-title">${escapeHtml(services.title)}</h1>`
      );
    }
    
    if (services.text) {
      html = html.replace(
        /<p[^>]*class="services-text"[^>]*>.*?<\/p>/,
        `<p class="services-text">${escapeHtml(services.text)}</p>`
      );
    }
    
    if (services.buttonText) {
      html = html.replace(
        /<button[^>]*class="btn btn-services"[^>]*>.*?<\/button>/,
        `<button class="btn btn-services">${escapeHtml(services.buttonText)}</button>`
      );
    }
  }
  
  // Remover scripts de carga dinámica (ya tenemos los datos estáticos)
  html = html.replace(
    /<script[^>]*src="firebase-init\.js"[^>]*><\/script>\s*/g,
    ''
  );
  html = html.replace(
    /<script[^>]*src="load-content\.js"[^>]*><\/script>\s*/g,
    ''
  );
  
  // Agregar datos como JSON en un script para referencia (opcional)
  const dataScript = `
    <script type="application/json" id="static-content-data">
      ${JSON.stringify(content, null, 2)}
    </script>
  `;
  
  html = html.replace('</head>', `${dataScript}</head>`);
  
  return html;
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Copia archivos y directorios recursivamente
 */
function copyRecursive(src, dest) {
  if (!existsSync(src)) {
    console.warn(`⚠️  No existe: ${src}`);
    return;
  }
  
  const stat = statSync(src);
  
  if (stat.isDirectory()) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    
    const files = readdirSync(src);
    files.forEach(file => {
      const srcPath = join(src, file);
      const destPath = join(dest, file);
      
      // Ignorar ciertos archivos/directorios
      if (file === 'node_modules' || file === '.git' || file === 'dist' || 
          file === 'service-account-key.json' || file.startsWith('.')) {
        return;
      }
      // NOTA: admin.html, admin.js, admin.css SÍ se copian para que el admin esté disponible
      
      copyRecursive(srcPath, destPath);
    });
  } else {
    copyFileSync(src, dest);
  }
}

/**
 * Crea el directorio dist con todos los archivos necesarios
 */
async function buildDist() {
  console.log('🏗️  Construyendo directorio dist/...');
  
  // Limpiar y crear dist
  if (existsSync(distDir)) {
    // Eliminar directorio recursivamente
    const { rmSync } = await import('fs');
    rmSync(distDir, { recursive: true, force: true });
  }
  mkdirSync(distDir, { recursive: true });
  
  // Obtener datos de Firebase
  const content = await fetchAllContent();
  
  // Generar HTML estático
  const staticHTML = generateStaticHTML(content);
  writeFileSync(join(distDir, 'index.html'), staticHTML);
  
  // Copiar assets necesarios
  console.log('📦 Copiando assets...');
  
  // Copiar CSS
  if (existsSync(join(rootDir, 'styles.css'))) {
    copyFileSync(join(rootDir, 'styles.css'), join(distDir, 'styles.css'));
  }
  
  // Copiar JavaScript (sin los scripts de Firebase)
  if (existsSync(join(rootDir, 'script.js'))) {
    copyFileSync(join(rootDir, 'script.js'), join(distDir, 'script.js'));
  }
  
  // Copiar admin.html y sus assets
  console.log('📦 Copiando archivos del admin...');
  if (existsSync(join(rootDir, 'admin.html'))) {
    copyFileSync(join(rootDir, 'admin.html'), join(distDir, 'admin.html'));
  }
  if (existsSync(join(rootDir, 'admin.js'))) {
    copyFileSync(join(rootDir, 'admin.js'), join(distDir, 'admin.js'));
  }
  if (existsSync(join(rootDir, 'admin.css'))) {
    copyFileSync(join(rootDir, 'admin.css'), join(distDir, 'admin.css'));
  }
  
  // Copiar firebase-init.js (necesario para admin)
  if (existsSync(join(rootDir, 'firebase-init.js'))) {
    copyFileSync(join(rootDir, 'firebase-init.js'), join(distDir, 'firebase-init.js'));
  }
  
  // Copiar firebase-config-cdn.js (necesario para admin)
  if (existsSync(join(rootDir, 'firebase-config-cdn.js'))) {
    copyFileSync(join(rootDir, 'firebase-config-cdn.js'), join(distDir, 'firebase-config-cdn.js'));
  }
  
  // Copiar src/ (necesario para admin)
  if (existsSync(join(rootDir, 'src'))) {
    copyRecursive(join(rootDir, 'src'), join(distDir, 'src'));
  }
  
  // Copiar otros assets si existen
  const assetsToCopy = ['images', 'fonts', 'assets'];
  assetsToCopy.forEach(asset => {
    const assetPath = join(rootDir, asset);
    if (existsSync(assetPath)) {
      copyRecursive(assetPath, join(distDir, asset));
    }
  });
  
  // Crear _redirects para Netlify (SPA)
  // IMPORTANTE: Netlify sirve archivos estáticos automáticamente
  // El redirect /* solo aplica cuando el archivo NO existe físicamente
  // Los archivos con extensiones (.js, .css, etc.) se sirven automáticamente
  // Solo redirigimos rutas que NO son archivos estáticos a index.html (SPA)
  const redirectsContent = `# Redirects para SPA
# Los archivos estáticos se sirven automáticamente por Netlify
# Este redirect solo aplica a rutas que no son archivos estáticos
/*    /index.html   200
`;
  writeFileSync(join(distDir, '_redirects'), redirectsContent);
  
  // NOTA: netlify.toml ya existe en el root y no debe sobrescribirse
  
  console.log('✅ Build completado exitosamente');
  console.log(`📁 Archivos generados en: ${distDir}`);
  console.log(`\n📊 Resumen:`);
  console.log(`   - HTML estático: index.html`);
  console.log(`   - Assets copiados`);
  console.log(`   - Listo para deploy en Netlify`);
  
  // Cerrar conexiones de Firebase Admin
  if (admin.apps.length > 0) {
    await Promise.all(admin.apps.map(app => app.delete()));
  }
}

// Ejecutar build
buildDist()
  .then(() => {
    console.log('\n✅ Proceso de build finalizado');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error en el build:', error);
    process.exit(1);
  });
