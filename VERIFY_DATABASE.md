# 🔍 Verificar que Realtime Database esté habilitado

## Pasos para verificar:

1. **Ve a Firebase Console:**
   https://console.firebase.google.com/project/lucho-web-cms/database

2. **Verifica Realtime Database:**
   - Si ves "Realtime Database" en el menú lateral → ✅ Está habilitado
   - Si no aparece o dice "Create Database" → ⚠️ Necesitas habilitarlo

3. **Si necesitas habilitarlo:**
   - Haz clic en "Create Database"
   - Elige modo: **Production mode** (o Test mode para desarrollo)
   - Elige región: `southamerica-east1` (Brasil) o la más cercana
   - Confirma

4. **Verifica la URL:**
   - La URL debería ser: `https://lucho-web-cms-default-rtdb.firebaseio.com`
   - Si es diferente, actualiza `firebase-config.js` con la URL correcta

## Probar que funciona:

1. **Abre admin.html** y guarda cambios en Hero
2. **Ve a Firebase Console** → Realtime Database
3. **Deberías ver** la estructura `content/hero` con tus datos

## Si hay errores:

### Error: "Permission denied"
- Verifica que las reglas en `database.rules.json` permitan escritura
- Verifica que estés autenticado como admin

### Error: "Database not found"
- Realtime Database no está habilitado
- Sigue los pasos arriba para habilitarlo

### Error: "Network error"
- Verifica la URL en `firebase-config.js`
- Verifica tu conexión a internet
