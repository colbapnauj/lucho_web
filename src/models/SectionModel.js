import { ContentModel } from './ContentModel.js';

/**
 * Modelo para secciones con header, título y texto
 */
export class SectionModel extends ContentModel {
  constructor(data = {}) {
    super(data);
    this.header = data.header || '';
    this.title = data.title || '';
    this.text = data.text || '';
    this.buttonText = data.buttonText || '';
  }
  
  validate() {
    const errors = [];
    
    if (!this.title || this.title.trim() === '') {
      errors.push('El título es requerido');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
