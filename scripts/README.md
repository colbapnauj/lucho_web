# Scripts de Administración

## Crear Usuario Admin

Este script crea un usuario con claim "admin" usando Firebase Admin SDK.

### Prerrequisitos

1. **Obtener Service Account Key**:
   - Ve a [Firebase Console](https://console.firebase.google.com/project/lucho-web-cms/settings/serviceaccounts/adminsdk)
   - Haz clic en "Generate new private key"
   - Descarga el archivo JSON
   - Renómbralo a `service-account-key.json`
   - Colócalo en la raíz del proyecto: `/Users/jean/dev/lucho_web/service-account-key.json`

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

### Uso

```bash
node scripts/create-admin-user.js <email> <password>
```

### Ejemplo

```bash
node scripts/create-admin-user.js admin@lucho.com password123
```

### Comportamiento

- Si el usuario no existe: lo crea y le asigna el claim "admin"
- Si el usuario ya existe: actualiza sus claims a "admin" y opcionalmente actualiza la contraseña

### Claims Asignados

El script asigna los siguientes custom claims:
- `admin: true`
- `role: 'admin'`

### Seguridad

⚠️ **IMPORTANTE**: 
- El archivo `service-account-key.json` contiene credenciales sensibles
- Está incluido en `.gitignore` para no subirlo al repositorio
- Nunca compartas este archivo públicamente
- Si se compromete, revócalo inmediatamente desde Firebase Console
