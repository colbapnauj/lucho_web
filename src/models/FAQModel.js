import { ContentModel } from './ContentModel.js';

/**
 * Modelo para preguntas frecuentes
 */
export class FAQModel extends ContentModel {
  constructor(data = {}) {
    super(data);
    this.question = data.question || '';
    this.answer = data.answer || '';
    this.isActive = data.isActive || false;
    this.order = data.order || 0;
  }
  
  validate() {
    const errors = [];
    
    if (!this.question || this.question.trim() === '') {
      errors.push('La pregunta es requerida');
    }
    
    if (!this.answer || this.answer.trim() === '') {
      errors.push('La respuesta es requerida');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
