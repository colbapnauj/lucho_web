# 🔧 Troubleshooting: Error 404 al Publicar

## ❌ Error Común

```
Error al crear commit: 404 - {"message":"Not Found",...}
```

## 🔍 Causas Posibles

### 1. Repositorio no existe o nombre incorrecto

**Verificar:**
- El repositorio existe en GitHub
- El nombre del repositorio es correcto (case-sensitive)
- El owner/usuario es correcto

**Solución:**
```bash
# Verificar configuración actual
firebase functions:config:get

# Verificar que el repositorio existe
# Visita: https://github.com/TU_USUARIO/TU_REPO
```

### 2. Token de GitHub sin permisos suficientes

**Verificar:**
- El token tiene el scope `repo` (acceso completo a repositorios)
- El token no ha expirado
- El token tiene acceso al repositorio específico

**Solución:**
1. Ve a: https://github.com/settings/tokens
2. Verifica que el token tenga el scope `repo` marcado
3. Si no, crea un nuevo token con permisos `repo`
4. Actualiza la configuración:
   ```bash
   firebase functions:config:set github.token="NUEVO_TOKEN"
   ```

### 3. Rama no existe

**Verificar:**
- La rama `main` o `master` existe en el repositorio
- El nombre de la rama es correcto

**Solución:**
```bash
# Verificar rama actual
git branch

# Configurar rama correcta
firebase functions:config:set github.branch="main"  # o "master"
```

### 4. Repositorio privado sin acceso

**Verificar:**
- Si el repositorio es privado, el token debe tener acceso
- El token debe ser de un usuario con acceso al repositorio

**Solución:**
- Asegúrate de que el token pertenece a un usuario con acceso
- O haz el repositorio público temporalmente para probar

## ✅ Verificación Paso a Paso

### Paso 1: Verificar Configuración

```bash
firebase functions:config:get
```

Deberías ver:
```json
{
  "github": {
    "token": "ghp_...",
    "owner": "tu-usuario",
    "repo": "lucho_web",
    "branch": "main"
  }
}
```

### Paso 2: Verificar Token Manualmente

```bash
# Probar acceso al repositorio con curl
curl -H "Authorization: token TU_TOKEN" \
     https://api.github.com/repos/TU_USUARIO/TU_REPO
```

Si retorna 404, el repositorio no existe o no tienes acceso.

### Paso 3: Verificar Rama

```bash
# Verificar que la rama existe
curl -H "Authorization: token TU_TOKEN" \
     https://api.github.com/repos/TU_USUARIO/TU_REPO/git/refs/heads/main
```

Si retorna 404, la rama no existe (intenta con `master`).

### Paso 4: Ver Logs de la Function

```bash
firebase functions:log --only publish
```

Busca mensajes como:
- `🔍 Verificando acceso al repositorio`
- `✅ Repositorio verificado`
- `❌ Error al obtener referencia`

## 🛠️ Soluciones Comunes

### Solución 1: Reconfigurar Todo

```bash
# 1. Obtener nuevo token de GitHub
# Ve a: https://github.com/settings/tokens
# Crea token con scope "repo"

# 2. Configurar en Firebase
firebase functions:config:set github.token="TU_NUEVO_TOKEN"
firebase functions:config:set github.owner="TU_USUARIO"
firebase functions:config:set github.repo="TU_REPO"
firebase functions:config:set github.branch="main"

# 3. Redesplegar la función
firebase deploy --only functions:publish
```

### Solución 2: Verificar Permisos del Token

1. Ve a: https://github.com/settings/tokens
2. Encuentra tu token
3. Verifica que tenga:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows) - opcional pero recomendado

### Solución 3: Usar GitHub App en lugar de Personal Token

Para mayor seguridad, considera usar una GitHub App:
- Más seguro
- Permisos granulares
- Mejor para producción

## 📝 Logs Mejorados

La función ahora incluye logs detallados:
- `🔍 Verificando acceso al repositorio`
- `✅ Repositorio verificado: owner/repo`
- `🔍 Obteniendo referencia de la rama: main`
- `✅ SHA actual obtenido: abc1234`
- `🔨 Creando commit vacío...`
- `✅ Commit creado exitosamente`

Si ves un `❌`, revisa el mensaje de error para más detalles.

## 🆘 Si Nada Funciona

1. **Verifica que el repositorio existe:**
   - Visita: `https://github.com/TU_USUARIO/TU_REPO`
   - Debe ser accesible

2. **Prueba manualmente con curl:**
   ```bash
   curl -H "Authorization: token TU_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/repos/TU_USUARIO/TU_REPO
   ```

3. **Revisa los logs de Firebase:**
   ```bash
   firebase functions:log --only publish --limit 50
   ```

4. **Verifica que la función esté desplegada:**
   ```bash
   firebase functions:list
   ```
