// Cloudinary Configuration Example
// Copia este archivo como cloudinary-config.js y reemplaza con tus credenciales

export const cloudinaryConfig = {
  cloudName: 'YOUR_CLOUD_NAME',
  uploadPreset: 'YOUR_UPLOAD_PRESET', // Opcional, para uploads directos
  apiKey: 'YOUR_API_KEY' // Solo necesario si usas API directamente
};

// URL base de Cloudinary
export const CLOUDINARY_BASE_URL = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}`;

// Función para construir URL de imagen de Cloudinary
export function getCloudinaryImageUrl(publicId, options = {}) {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;
  
  let url = `${CLOUDINARY_BASE_URL}/image/upload`;
  
  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`c_${crop}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  
  if (transformations.length > 0) {
    url += `/${transformations.join(',')}`;
  }
  
  url += `/${publicId}`;
  
  return url;
}

// Función para subir imagen a Cloudinary
export async function uploadImageToCloudinary(file, folder = 'lucho-web') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('folder', folder);
  
  try {
    const response = await fetch(CLOUDINARY_BASE_URL + '/image/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Error al subir imagen');
    }
    
    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
