// Script para cargar contenido desde Firebase en index.html
// Este script se carga en index.html para poblar el contenido dinámicamente

import { database, ref, get, onValue } from './firebase-config-cdn.js';

class ContentLoader {
  constructor() {
    this.contentPath = 'content';
    this.init();
  }
  
  async init() {
    try {
      await this.loadHero();
      // Aquí se pueden cargar más secciones
    } catch (error) {
      console.error('Error loading content:', error);
    }
  }
  
  /**
   * Carga la sección Hero desde Firebase
   */
  async loadHero() {
    try {
      const heroRef = ref(database, `${this.contentPath}/hero`);
      const snapshot = await get(heroRef);
      
      if (snapshot.exists()) {
        const heroData = snapshot.val();
        this.updateHero(heroData);
      }
    } catch (error) {
      console.error('Error loading hero:', error);
    }
  }
  
  /**
   * Actualiza el Hero en la página
   */
  updateHero(data) {
    // Actualizar imagen
    const heroImage = document.getElementById('hero-image');
    if (heroImage && data.imageUrl) {
      heroImage.src = data.imageUrl;
    }
    
    // Actualizar pre-título
    const heroPretitle = document.getElementById('hero-pretitle');
    if (heroPretitle && data.pretitle) {
      heroPretitle.textContent = data.pretitle;
    }
    
    // Actualizar título
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle && data.title) {
      heroTitle.textContent = data.title;
    }
    
    // Actualizar botón
    const heroButton = document.getElementById('hero-button');
    if (heroButton) {
      // Actualizar texto
      if (data.buttonText) {
        heroButton.textContent = data.buttonText;
      }
      
      // Actualizar enlace/acción
      if (data.buttonLink && data.buttonLink.trim()) {
        const linkValue = data.buttonLink.trim();
        if (linkValue.startsWith('#')) {
          // Ancla interno
          heroButton.href = linkValue;
          heroButton.removeAttribute('target');
          heroButton.removeAttribute('rel');
        } else if (linkValue.startsWith('http://') || linkValue.startsWith('https://')) {
          // URL externa
          heroButton.href = linkValue;
          heroButton.target = '_blank';
          heroButton.rel = 'noopener noreferrer';
        } else {
          // Asumir que es un ancla si no tiene protocolo
          heroButton.href = `#${linkValue}`;
          heroButton.removeAttribute('target');
          heroButton.removeAttribute('rel');
        }
      } else {
        // Sin enlace - deshabilitar
        heroButton.href = '#';
        heroButton.onclick = (e) => e.preventDefault();
      }
    }
  }
  
  /**
   * Escucha cambios en tiempo real (opcional)
   */
  watchHero() {
    const heroRef = ref(database, `${this.contentPath}/hero`);
    onValue(heroRef, (snapshot) => {
      if (snapshot.exists()) {
        const heroData = snapshot.val();
        this.updateHero(heroData);
      }
    });
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.contentLoader = new ContentLoader();
  });
} else {
  window.contentLoader = new ContentLoader();
}
