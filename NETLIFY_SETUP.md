# 🚀 Configuración de Netlify

## Opción 1: Crear Proyecto desde Netlify Dashboard (Recomendado)

1. **Ve a Netlify Dashboard:**
   https://app.netlify.com/

2. **Crea un nuevo sitio:**
   - Haz clic en "Add new site"
   - Selecciona "Import an existing project"
   - Conecta tu repositorio de GitHub (si lo tienes)

3. **O crea un sitio manualmente:**
   - Haz clic en "Add new site" → "Deploy manually"
   - Arrastra la carpeta `dist/` después de hacer `npm run build`

## Opción 2: Usar Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Inicializar proyecto
netlify init

# Esto te pedirá:
# - Crear y configurar un nuevo sitio
# - Nombre del sitio: lucho-web-cms
# - Build command: npm run build
# - Publish directory: dist
```

## Opción 3: Usar GitHub Actions (Automático)

Si ya tienes el repositorio en GitHub:

1. **Conecta el repositorio en Netlify:**
   - Ve a: Add new site → Import an existing project
   - Selecciona tu repositorio
   - Configura:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Node version: `18`

2. **Obtén los tokens necesarios:**
   - **NETLIFY_AUTH_TOKEN:**
     - Ve a: User settings → Applications → New access token
     - Crea un token y cópialo
   
   - **NETLIFY_SITE_ID:**
     - Ve a: Site settings → General → Site details
     - Copia el "Site ID"

3. **Agrega secrets en GitHub:**
   - Ve a tu repositorio → Settings → Secrets and variables → Actions
   - Agrega:
     - `NETLIFY_AUTH_TOKEN`
     - `NETLIFY_SITE_ID`
     - `FIREBASE_SERVICE_ACCOUNT` (contenido del JSON)

## Configuración del Proyecto

Una vez creado el proyecto, asegúrate de:

1. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

2. **Environment variables (si es necesario):**
   - No se requieren variables de entorno para el build estático
   - Los datos vienen de Firebase directamente

3. **Deploy settings:**
   - Branch to deploy: `main` o `master`
   - Deploy hook: Opcional, para triggers manuales

## Verificar el Deploy

Después de crear el proyecto:

1. **Haz un build local:**
   ```bash
   npm run build
   ```

2. **Verifica que `dist/` se haya creado:**
   ```bash
   ls -la dist/
   ```

3. **Deploy manual (si usas CLI):**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **O haz push a GitHub** (si usas GitHub Actions):
   ```bash
   git push origin main
   ```

## URLs del Proyecto

Una vez desplegado, tendrás:

- **URL de producción:** `https://lucho-web-cms.netlify.app` (o el nombre que elijas)
- **URL de preview:** Se genera automáticamente en cada PR

## Próximos Pasos

1. ✅ Crear el proyecto en Netlify
2. ✅ Configurar build settings
3. ✅ Conectar con GitHub (opcional)
4. ✅ Agregar secrets a GitHub (si usas Actions)
5. ✅ Hacer el primer deploy

## Troubleshooting

### Error: "Build command failed"
- Verifica que `service-account-key.json` esté disponible durante el build
- En GitHub Actions, asegúrate de que el secret esté configurado

### Error: "Publish directory not found"
- Verifica que el build genere la carpeta `dist/`
- Revisa los logs del build en Netlify

### Error: "Permission denied"
- Verifica que el token de Netlify sea válido
- Revisa los permisos del token
