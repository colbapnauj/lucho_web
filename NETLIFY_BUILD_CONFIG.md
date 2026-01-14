# 🔧 Configuración de Build en Netlify

## ⚠️ Problema

Netlify está intentando hacer el build directamente, pero falla porque no tiene acceso al `service-account-key.json` (que está en `.gitignore` por seguridad).

## ✅ Solución Recomendada: Solo GitHub Actions

**Recomendamos usar SOLO GitHub Actions para el build y deploy.** Esto es más seguro porque:

- ✅ Los secrets están en GitHub (más seguro)
- ✅ El build se hace en un entorno controlado
- ✅ Netlify solo recibe el `dist/` ya construido
- ✅ No necesitas configurar variables de entorno en Netlify

### Configurar Netlify para Solo Deploy (No Build)

1. **Ve a Netlify Dashboard:**
   https://app.netlify.com/

2. **Ve a tu sitio → Site settings → Build & deploy**

3. **Configuración de Build:**
   - **Build command:** (deja vacío o pon `echo "Build done by GitHub Actions"`)
   - **Publish directory:** `dist`
   - **Base directory:** (deja vacío)

4. **O deshabilita el build hook:**
   - Ve a: Build & deploy → Build hooks
   - No uses build hooks, solo deja que GitHub Actions despliegue

### Flujo de Trabajo

```
1. Push a GitHub
   ↓
2. GitHub Actions ejecuta:
   - Checkout code
   - Instala dependencias
   - Crea service-account-key.json desde secret
   - Ejecuta npm run build
   - Genera dist/
   ↓
3. GitHub Actions despliega dist/ a Netlify
   ↓
4. Netlify sirve el sitio estático
```

## Opción 2: Configurar Service Account en Netlify (No Recomendado)

Si realmente quieres que Netlify haga el build, puedes:

### Paso 1: Agregar Variable de Entorno en Netlify

1. Ve a: Site settings → Environment variables
2. Agrega:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** (contenido completo del JSON del service account)
   - **Scopes:** Builds

### Paso 2: Modificar el Script de Build

El script necesita leer desde variable de entorno:

```javascript
// En build-static.js, cambiar:
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Leer desde variable de entorno
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Intentar leer desde archivo
  const serviceAccountFile = readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(serviceAccountFile);
}
```

### ⚠️ Desventajas de esta Opción:

- ❌ Menos seguro (credenciales en Netlify)
- ❌ Más complejo de mantener
- ❌ Duplicación de configuración

## 🎯 Recomendación Final

**Usa SOLO GitHub Actions** para el build. Es más seguro, más simple y ya está configurado.

### Pasos para Configurar:

1. ✅ GitHub Actions ya está configurado
2. ✅ Agrega los secrets en GitHub (NETLIFY_SITE_ID, NETLIFY_AUTH_TOKEN, FIREBASE_SERVICE_ACCOUNT)
3. ✅ Deshabilita el build en Netlify (o deja el comando vacío)
4. ✅ Configura Netlify para solo servir `dist/`

### Verificar que Funciona:

1. Haz un push a `main`:
   ```bash
   git push origin main
   ```

2. Ve a GitHub Actions:
   - Deberías ver el workflow ejecutándose
   - Revisa los logs

3. Verifica en Netlify:
   - El deploy debería aparecer automáticamente
   - El sitio debería estar actualizado
