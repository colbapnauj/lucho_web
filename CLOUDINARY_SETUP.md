# 📸 Configuración de Cloudinary (Temporal)

## ⚠️ Estado Actual

La subida de imágenes a Cloudinary está configurada para funcionar **solo en local** por ahora. El archivo `src/utils/cloudinary-config.js` está en `.gitignore` por seguridad (contiene credenciales).

## 🔄 Plan de Migración

**Fase Actual (Temporal):**
- ✅ Funciona en local cuando tienes `cloudinary-config.js` configurado
- ⚠️ No funciona en producción (el archivo no se despliega por seguridad)
- 📝 Muestra un mensaje informativo cuando no está disponible

**Fase Futura (Recomendado):**
- 🎯 Mover la lógica de subida a **Cloud Functions**
- 🔐 Las credenciales estarán seguras en el backend
- ✅ Funcionará tanto en local como en producción

## 🛠️ Configuración Local (Temporal)

1. **Copiar el archivo de ejemplo:**
   ```bash
   cp src/utils/cloudinary-config.example.js src/utils/cloudinary-config.js
   ```

2. **Editar `src/utils/cloudinary-config.js`** y reemplazar:
   - `YOUR_CLOUD_NAME` → Tu Cloud Name de Cloudinary
   - `YOUR_UPLOAD_PRESET` → Tu Upload Preset (opcional)
   - `YOUR_API_KEY` → Tu API Key (solo si usas API directamente)

3. **Obtener credenciales de Cloudinary:**
   - Ve a: https://cloudinary.com/console
   - Dashboard → Settings → Product Environment Credentials

## 🚀 Migración a Cloud Functions (Próximos Pasos)

Cuando estés listo para mover a Functions:

1. **Crear Cloud Function para subida:**
   ```javascript
   // functions/upload-image.js
   exports.uploadImage = functions.https.onCall(async (data, context) => {
     // Verificar autenticación
     // Subir a Cloudinary usando credenciales del backend
     // Retornar URL de la imagen
   });
   ```

2. **Configurar secrets en Functions:**
   ```bash
   firebase functions:config:set cloudinary.cloud_name="TU_CLOUD_NAME"
   firebase functions:config:set cloudinary.api_key="TU_API_KEY"
   firebase functions:config:set cloudinary.api_secret="TU_API_SECRET"
   ```

3. **Actualizar `admin.js`** para llamar a la Function en lugar de importar directamente

## 📝 Notas

- El archivo `cloudinary-config.js` **NO** debe subirse a Git (está en `.gitignore`)
- En producción, el admin mostrará un mensaje informativo si intentas subir imágenes
- La funcionalidad completa estará disponible cuando se migre a Functions
