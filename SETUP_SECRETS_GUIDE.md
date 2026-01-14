# 🔐 Guía de Configuración de Secrets

## Secrets Necesarios

### Para GitHub Actions:
1. **NETLIFY_SITE_ID** - ID del sitio en Netlify
2. **NETLIFY_AUTH_TOKEN** - Token de autenticación de Netlify
3. **FIREBASE_SERVICE_ACCOUNT** - Credenciales de Firebase (JSON completo)

### Para Netlify (Opcional):
1. **FIREBASE_SERVICE_ACCOUNT** - Solo si quieres que Netlify también haga builds

## Método Rápido: Script Automático

```bash
bash scripts/setup-secrets.sh
```

Este script:
- ✅ Obtiene automáticamente los valores de Netlify
- ✅ Lee el service-account-key.json
- ✅ Agrega los secrets a GitHub (si tienes GitHub CLI)
- ✅ Te guía para configurar Netlify

## Método Manual: Paso a Paso

### 1. Obtener NETLIFY_SITE_ID

```bash
netlify status
```

O desde Netlify Dashboard:
- Site settings → General → Site details → Site ID

### 2. Obtener NETLIFY_AUTH_TOKEN

```bash
netlify auth:token
```

O desde Netlify Dashboard:
- https://app.netlify.com/user/applications
- New access token → Copia el token

### 3. Obtener FIREBASE_SERVICE_ACCOUNT

```bash
cat service-account-key.json
```

Copia TODO el contenido JSON.

## Agregar Secrets en GitHub

### Opción A: GitHub CLI

```bash
# Verificar login
gh auth status

# Si no estás logueado
gh auth login

# Agregar secrets
echo "TU_SITE_ID" | gh secret set NETLIFY_SITE_ID --repo colbapnauj/lucho-web-cms
echo "TU_TOKEN" | gh secret set NETLIFY_AUTH_TOKEN --repo colbapnauj/lucho-web-cms
gh secret set FIREBASE_SERVICE_ACCOUNT --repo colbapnauj/lucho-web-cms < service-account-key.json

# Verificar
gh secret list --repo colbapnauj/lucho-web-cms
```

### Opción B: GitHub Web

1. Ve a: https://github.com/colbapnauj/lucho-web-cms/settings/secrets/actions
2. Haz clic en "New repository secret"
3. Agrega cada uno:
   - **Name:** `NETLIFY_SITE_ID`
   - **Secret:** (pega el Site ID)
   - Repite para `NETLIFY_AUTH_TOKEN` y `FIREBASE_SERVICE_ACCOUNT`

## Configurar Variable en Netlify (Opcional)

Solo si quieres que Netlify también pueda hacer builds:

1. Ve a: https://app.netlify.com/sites/YOUR_SITE/settings/env
2. Haz clic en "Add environment variable"
3. Agrega:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** (contenido completo del JSON)
   - **Scopes:** ✅ Builds

⚠️ **Nota:** Si usas solo GitHub Actions, NO necesitas esto.

## Verificar Configuración

### GitHub Secrets:

```bash
gh secret list --repo colbapnauj/lucho-web-cms
```

O desde GitHub Web:
- Settings → Secrets and variables → Actions
- Deberías ver los 3 secrets listados

### Netlify Variables:

Desde Netlify Dashboard:
- Site settings → Environment variables
- Deberías ver `FIREBASE_SERVICE_ACCOUNT` (si lo configuraste)

## Probar el Workflow

Después de configurar todo:

```bash
# Hacer commit y push
git add .
git commit -m "Configure secrets for deployment"
git push origin main
```

Luego:
1. Ve a GitHub Actions: https://github.com/colbapnauj/lucho-web-cms/actions
2. Deberías ver el workflow "Deploy to Netlify" ejecutándose
3. Revisa los logs para verificar que todo funcione

## Troubleshooting

### Error: "NETLIFY_SITE_ID not found"
- Verifica que el secret esté en GitHub
- Revisa que el nombre sea exacto (case-sensitive)

### Error: "NETLIFY_AUTH_TOKEN is invalid"
- Genera un nuevo token en Netlify
- Asegúrate de copiar el token completo

### Error: "FIREBASE_SERVICE_ACCOUNT is invalid"
- Verifica que el JSON esté completo
- No debe haber saltos de línea extra

### El workflow no se ejecuta
- Verifica que estés haciendo push a `main` o `master`
- Revisa que el archivo `.github/workflows/deploy-netlify.yml` esté en el repo
