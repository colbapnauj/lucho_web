# 🚀 Configuración Rápida de Secrets

## Paso 1: Configurar Netlify (si aún no lo has hecho)

```bash
# Login en Netlify
netlify login

# Inicializar proyecto
netlify init
```

Cuando te pregunte:
- Create & configure a new site → Sí
- Site name: `lucho-web-cms`
- Build command: (deja vacío o `echo "Build by GitHub Actions"`)
- Publish directory: `dist`

## Paso 2: Obtener Valores de Netlify

```bash
# Obtener Site ID
netlify status

# Obtener Auth Token
netlify auth:token
```

## Paso 3: Agregar Secrets en GitHub

### Opción A: Script Automático

```bash
bash scripts/setup-secrets.sh
```

### Opción B: GitHub CLI Manual

```bash
# Verificar login
gh auth status

# Si no estás logueado
gh auth login

# Agregar secrets
echo "TU_SITE_ID" | gh secret set NETLIFY_SITE_ID --repo colbapnauj/lucho-web-cms
echo "TU_TOKEN" | gh secret set NETLIFY_AUTH_TOKEN --repo colbapnauj/lucho-web-cms
gh secret set FIREBASE_SERVICE_ACCOUNT --repo colbapnauj/lucho-web-cms < service-account-key.json
```

### Opción C: GitHub Web

1. Ve a: https://github.com/colbapnauj/lucho-web-cms/settings/secrets/actions
2. Agrega cada secret:
   - `NETLIFY_SITE_ID`
   - `NETLIFY_AUTH_TOKEN`
   - `FIREBASE_SERVICE_ACCOUNT` (contenido completo del JSON)

## Paso 4: Configurar Variable en Netlify (Opcional)

Solo si quieres que Netlify también pueda hacer builds:

1. Ve a: https://app.netlify.com/sites/YOUR_SITE/settings/env
2. Agrega:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** (contenido completo del `service-account-key.json`)
   - **Scopes:** ✅ Builds

## Paso 5: Verificar

```bash
# Verificar secrets en GitHub
gh secret list --repo colbapnauj/lucho-web-cms

# O desde GitHub Web
# Settings → Secrets and variables → Actions
```

## Paso 6: Probar

```bash
git add .
git commit -m "Configure deployment secrets"
git push origin main
```

Luego verifica en GitHub Actions que el workflow se ejecute correctamente.
