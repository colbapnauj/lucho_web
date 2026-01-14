import { ref, get, set, update, remove, push, onValue, database } from '../../firebase-config-cdn.js';

/**
 * Servicio base para operaciones CRUD con Firebase Realtime Database
 */
export class FirebaseService {
  constructor(path) {
    this.path = path;
    this.ref = ref(database, path);
  }
  
  /**
   * Obtiene todos los elementos
   */
  async getAll() {
    try {
      const snapshot = await get(this.ref);
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convertir objeto a array si es necesario
        if (typeof data === 'object' && !Array.isArray(data)) {
          return Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
        }
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error getting data:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un elemento por ID
   */
  async getById(id) {
    try {
      const itemRef = ref(database, `${this.path}/${id}`);
      const snapshot = await get(itemRef);
      if (snapshot.exists()) {
        return { id, ...snapshot.val() };
      }
      return null;
    } catch (error) {
      console.error('Error getting item by id:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo elemento
   */
  async create(data) {
    try {
      const newRef = push(this.ref);
      const itemData = {
        ...data,
        id: newRef.key,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await set(newRef, itemData);
      return { id: newRef.key, ...itemData };
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un elemento existente
   */
  async update(id, data) {
    try {
      const itemRef = ref(database, `${this.path}/${id}`);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await update(itemRef, updateData);
      return { id, ...updateData };
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un elemento
   */
  async delete(id) {
    try {
      const itemRef = ref(database, `${this.path}/${id}`);
      await remove(itemRef);
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza múltiples elementos (para reordenar)
   */
  async updateMultiple(updates) {
    try {
      const updateData = {};
      Object.keys(updates).forEach(id => {
        updateData[`${this.path}/${id}`] = {
          ...updates[id],
          updatedAt: new Date().toISOString()
        };
      });
      await update(ref(database), updateData);
      return true;
    } catch (error) {
      console.error('Error updating multiple items:', error);
      throw error;
    }
  }
  
  /**
   * Escucha cambios en tiempo real
   */
  onValueChange(callback) {
    return onValue(this.ref, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        callback(data);
      } else {
        callback(null);
      }
    });
  }
}
