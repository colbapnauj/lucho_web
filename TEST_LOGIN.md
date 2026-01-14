# 🧪 Guía de Prueba del Login

## ✅ Verificación de Preparación

El `admin.html` está **completamente preparado** para hacer login. Aquí está lo que está implementado:

### 1. **Formulario de Login** ✅
- Formulario HTML con campos email y password
- Validación HTML5 (required, type="email")
- Elemento para mostrar errores (`login-error`)
- Botón de submit

### 2. **Lógica de Autenticación** ✅
- `AuthService` maneja el login con Firebase Auth
- Verificación de claims admin después del login
- Manejo de errores con mensajes en español
- Cierre automático de sesión si el usuario no es admin

### 3. **Verificación de Claims** ✅
- Verifica `admin: true` o `role: 'admin'` después del login
- Bloquea acceso si el usuario no tiene claims admin
- Muestra mensajes de error apropiados

### 4. **Estado de Sesión** ✅
- Verifica sesión al cargar la página
- Escucha cambios en el estado de autenticación
- Maneja logout correctamente

## 🚀 Pasos para Probar el Login

### Paso 1: Crear Usuario Admin

```bash
# Asegúrate de tener el service-account-key.json en la raíz
node scripts/create-admin-user.js admin@lucho.com TuPassword123
```

O usando el script de gestión de claims:

```bash
# Si el usuario ya existe, solo asignar claim admin
node scripts/manage-user-claims.js admin admin@lucho.com
```

### Paso 2: Verificar que el Usuario Tiene Claims Admin

```bash
node scripts/manage-user-claims.js get admin@lucho.com
```

Deberías ver:
```
📋 Claims:
   admin: true
   role: admin
```

### Paso 3: Iniciar Servidor Local

```bash
npm run dev
```

O con cualquier servidor estático:
```bash
python -m http.server 8080
# o
npx http-server . -p 8080
```

### Paso 4: Abrir admin.html

1. Abre en el navegador: `http://localhost:8080/admin.html`
2. Deberías ver la pantalla de login

### Paso 5: Intentar Login

**Caso 1: Usuario Admin (debe funcionar)**
- Email: `admin@lucho.com`
- Password: `TuPassword123`
- Resultado esperado: ✅ Acceso al panel admin

**Caso 2: Usuario sin Claims Admin (debe fallar)**
- Si intentas con un usuario que no tiene claim admin
- Resultado esperado: ❌ "Acceso denegado. Solo usuarios admin pueden acceder."

**Caso 3: Credenciales Incorrectas (debe fallar)**
- Email: `admin@lucho.com`
- Password: `password_incorrecta`
- Resultado esperado: ❌ "Contraseña incorrecta"

## 🔍 Verificación de Funcionalidades

### ✅ Lo que DEBE funcionar:

1. **Login exitoso con usuario admin**
   - El formulario se envía correctamente
   - Se muestra el panel admin
   - Se carga el contenido desde Firebase

2. **Login fallido sin claims admin**
   - Se muestra mensaje de error
   - Se cierra la sesión automáticamente
   - Se mantiene en la pantalla de login

3. **Logout**
   - El botón de logout funciona
   - Vuelve a la pantalla de login
   - La sesión se cierra en Firebase

4. **Persistencia de sesión**
   - Si ya estás logueado, al recargar la página mantiene la sesión
   - Verifica claims admin al recargar

### ⚠️ Posibles Problemas y Soluciones

**Problema 1: "Error al cargar el contenido"**
- **Causa**: Firebase Realtime Database no está habilitado o no hay datos
- **Solución**: Verifica que Realtime Database esté habilitado en Firebase Console

**Problema 2: "Acceso denegado" aunque el usuario tiene claims**
- **Causa**: El token no se ha actualizado después de asignar claims
- **Solución**: El usuario debe cerrar sesión y volver a iniciar sesión

**Problema 3: Errores de CORS o módulos**
- **Causa**: El servidor no está sirviendo los archivos correctamente
- **Solución**: Usa un servidor HTTP (no file://), asegúrate de usar `npm run dev` o similar

**Problema 4: "Firebase: Error (auth/user-not-found)"**
- **Causa**: El usuario no existe en Firebase Auth
- **Solución**: Crea el usuario primero con el script `create-admin-user.js`

## 📝 Checklist de Verificación

Antes de probar, verifica:

- [ ] `firebase-config.js` tiene las credenciales correctas
- [ ] `service-account-key.json` existe en la raíz del proyecto
- [ ] Firebase Authentication está habilitado en Firebase Console
- [ ] Realtime Database está habilitado en Firebase Console
- [ ] El usuario admin existe y tiene claims asignados
- [ ] Estás usando un servidor HTTP (no abriendo el archivo directamente)

## 🎯 Resultado Esperado

Cuando todo esté correcto:

1. Abres `admin.html` → Ver pantalla de login
2. Ingresas credenciales admin → Ver panel admin
3. Puedes navegar entre secciones → Todo funciona
4. Puedes editar contenido → Se guarda en Firebase
5. Haces logout → Vuelves a pantalla de login

¡El sistema está completamente preparado para hacer login! 🚀
