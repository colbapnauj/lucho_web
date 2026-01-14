import { ContentModel } from './ContentModel.js';

/**
 * Modelo para proyectos
 */
export class ProjectModel extends ContentModel {
  constructor(data = {}) {
    super(data);
    this.imageUrl = data.imageUrl || '';
    this.title = data.title || '';
    this.subtitle = data.subtitle || '';
    this.order = data.order || 0;
  }
  
  validate() {
    const errors = [];
    
    if (!this.title || this.title.trim() === '') {
      errors.push('El título es requerido');
    }
    
    if (!this.imageUrl || this.imageUrl.trim() === '') {
      errors.push('La URL de la imagen es requerida');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
