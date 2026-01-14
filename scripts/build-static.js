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
      let buttonHTML = `<a href="${hero.buttonLink || '#'}" class="btn btn-hero" id="hero-button" data-cms-field="buttonText">${escapeHtml(hero.buttonText)}</a>`;
      
      // Si es URL externa, agregar target y rel
      if (hero.buttonLink && (hero.buttonLink.startsWith('http://') || hero.buttonLink.startsWith('https://'))) {
        buttonHTML = `<a href="${hero.buttonLink}" class="btn btn-hero" id="hero-button" data-cms-field="buttonText" target="_blank" rel="noopener noreferrer">${escapeHtml(hero.buttonText)}</a>`;
      } else if (hero.buttonLink && hero.buttonLink.startsWith('#')) {
        buttonHTML = `<a href="${hero.buttonLink}" class="btn btn-hero" id="hero-button" data-cms-field="buttonText">${escapeHtml(hero.buttonText)}</a>`;
      } else if (hero.buttonLink && hero.buttonLink.trim()) {
        // Asumir que es un ancla si no tiene protocolo
        buttonHTML = `<a href="#${hero.buttonLink}" class="btn btn-hero" id="hero-button" data-cms-field="buttonText">${escapeHtml(hero.buttonText)}</a>`;
      }
      
      html = html.replace(
        /<a[^>]*id="hero-button"[^>]*>.*?<\/a>/,
        buttonHTML
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
  
  // Reemplazar datos de Projects
  if (content.projects && content.projects.items) {
    const projects = Object.values(content.projects.items)
      .filter(p => p && (p.title || p.imageUrl)) // Solo proyectos válidos
      .sort((a, b) => (a.order || 0) - (b.order || 0)); // Ordenar por order
    
    if (projects.length > 0) {
      // Organizar proyectos en páginas de 3
      const projectsPerPage = 3;
      const pages = [];
      for (let i = 0; i < projects.length; i += projectsPerPage) {
        pages.push(projects.slice(i, i + projectsPerPage));
      }
      
      // Generar HTML de las páginas
      let projectsPagesHTML = '';
      pages.forEach((pageProjects, pageIndex) => {
        const isActive = pageIndex === 0 ? 'projects-page-active' : '';
        projectsPagesHTML += `<div class="projects-page ${isActive}">\n`;
        
        pageProjects.forEach(project => {
          const imageUrl = project.imageUrl || 'https://via.placeholder.com/400x300?text=Proyecto';
          const title = escapeHtml(project.title || 'Sin título');
          const subtitle = escapeHtml(project.subtitle || '');
          
          projectsPagesHTML += `                <div class="project-item">
                  <img src="${imageUrl}" alt="${title}" />
                  <h3 class="project-title">${title}</h3>
                  <p class="project-subtitle">${subtitle}</p>
                </div>\n`;
        });
        
        projectsPagesHTML += '              </div>\n';
      });
      
      // Generar indicadores
      let indicatorsHTML = '';
      pages.forEach((_, pageIndex) => {
        const isActive = pageIndex === 0 ? 'projects-indicator-active' : '';
        indicatorsHTML += `<button class="projects-indicator ${isActive}" data-page="${pageIndex}"></button>\n            `;
      });
      
      // Reemplazar el carrusel completo
      // Buscar desde projects-carousel-wrapper hasta el cierre de projects-indicators
      // Usar un regex más robusto que capture todo el contenido
      const projectsCarouselRegex = /<div class="projects-carousel-wrapper">[\s\S]*?<\/div>\s*<\/div>\s*<div class="projects-indicators">[\s\S]*?<\/div>/;
      const projectsCarouselHTML = `<div class="projects-carousel-wrapper">
              ${projectsPagesHTML}
            </div>
            
            <!-- Indicadores -->
            <div class="projects-indicators">
            ${indicatorsHTML}</div>`;
      
      const replaced = html.replace(projectsCarouselRegex, projectsCarouselHTML);
      if (replaced === html) {
        console.warn('⚠️  No se pudo encontrar el carrusel de proyectos en el HTML.');
        console.warn('   El carrusel se mantendrá con el contenido por defecto.');
      } else {
        html = replaced;
        console.log(`✅ ${projects.length} proyectos generados en ${pages.length} página(s)`);
      }
    } else {
      console.log('⚠️  No hay proyectos para generar');
    }
  }
  
  // Reemplazar datos de Testimonials
  if (content.testimonials && content.testimonials.items) {
    const testimonials = Object.values(content.testimonials.items)
      .filter(t => t && (t.name || t.text)) // Solo testimonios válidos
      .sort((a, b) => (a.order || 0) - (b.order || 0)); // Ordenar por order
    
    if (testimonials.length > 0) {
      let testimonialsHTML = '';
      testimonials.forEach((testimonial, index) => {
        // Alternar testimonial-item-side cada 2 items (patrón: 0, 2, 3, 5)
        const isSide = index === 0 || index === 2 || index === 3 || index === 5;
        const sideClass = isSide ? 'testimonial-item-side' : '';
        
        const avatarUrl = testimonial.avatarUrl || 'https://via.placeholder.com/100?text=Avatar';
        const name = escapeHtml(testimonial.name || 'Sin nombre');
        const position = escapeHtml(testimonial.position || '');
        const text = escapeHtml(testimonial.text || '');
        
        testimonialsHTML += `            <div class="testimonial-item ${sideClass}">
              <div class="testimonial-header">
                <div class="testimonial-avatar">
                  <img src="${avatarUrl}" alt="${name}" />
                </div>
                <div class="testimonial-info">
                  <h4 class="testimonial-name">${name.toUpperCase()}</h4>
                  <p class="testimonial-position">${position}</p>
                </div>
              </div>
              <p class="testimonial-text">«${text}»</p>
            </div>
            
            `;
      });
      
      // Reemplazar testimonials-grid
      const testimonialsGridRegex = /<div class="testimonials-grid">[\s\S]*?<\/div>/;
      const testimonialsGridHTML = `<div class="testimonials-grid">
          ${testimonialsHTML.trim()}
          </div>`;
      
      const replaced = html.replace(testimonialsGridRegex, testimonialsGridHTML);
      if (replaced === html) {
        console.warn('⚠️  No se pudo encontrar testimonials-grid en el HTML.');
      } else {
        html = replaced;
        console.log(`✅ ${testimonials.length} testimonios generados`);
      }
    } else {
      console.log('⚠️  No hay testimonios para generar');
    }
  }
  
  // Reemplazar datos de FAQ
  if (content.faq && content.faq.items) {
    const faqs = Object.values(content.faq.items)
      .filter(f => f && (f.question || f.answer)) // Solo FAQs válidos
      .sort((a, b) => (a.order || 0) - (b.order || 0)); // Ordenar por order
    
    if (faqs.length > 0) {
      let faqsHTML = '';
      faqs.forEach((faq, index) => {
        const isActive = index === 0 || faq.isActive;
        const activeClass = isActive ? 'faq-item-active' : '';
        const chevronUpStyle = isActive ? '' : 'style="display: none;"';
        const chevronDownStyle = isActive ? 'style="display: none;"' : '';
        const answerStyle = isActive ? '' : 'style="display: none;"';
        
        const question = escapeHtml(faq.question || 'Sin pregunta');
        const answer = escapeHtml(faq.answer || '');
        
        faqsHTML += `            <div class="faq-item ${activeClass}">
              <div class="faq-question">
                <h3 class="faq-question-text">${question}</h3>
                <i class="fas fa-chevron-up faq-icon faq-icon-up" ${chevronUpStyle}></i>
                <i class="fas fa-chevron-down faq-icon faq-icon-down" ${chevronDownStyle}></i>
              </div>
              <div class="faq-answer" ${answerStyle}>
                <p>${answer}</p>
              </div>
            </div>
            
            `;
      });
      
      // Reemplazar faq-list
      const faqListRegex = /<div class="faq-list">[\s\S]*?<\/div>/;
      const faqListHTML = `<div class="faq-list">
          ${faqsHTML.trim()}
          </div>`;
      
      const replaced = html.replace(faqListRegex, faqListHTML);
      if (replaced === html) {
        console.warn('⚠️  No se pudo encontrar faq-list en el HTML.');
      } else {
        html = replaced;
        console.log(`✅ ${faqs.length} FAQs generados`);
      }
    } else {
      console.log('⚠️  No hay FAQs para generar');
    }
  }
  
  // Reemplazar datos de Localities
  if (content.localities && content.localities.items) {
    const localities = Object.values(content.localities.items)
      .filter(l => l && l.name) // Solo localidades válidas
      .sort((a, b) => (a.order || 0) - (b.order || 0)); // Ordenar por order
    
    if (localities.length > 0) {
      // Organizar localidades en páginas de 2
      const localitiesPerPage = 2;
      const pages = [];
      for (let i = 0; i < localities.length; i += localitiesPerPage) {
        pages.push(localities.slice(i, i + localitiesPerPage));
      }
      
      // Generar HTML de las páginas
      let localitiesPagesHTML = '';
      pages.forEach((pageLocalities, pageIndex) => {
        const isActive = pageIndex === 0 ? 'localities-page-active' : '';
        localitiesPagesHTML += `<div class="localities-page ${isActive}">
                `;
        
        pageLocalities.forEach(locality => {
          const name = escapeHtml(locality.name || 'Sin nombre');
          const text = escapeHtml(locality.text || locality.description || '');
          
          localitiesPagesHTML += `                  <div class="locality-card">
                    <i class="fas fa-map-marker-alt locality-icon"></i>
                    <h2 class="locality-title">${name}</h2>
                    <p class="locality-text">${text}</p>
                  </div>
                `;
        });
        
        localitiesPagesHTML += `              </div>
                
                `;
      });
      
      // Generar indicadores
      let indicatorsHTML = '';
      pages.forEach((_, pageIndex) => {
        const isActive = pageIndex === 0 ? 'localities-indicator-active' : '';
        indicatorsHTML += `<button class="localities-indicator ${isActive}" data-page="${pageIndex}"></button>
              `;
      });
      
      // Reemplazar el carrusel completo
      const localitiesCarouselRegex = /<div class="localities-carousel-wrapper">[\s\S]*?<\/div>\s*<\/div>\s*<div class="localities-indicators">[\s\S]*?<\/div>/;
      const localitiesCarouselHTML = `<div class="localities-carousel-wrapper">
                ${localitiesPagesHTML.trim()}
              </div>
              
              <!-- Indicadores -->
              <div class="localities-indicators">
              ${indicatorsHTML.trim()}</div>`;
      
      const replaced = html.replace(localitiesCarouselRegex, localitiesCarouselHTML);
      if (replaced === html) {
        console.warn('⚠️  No se pudo encontrar el carrusel de localidades en el HTML.');
      } else {
        html = replaced;
        console.log(`✅ ${localities.length} localidades generadas en ${pages.length} página(s)`);
      }
    } else {
      console.log('⚠️  No hay localidades para generar');
    }
  }
  
  // Reemplazar datos del Footer
  if (content.footer) {
    const footer = content.footer;
    
    // Columna 1: Sedes (locations)
    if (footer.locations && Array.isArray(footer.locations)) {
      let locationsHTML = '';
      footer.locations.forEach(location => {
        const country = escapeHtml(location.country || '');
        const address = escapeHtml(location.address || '');
        const email = escapeHtml(location.email || '');
        const buttonText = escapeHtml(location.buttonText || 'Contacto');
        
        locationsHTML += `            <div class="footer-location">
              <h4 class="footer-location-title">${country}</h4>
              <p class="footer-location-address">${address}</p>
              <p class="footer-location-email">${email}</p>
              <button class="btn btn-footer">${buttonText}</button>
            </div>
          `;
      });
      
      const footerRow2Regex = /<div class="footer-row-2">[\s\S]*?<\/div>\s*<\/div>\s*<div class="footer-col footer-col-2">/;
      const footerRow2HTML = `<div class="footer-row-2">
          ${locationsHTML.trim()}
          </div>
        </div>
        <div class="footer-col footer-col-2">`;
      
      html = html.replace(footerRow2Regex, footerRow2HTML);
    }
    
    // Columna 2: Legal links
    if (footer.legalLinks && Array.isArray(footer.legalLinks)) {
      let legalLinksHTML = '';
      footer.legalLinks.forEach(link => {
        const url = escapeHtml(link.url || '#');
        const text = escapeHtml(link.text || '');
        legalLinksHTML += `              <a href="${url}" class="footer-link">${text}</a>
            `;
      });
      
      const footerNavRegex = /<nav class="footer-nav">[\s\S]*?<\/nav>/;
      const footerNavHTML = `<nav class="footer-nav">
            ${legalLinksHTML.trim()}
          </nav>`;
      
      html = html.replace(footerNavRegex, footerNavHTML);
    }
    
    // Columna 3: Social links
    if (footer.socialLinks && Array.isArray(footer.socialLinks)) {
      let socialLinksHTML = '';
      footer.socialLinks.forEach(link => {
        const url = escapeHtml(link.url || '#');
        const platform = escapeHtml(link.platform || '');
        const iconClass = link.iconClass || 'fab fa-facebook-f';
        const ariaLabel = escapeHtml(link.ariaLabel || platform);
        
        socialLinksHTML += `              <a href="${url}" class="footer-social-link" aria-label="${ariaLabel}" target="_blank" rel="noopener noreferrer">
                <i class="${iconClass}"></i>
              </a>
            `;
      });
      
      const footerSocialRegex = /<div class="footer-social">[\s\S]*?<\/div>/;
      const footerSocialHTML = `<div class="footer-social">
            ${socialLinksHTML.trim()}
          </div>`;
      
      html = html.replace(footerSocialRegex, footerSocialHTML);
    }
    
    console.log('✅ Footer generado');
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
  
  // Sitio estático - No se necesitan redirects
  // Netlify sirve los archivos estáticos directamente
  // No crear _redirects para evitar problemas con módulos ES6
  
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
