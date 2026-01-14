# 📦 Crear Repositorio en GitHub - Guía

## Opción 1: Usar GitHub CLI (Recomendado)

### Prerrequisitos

1. **Instalar GitHub CLI:**
   ```bash
   brew install gh
   ```

2. **Login:**
   ```bash
   gh auth login
   ```

### Crear Repositorio

```bash
bash create-github-repo.sh
```

O manualmente:

```bash
gh repo create lucho-web-cms \
  --description "CMS para landing page de arquitectura con Firebase y Netlify" \
  --public \
  --source=. \
  --remote=origin \
  --push
```

## Opción 2: Desde GitHub Web

1. **Ve a GitHub:**
   https://github.com/new

2. **Configura el repositorio:**
   - Repository name: `lucho-web-cms`
   - Description: "CMS para landing page de arquitectura con Firebase y Netlify"
   - Visibility: Public (o Private)
   - NO inicialices con README, .gitignore o license (ya los tenemos)

3. **Crea el repositorio**

4. **Conecta el repositorio local:**
   ```bash
   git remote add origin https://github.com/colbapnauj/lucho-web-cms.git
   git branch -M main
   git push -u origin main
   ```

## Opción 3: Comandos Git Manuales

Si ya creaste el repo en GitHub:

```bash
# Agregar remoto
git remote add origin https://github.com/colbapnauj/lucho-web-cms.git

# Verificar remoto
git remote -v

# Hacer commit de todos los cambios
git add .
git commit -m "Initial commit: CMS con Firebase y Netlify"

# Push al repositorio
git branch -M main
git push -u origin main
```

## Después de Crear el Repositorio

### 1. Agregar Secrets para GitHub Actions

Ve a: Settings → Secrets and variables → Actions

Agrega estos secrets:

- **NETLIFY_SITE_ID**
  - Obtener con: `netlify status` (después de `netlify init`)

- **NETLIFY_AUTH_TOKEN**
  - Obtener con: `netlify auth:token`

- **FIREBASE_SERVICE_ACCOUNT**
  - Contenido completo del archivo `service-account-key.json`
  - Copia todo el JSON

### 2. Verificar Workflow

El workflow `.github/workflows/deploy-netlify.yml` se ejecutará automáticamente en cada push a `main` o `master`.

### 3. Hacer el Primer Push

```bash
# Agregar todos los archivos
git add .

# Commit
git commit -m "Initial commit: CMS completo con Firebase y Netlify"

# Push
git push origin main
```

## Estructura del Repositorio

```
lucho-web-cms/
├── .github/
│   └── workflows/
│       └── deploy-netlify.yml    # CI/CD automático
├── src/                          # Código fuente
├── scripts/                      # Scripts de utilidad
├── admin.html                    # Panel de administración
├── index.html                    # Landing page pública
├── netlify.toml                  # Configuración Netlify
├── firebase.json                 # Configuración Firebase
└── package.json                  # Dependencias
```

## URLs del Proyecto

Después de configurar todo:

- **Repositorio:** https://github.com/colbapnauj/lucho-web-cms
- **Netlify:** https://lucho-web-cms.netlify.app (o el nombre que elijas)
- **Admin:** https://lucho-web-cms.netlify.app/admin.html

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/colbapnauj/lucho-web-cms.git
```

### Error: "Permission denied"
- Verifica que estés logueado: `gh auth status`
- O usa HTTPS con token personal

### Error en GitHub Actions
- Verifica que todos los secrets estén configurados
- Revisa los logs del workflow en GitHub
