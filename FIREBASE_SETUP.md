# Configuración de Firebase - Lucho Web CMS

## ✅ Proyecto Creado

- **Project ID**: `lucho-web-cms`
- **Project Number**: `622374714670`
- **Display Name**: Lucho Web CMS
- **Cuenta**: j.c.f.ex7@gmail.com

## 📋 Configuración Completada

### 1. Servicios Inicializados
- ✅ **Realtime Database**: Configurado con reglas de autenticación
- ✅ **Firestore**: Configurado en región `southamerica-east1`
- ✅ **Web App**: Creada y configurada

### 2. Credenciales Configuradas

Las credenciales están configuradas en `firebase-config.js`:

```javascript
apiKey: "AIzaSyAA-cqXn0EPGa5fnoFcHrGt1oNz2ev4Xo0"
authDomain: "lucho-web-cms.firebaseapp.com"
databaseURL: "https://lucho-web-cms-default-rtdb.firebaseio.com"
projectId: "lucho-web-cms"
storageBucket: "lucho-web-cms.firebasestorage.app"
messagingSenderId: "622374714670"
appId: "1:622374714670:web:fcf7045d13b0aa42458ebf"
```

## 🔐 Próximos Pasos Requeridos

### 1. Habilitar Authentication

Debes habilitar Authentication en Firebase Console:

1. Ve a [Firebase Console](https://console.firebase.google.com/project/lucho-web-cms)
2. Navega a **Authentication** > **Get Started**
3. Habilita el proveedor **Email/Password**
4. Opcionalmente, crea un usuario de prueba desde la consola

### 2. Verificar Realtime Database

1. Ve a **Realtime Database** en Firebase Console
2. Crea la base de datos si no existe
3. Verifica que la URL sea: `https://lucho-web-cms-default-rtdb.firebaseio.com`
4. Si la URL es diferente, actualiza `firebase-config.js`

### 3. Reglas de Seguridad

Las reglas actuales requieren autenticación para leer/escribir:

**Realtime Database** (`database.rules.json`):
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

**Firestore** (`firestore.rules`):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Uso

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Crear usuario de prueba** (desde Firebase Console o desde el código):
   - Ve a Authentication > Users > Add User
   - O implementa registro en `admin.js`

3. **Iniciar servidor local**:
   ```bash
   npm run dev
   ```

4. **Acceder al CMS**:
   - Abre `admin.html` en el navegador
   - Inicia sesión con las credenciales creadas

## 📝 Notas

- El proyecto está configurado en la región `southamerica-east1` (Brasil)
- Las reglas de seguridad requieren autenticación para todas las operaciones
- Puedes ajustar las reglas según tus necesidades en `database.rules.json` y `firestore.rules`
