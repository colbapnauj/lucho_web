/**
 * Modelo base para contenido
 * Todas las clases de contenido extienden de esta
 */
export class ContentModel {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
  
  /**
   * Genera un ID único
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  /**
   * Convierte el modelo a JSON
   */
  toJSON() {
    const json = {};
    Object.keys(this).forEach(key => {
      if (this[key] !== undefined) {
        json[key] = this[key];
      }
    });
    return json;
  }
  
  /**
   * Actualiza el modelo con nuevos datos
   */
  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
    return this;
  }
  
  /**
   * Valida los datos del modelo
   */
  validate() {
    return { valid: true, errors: [] };
  }
}
