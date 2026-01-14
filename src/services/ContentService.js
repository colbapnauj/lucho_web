import { FirebaseService } from './FirebaseService.js';
import { ref, set, database } from '../../firebase-config-cdn.js';

/**
 * Servicio para gestionar el contenido de la página
 */
export class ContentService {
  constructor() {
    this.basePath = 'content';
    this.services = {
      hero: new FirebaseService(`${this.basePath}/hero`),
      services: new FirebaseService(`${this.basePath}/services`),
      banner: new FirebaseService(`${this.basePath}/banner`),
      gallery: new FirebaseService(`${this.basePath}/gallery`),
      process: new FirebaseService(`${this.basePath}/process`),
      projects: new FirebaseService(`${this.basePath}/projects/items`),
      testimonials: new FirebaseService(`${this.basePath}/testimonials/items`),
      faq: new FirebaseService(`${this.basePath}/faq/items`),
      servicesCards: new FirebaseService(`${this.basePath}/servicesCards/items`),
      ctaBanner: new FirebaseService(`${this.basePath}/ctaBanner`),
      arequipaInfo: new FirebaseService(`${this.basePath}/arequipaInfo`),
      localities: new FirebaseService(`${this.basePath}/localities/cities`),
      footer: new FirebaseService(`${this.basePath}/footer`),
      navbar: new FirebaseService(`${this.basePath}/navbar`)
    };
  }
  
  /**
   * Obtiene todo el contenido
   */
  async getAllContent() {
    try {
      const content = {};
      for (const [key, service] of Object.entries(this.services)) {
        if (key === 'projects' || key === 'testimonials' || key === 'faq' || 
            key === 'servicesCards' || key === 'localities') {
          // Estos son arrays
          content[key] = await service.getAll() || [];
        } else {
          // Estos son objetos simples
          const data = await service.getAll();
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            content[key] = Object.values(data)[0] || data;
          } else {
            content[key] = data;
          }
        }
      }
      return content;
    } catch (error) {
      console.error('Error getting all content:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene una sección específica
   */
  async getSection(sectionName) {
    const service = this.services[sectionName];
    if (!service) {
      throw new Error(`Section ${sectionName} not found`);
    }
    return await service.getAll();
  }
  
  /**
   * Guarda una sección
   */
  async saveSection(sectionName, data) {
    const service = this.services[sectionName];
    if (!service) {
      throw new Error(`Section ${sectionName} not found`);
    }
    
    // Si es una sección simple (no array), guardamos directamente
    if (sectionName === 'hero' || sectionName === 'services' || 
        sectionName === 'banner' || sectionName === 'ctaBanner' ||
        sectionName === 'arequipaInfo' || sectionName === 'footer' ||
        sectionName === 'navbar') {
      const sectionRef = ref(database, `${this.basePath}/${sectionName}`);
      const sectionData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await set(sectionRef, sectionData);
      return sectionData;
    }
    
    // Para arrays, usamos el método create/update del servicio
    throw new Error('Use createItem or updateItem for array sections');
  }
  
  /**
   * Crea un item en una sección de array
   */
  async createItem(sectionName, itemData) {
    const service = this.services[sectionName];
    if (!service) {
      throw new Error(`Section ${sectionName} not found`);
    }
    return await service.create(itemData);
  }
  
  /**
   * Actualiza un item en una sección de array
   */
  async updateItem(sectionName, itemId, itemData) {
    const service = this.services[sectionName];
    if (!service) {
      throw new Error(`Section ${sectionName} not found`);
    }
    return await service.update(itemId, itemData);
  }
  
  /**
   * Elimina un item de una sección de array
   */
  async deleteItem(sectionName, itemId) {
    const service = this.services[sectionName];
    if (!service) {
      throw new Error(`Section ${sectionName} not found`);
    }
    return await service.delete(itemId);
  }
}
