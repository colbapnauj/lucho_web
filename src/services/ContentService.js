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
      localities: new FirebaseService(`${this.basePath}/localities/items`),
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
            key === 'servicesCards' || key === 'localities' || key === 'gallery') {
          // Estos son arrays - Firebase los devuelve como objetos con items
          const data = await service.getAll();
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            // Si es un objeto, puede tener una estructura { items: {...} } o ser directamente los items
            if (data.items) {
              content[key] = { items: data.items };
            } else {
              content[key] = { items: data };
            }
          } else if (Array.isArray(data)) {
            // Si es un array, convertirlo a objeto con items
            const itemsObj = {};
            data.forEach((item, index) => {
              itemsObj[item.id || `item_${index}`] = item;
            });
            content[key] = { items: itemsObj };
          } else {
            content[key] = { items: {} };
          }
        } else if (key === 'navbar') {
          // Navbar tiene estructura especial: logoText + items
          const navbarData = await service.getAll();
          const itemsService = new FirebaseService(`${this.basePath}/navbar/items`);
          const itemsData = await itemsService.getAll();
          
          content[key] = {
            logoText: navbarData?.logoText || '',
            items: (itemsData && typeof itemsData === 'object' && !Array.isArray(itemsData)) ? itemsData : {}
          };
        } else {
          // Estos son objetos simples
          const data = await service.getAll();
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            // Si tiene estructura anidada, tomar el valor directo
            if (Object.keys(data).length === 1 && data[Object.keys(data)[0]]) {
              content[key] = data[Object.keys(data)[0]];
            } else {
              content[key] = data;
            }
          } else {
            content[key] = data || {};
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
