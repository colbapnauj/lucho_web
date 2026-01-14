import { ContentModel } from './ContentModel.js';

/**
 * Modelo para testimonios
 */
export class TestimonialModel extends ContentModel {
  constructor(data = {}) {
    super(data);
    this.avatarUrl = data.avatarUrl || '';
    this.name = data.name || '';
    this.position = data.position || '';
    this.text = data.text || '';
    this.order = data.order || 0;
  }
  
  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim() === '') {
      errors.push('El nombre es requerido');
    }
    
    if (!this.text || this.text.trim() === '') {
      errors.push('El texto del testimonio es requerido');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
