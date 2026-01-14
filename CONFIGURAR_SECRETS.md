# 🔐 Configurar Secrets - Guía Paso a Paso

## 📋 Valores que Necesitas

### 1. NETLIFY_SITE_ID
- **Obtener:** `netlify status` (después de `netlify init`)
- **O desde:** Netlify Dashboard → Site settings → General → Site details → Site ID

### 2. NETLIFY_AUTH_TOKEN
- **Obtener:** `netlify auth:token`
- **O desde:** https://app.netlify.com/user/applications → New access token

### 3. FIREBASE_SERVICE_ACCOUNT
- **Ya lo tienes:** `service-account-key.json`
- **Copiar:** Todo el contenido del archivo (desde `{` hasta `}`)

## 🚀 Pasos para Configurar

### Paso 1: Configurar Netlify (si aún no lo has hecho)

```bash
# Login
netlify login

# Inicializar proyecto
netlify init
```

Cuando te pregunte:
- **Create & configure a new site** → Sí
- **Site name:** `lucho-web-cms`
- **Build command:** (deja vacío)
- **Publish directory:** `dist`

### Paso 2: Obtener los Valores

```bash
# Obtener Site ID
netlify status
# Copia el "Site ID" que aparece

# Obtener Auth Token
netlify auth:token
# Copia el token que aparece

# Ver el Service Account (para copiar)
cat service-account-key.json
# Copia TODO el contenido JSON
```

### Paso 3: Agregar Secrets en GitHub

Ve a: **https://github.com/colbapnauj/lucho-web-cms/settings/secrets/actions**

Agrega cada secret haciendo clic en "New repository secret":

#### Secret 1: NETLIFY_SITE_ID
- **Name:** `NETLIFY_SITE_ID`
- **Secret:** (pega el Site ID que obtuviste)
- **Add secret**

#### Secret 2: NETLIFY_AUTH_TOKEN
- **Name:** `NETLIFY_AUTH_TOKEN`
- **Secret:** (pega el token que obtuviste)
- **Add secret**

#### Secret 3: FIREBASE_SERVICE_ACCOUNT
- **Name:** `FIREBASE_SERVICE_ACCOUNT`
- **Secret:** (pega TODO el contenido del JSON de `service-account-key.json`)
- **Add secret**

### Paso 4: Configurar Variable en Netlify (Opcional)

Solo si quieres que Netlify también pueda hacer builds:

1. Ve a: **https://app.netlify.com/sites/YOUR_SITE/settings/env**
   (Reemplaza YOUR_SITE con el nombre de tu sitio)

2. Haz clic en **"Add environment variable"**

3. Agrega:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** (pega TODO el contenido del JSON de `service-account-key.json`)
   - **Scopes:** ✅ Marca "Builds"
   - **Save**

⚠️ **Nota:** Si solo usas GitHub Actions, NO necesitas este paso.

## ✅ Verificar Configuración

### En GitHub:
1. Ve a: https://github.com/colbapnauj/lucho-web-cms/settings/secrets/actions
2. Deberías ver los 3 secrets listados:
   - ✅ NETLIFY_SITE_ID
   - ✅ NETLIFY_AUTH_TOKEN
   - ✅ FIREBASE_SERVICE_ACCOUNT

### En Netlify (si lo configuraste):
1. Ve a: Site settings → Environment variables
2. Deberías ver `FIREBASE_SERVICE_ACCOUNT` en la lista

## 🧪 Probar el Workflow

Después de configurar todo:

```bash
# Hacer commit y push
git add .
git commit -m "Configure deployment secrets"
git push origin main
```

Luego:
1. Ve a: https://github.com/colbapnauj/lucho-web-cms/actions
2. Deberías ver el workflow "Deploy to Netlify" ejecutándose
3. Revisa los logs para verificar que todo funcione

## 📝 Resumen de URLs

- **GitHub Secrets:** https://github.com/colbapnauj/lucho-web-cms/settings/secrets/actions
- **Netlify Env Vars:** https://app.netlify.com/sites/YOUR_SITE/settings/env
- **Netlify Tokens:** https://app.netlify.com/user/applications
- **GitHub Actions:** https://github.com/colbapnauj/lucho-web-cms/actions

## ⚠️ Troubleshooting

### No puedo obtener NETLIFY_SITE_ID
- Asegúrate de haber ejecutado `netlify init`
- O obtén el Site ID desde Netlify Dashboard

### No puedo obtener NETLIFY_AUTH_TOKEN
- Genera un nuevo token desde: https://app.netlify.com/user/applications
- El token solo se muestra una vez, guárdalo bien

### Error al agregar secret en GitHub
- Verifica que el repositorio exista
- Verifica que tengas permisos de administrador
- Revisa que el nombre del secret sea exacto (case-sensitive)
