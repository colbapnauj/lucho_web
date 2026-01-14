# 🚀 Crear Proyecto en Netlify - Guía Rápida

## Opción 1: Usar el Script Automático

```bash
bash setup-netlify.sh
```

Este script te guiará paso a paso.

## Opción 2: Comandos Manuales

### 1. Verificar Login

```bash
netlify status
```

Si no estás logueado:
```bash
netlify login
```

### 2. Inicializar Proyecto

```bash
netlify init
```

Esto te pedirá:
- **Create & configure a new site** → Selecciona esta opción
- **Team:** Selecciona tu equipo
- **Site name:** `lucho-web-cms` (o el que prefieras)
- **Build command:** `npm run build`
- **Directory to deploy:** `dist`
- **Netlify functions folder:** (deja vacío o presiona Enter)

### 3. Verificar Configuración

Después de `netlify init`, se creará:
- `.netlify/state.json` - Configuración del proyecto
- El proyecto estará vinculado a Netlify

### 4. Obtener Credenciales para GitHub Actions

```bash
# Obtener Site ID
netlify status

# Obtener Auth Token
netlify auth:token
```

Copia estos valores y agrégalos como secrets en GitHub:
- `NETLIFY_SITE_ID`
- `NETLIFY_AUTH_TOKEN`

## Opción 3: Desde Netlify Dashboard

1. Ve a: https://app.netlify.com/
2. "Add new site" → "Deploy manually"
3. O conecta tu repositorio de GitHub

## Verificar que Funciona

```bash
# Ver estado del proyecto
netlify status

# Hacer un deploy de prueba
npm run build
netlify deploy --dir=dist

# Deploy a producción
netlify deploy --prod --dir=dist
```

## Estructura Creada

Después de `netlify init`, tendrás:

```
.netlify/
└── state.json    # Configuración del proyecto
```

Y el proyecto estará vinculado a Netlify.

## Próximos Pasos

1. ✅ Proyecto creado en Netlify
2. ✅ Configuración guardada localmente
3. ⏭️  Agregar secrets a GitHub (si usas Actions)
4. ⏭️  Hacer primer deploy
