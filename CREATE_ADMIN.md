# 🚀 Crear Usuario Admin - Guía Rápida

## Paso 1: Obtener Service Account Key

1. Ve a Firebase Console: https://console.firebase.google.com/project/lucho-web-cms/settings/serviceaccounts/adminsdk
2. Haz clic en **"Generate new private key"**
3. Descarga el archivo JSON
4. Renómbralo a `service-account-key.json`
5. Colócalo en la raíz del proyecto: `/Users/jean/dev/lucho_web/service-account-key.json`

⚠️ **IMPORTANTE**: Este archivo contiene credenciales sensibles. No lo subas al repositorio.

## Paso 2: Instalar Dependencias

```bash
npm install
```

## Paso 3: Crear Usuario Admin

```bash
node scripts/create-admin-user.js <email> <password>
```

### Ejemplo:

```bash
node scripts/create-admin-user.js admin@lucho.com MiPassword123
```

## Paso 4: Iniciar Sesión

1. Abre `admin.html` en tu navegador
2. Inicia sesión con el email y contraseña que creaste
3. Solo usuarios con claim "admin" podrán acceder

## ✅ Verificación

El script:
- ✅ Crea el usuario si no existe
- ✅ Asigna el claim `admin: true`
- ✅ Asigna el claim `role: 'admin'`
- ✅ Si el usuario ya existe, actualiza sus claims

## 🔒 Seguridad

- Solo usuarios con claim "admin" pueden acceder al panel
- El claim se verifica en cada login
- Si un usuario sin claim intenta acceder, se le cierra la sesión automáticamente
