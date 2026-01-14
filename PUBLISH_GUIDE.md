# 🚀 Guía de Publicación

Este proyecto tiene un sistema de publicación que genera un build estático desde Firebase Realtime Database y lo despliega en Netlify.

## 📋 Opciones de Publicación

### Opción 1: GitHub Actions (Recomendado)

**Ventajas:**
- ✅ Automático en cada push a main/master
- ✅ No requiere configuración adicional en Netlify
- ✅ Historial de builds en GitHub
- ✅ Gratis para repos públicos

**Configuración:**

1. **Agregar secrets en GitHub:**
   - Ve a: Settings → Secrets and variables → Actions
   - Agrega:
     - `FIREBASE_SERVICE_ACCOUNT`: Contenido completo del `service-account-key.json`
     - `NETLIFY_AUTH_TOKEN`: Token de Netlify (obtener desde Netlify Dashboard)
     - `NETLIFY_SITE_ID`: ID del sitio en Netlify

2. **El workflow se ejecuta automáticamente** en cada push a main/master

### Opción 2: Netlify Build Hook

**Ventajas:**
- ✅ Netlify maneja el build
- ✅ Más simple de configurar
- ✅ Builds automáticos desde Netlify

**Configuración:**

1. **Configurar Netlify:**
   - Ve a: Site settings → Build & deploy → Build hooks
   - Crea un nuevo build hook
   - Copia la URL

2. **Configurar en Firebase:**
   ```bash
   firebase functions:config:set netlify.build_hook="TU_URL_AQUI"
   ```

3. **Usar Cloud Function:**
   - La función `publish` puede trigger el build hook
   - O usar directamente desde el admin

### Opción 3: Manual

**Pasos:**

1. **Generar build localmente:**
   ```bash
   npm run build
   ```

2. **Deploy a Netlify:**
   ```bash
   # Instalar Netlify CLI
   npm install -g netlify-cli
   
   # Login
   netlify login
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

## 🏗️ Proceso de Build

El script `build-static.js` hace lo siguiente:

1. **Obtiene datos de Firebase:**
   - Lee todos los datos de `content/` en Realtime Database
   - Usa Firebase Admin SDK con service account

2. **Genera HTML estático:**
   - Lee `index.html` como template
   - Reemplaza los datos dinámicos con valores de Firebase
   - Remueve scripts de carga dinámica (ya no son necesarios)

3. **Copia assets:**
   - CSS (`styles.css`)
   - JavaScript (`script.js`)
   - Imágenes y otros assets

4. **Crea `dist/` listo para deploy:**
   - HTML estático con datos incrustados
   - Todos los assets necesarios
   - `_redirects` para Netlify (SPA)

## 📁 Estructura del Build

```
dist/
├── index.html          # HTML estático con datos
├── styles.css          # Estilos
├── script.js           # JavaScript (sin Firebase)
├── _redirects          # Configuración Netlify
└── assets/             # Imágenes, etc.
```

## 🔧 Configuración de Netlify

### Opción A: GitHub Actions (Recomendado)

1. **Conectar repositorio en Netlify:**
   - Ve a: Add new site → Import an existing project
   - Conecta tu repositorio de GitHub

2. **Configuración de build:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **O usar Netlify CLI:**
   ```bash
   netlify init
   ```

### Opción B: Deploy Manual

1. **Instalar Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

## 🎯 Flujo de Trabajo Recomendado

1. **Desarrollo:**
   - Editas contenido en `admin.html`
   - Guardas en Firebase Realtime Database
   - `index.html` se actualiza dinámicamente

2. **Publicación:**
   - Haces push a GitHub
   - GitHub Actions ejecuta el build
   - Netlify recibe el deploy automáticamente
   - El sitio público se actualiza

## 🔐 Secrets Necesarios

### Para GitHub Actions:

- `FIREBASE_SERVICE_ACCOUNT`: JSON completo del service account
- `NETLIFY_AUTH_TOKEN`: Token de Netlify
- `NETLIFY_SITE_ID`: ID del sitio

### Para Cloud Functions:

- `netlify.build_hook`: URL del build hook de Netlify

## 📝 Comandos Útiles

```bash
# Build local
npm run build

# Ver dist generado
ls -la dist/

# Deploy manual a Netlify
netlify deploy --prod --dir=dist

# Deploy preview
netlify deploy --dir=dist
```

## ⚠️ Notas Importantes

1. **Service Account Key:**
   - Nunca subas `service-account-key.json` al repositorio
   - Usa GitHub Secrets para CI/CD

2. **Datos Sensibles:**
   - El build incluye todos los datos de Firebase
   - Asegúrate de que no haya información sensible

3. **Netlify Build:**
   - El build puede tardar 1-3 minutos
   - Revisa los logs en Netlify Dashboard

## 🚀 Próximos Pasos

1. Configura GitHub Secrets
2. Conecta el repositorio a Netlify
3. Haz un push a main/master
4. Verifica que el deploy funcione
