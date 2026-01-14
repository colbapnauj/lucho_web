# 🔐 Agregar Secrets a GitHub para Deploy a Netlify

## Secrets Necesarios

Para que el workflow de GitHub Actions funcione correctamente, necesitas agregar estos 3 secrets:

1. **NETLIFY_SITE_ID** - ID del sitio en Netlify
2. **NETLIFY_AUTH_TOKEN** - Token de autenticación de Netlify
3. **FIREBASE_SERVICE_ACCOUNT** - Credenciales de Firebase (JSON completo)

## Paso 1: Obtener NETLIFY_SITE_ID

### Si ya tienes el proyecto en Netlify:

```bash
# Ver el Site ID
netlify status
```

O desde Netlify Dashboard:
1. Ve a tu sitio en Netlify
2. Site settings → General → Site details
3. Copia el "Site ID"

### Si aún no has creado el proyecto:

```bash
# Primero crea el proyecto
netlify init

# Luego obtén el Site ID
netlify status
```

## Paso 2: Obtener NETLIFY_AUTH_TOKEN

### Opción A: Desde Netlify CLI

```bash
netlify auth:token
```

### Opción B: Desde Netlify Dashboard

1. Ve a: https://app.netlify.com/user/applications
2. Haz clic en "New access token"
3. Dale un nombre (ej: "GitHub Actions")
4. Copia el token generado

⚠️ **IMPORTANTE:** El token solo se muestra una vez. Guárdalo bien.

## Paso 3: Obtener FIREBASE_SERVICE_ACCOUNT

Este es el contenido completo del archivo `service-account-key.json`:

```bash
# Ver el contenido
cat service-account-key.json
```

O desde el archivo:
- Abre `service-account-key.json`
- Copia TODO el contenido JSON (desde `{` hasta `}`)

## Paso 4: Agregar Secrets en GitHub

### Método 1: Desde GitHub Web (Recomendado)

1. **Ve a tu repositorio en GitHub:**
   https://github.com/colbapnauj/lucho-web-cms

2. **Navega a Settings:**
   - Haz clic en "Settings" (arriba del repositorio)
   - En el menú lateral, ve a "Secrets and variables" → "Actions"

3. **Agrega cada secret:**
   - Haz clic en "New repository secret"
   - **Name:** `NETLIFY_SITE_ID`
   - **Secret:** (pega el Site ID)
   - Haz clic en "Add secret"
   
   Repite para:
   - `NETLIFY_AUTH_TOKEN`
   - `FIREBASE_SERVICE_ACCOUNT`

### Método 2: Usando GitHub CLI (si está instalado)

```bash
# Agregar NETLIFY_SITE_ID
gh secret set NETLIFY_SITE_ID --repo colbapnauj/lucho-web-cms

# Agregar NETLIFY_AUTH_TOKEN
gh secret set NETLIFY_AUTH_TOKEN --repo colbapnauj/lucho-web-cms

# Agregar FIREBASE_SERVICE_ACCOUNT (desde archivo)
gh secret set FIREBASE_SERVICE_ACCOUNT --repo colbapnauj/lucho-web-cms < service-account-key.json
```

## Verificar que los Secrets Están Configurados

### Desde GitHub Web:

1. Ve a: Settings → Secrets and variables → Actions
2. Deberías ver los 3 secrets listados:
   - ✅ NETLIFY_SITE_ID
   - ✅ NETLIFY_AUTH_TOKEN
   - ✅ FIREBASE_SERVICE_ACCOUNT

### Desde GitHub CLI:

```bash
gh secret list --repo colbapnauj/lucho-web-cms
```

## Probar el Deploy

Una vez agregados los secrets:

1. **Haz un commit y push:**
   ```bash
   git add .
   git commit -m "Configure GitHub Actions secrets"
   git push origin main
   ```

2. **Verifica el workflow:**
   - Ve a: Actions (pestaña en GitHub)
   - Deberías ver el workflow "Deploy to Netlify" ejecutándose
   - Revisa los logs para verificar que todo funcione

## Troubleshooting

### Error: "NETLIFY_SITE_ID not found"
- Verifica que el secret esté agregado correctamente
- Revisa que el nombre sea exactamente `NETLIFY_SITE_ID` (case-sensitive)

### Error: "NETLIFY_AUTH_TOKEN is invalid"
- Genera un nuevo token en Netlify
- Asegúrate de copiar el token completo

### Error: "FIREBASE_SERVICE_ACCOUNT is invalid JSON"
- Verifica que el JSON esté completo
- Asegúrate de copiar desde `{` hasta `}`
- No debe haber saltos de línea extra al principio o final

### El workflow no se ejecuta
- Verifica que el archivo `.github/workflows/deploy-netlify.yml` esté en el repositorio
- Verifica que estés haciendo push a la rama `main` o `master`

## Estructura de Secrets

```
GitHub Repository Settings
└── Secrets and variables
    └── Actions
        ├── NETLIFY_SITE_ID: "abc123..."
        ├── NETLIFY_AUTH_TOKEN: "nfp_..."
        └── FIREBASE_SERVICE_ACCOUNT: "{...JSON completo...}"
```

## Seguridad

⚠️ **IMPORTANTE:**
- Nunca subas `service-account-key.json` al repositorio
- Los secrets en GitHub están encriptados
- Solo los workflows pueden acceder a los secrets
- No se pueden ver los valores de los secrets después de crearlos
