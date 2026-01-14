/**
 * Firebase Cloud Functions
 * 
 * Exporta todas las funciones disponibles
 */

// Re-exportar la función publish desde publish.js
exports.publish = require('./publish').publish;
