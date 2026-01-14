# 🚀 Configuración de Publicación desde el CMS

Este documento explica cómo configurar el sistema de publicación automática desde el panel de administración.

## 📋 Flujo de Publicación

1. **Usuario hace clic en "Publicar"** en el admin panel
2. **Cloud Function** recibe la solicitud y verifica permisos
3. **Cloud Function hace commit vacío** a GitHub usando la API
4. **GitHub Actions se dispara automáticamente** (por el push)
5. **GitHub Actions hace build** usando `npm run build`
6. **GitHub Actions despliega** a Netlify

## ⚙️ Configuración Requerida

### 1. Crear un Personal Access Token de GitHub

1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token" → "Generate new token (classic)"
3. Dale un nombre: `Firebase Functions - CMS Publish`
4. Selecciona los scopes:
   - ✅ `repo` (acceso completo a repositorios)
5. Click en "Generate token"
6. **Copia el token** (solo se muestra una vez)

### 2. Configurar Secrets en Firebase Functions

Ejecuta estos comandos en tu terminal (reemplaza los valores):

```bash
# Navegar al directorio del proyecto
cd /Users/jean/dev/lucho_web

# Configurar GitHub token
firebase functions:config:set github.token="TU_GITHUB_TOKEN_AQUI"

# Configurar owner del repositorio (tu usuario o organización)
firebase functions:config:set github.owner="TU_USUARIO_GITHUB"

# Configurar nombre del repositorio
firebase functions:config:set github.repo="lucho_web"

# Configurar rama (opcional, por defecto es 'main')
firebase functions:config:set github.branch="main"
```

### 3. Desplegar la Cloud Function

```bash
# Asegúrate de estar en el directorio del proyecto
cd /Users/jean/dev/lucho_web

# Instalar dependencias de functions (si no lo has hecho)
cd functions
npm install
cd ..

# Desplegar la función
firebase deploy --only functions:publish
```

### 4. Verificar la Configuración

Puedes verificar que la configuración esté correcta:

```bash
firebase functions:config:get
```

Deberías ver algo como:

```json
{
  "github": {
    "token": "ghp_xxxxxxxxxxxxx",
    "owner": "tu-usuario",
    "repo": "lucho_web",
    "branch": "main"
  }
}
```

## 🧪 Probar la Publicación

1. Inicia sesión en el admin panel: `https://tu-sitio.netlify.app/admin.html`
2. Haz algunos cambios en el contenido
3. Click en el botón **"Publicar"** en el header
4. Confirma la publicación
5. Verifica que:
   - Se muestre un mensaje de éxito
   - Aparezca un nuevo commit en GitHub
   - Se dispare el workflow de GitHub Actions
   - El deploy se complete en Netlify

## 🔍 Troubleshooting

### Error: "Configuración de GitHub incompleta"

- Verifica que hayas configurado todos los secrets: `github.token`, `github.owner`, `github.repo`
- Ejecuta `firebase functions:config:get` para verificar

### Error: "Error al crear commit"

- Verifica que el token de GitHub tenga permisos `repo`
- Verifica que el usuario/org y nombre del repo sean correctos
- Verifica que la rama exista (por defecto `main` o `master`)

### Error: "No autorizado" o "Solo administradores pueden publicar"

- Verifica que el usuario tenga claims de admin
- Ejecuta el script para agregar claims: `npm run claims admin TU_EMAIL`

### La función no se despliega

- Verifica que tengas Firebase CLI instalado: `firebase --version`
- Verifica que estés autenticado: `firebase login`
- Verifica que el proyecto esté configurado: `firebase projects:list`
- Verifica que tengas permisos en el proyecto de Firebase

## 📝 Notas Importantes

- El commit que se crea es **vacío** (no cambia archivos), solo dispara GitHub Actions
- GitHub Actions se ejecuta automáticamente en cada push a `main`
- El proceso completo puede tomar 2-5 minutos
- Puedes ver el progreso en: `https://github.com/TU_USUARIO/TU_REPO/actions`

## 🔐 Seguridad

- **NUNCA** compartas tu GitHub token
- El token debe tener solo los permisos necesarios (`repo`)
- Considera usar un token con expiración y renovarlo periódicamente
- Los tokens se almacenan en Firebase Functions config (encriptados)
