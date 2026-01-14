# 🔐 Guía de Gestión de Claims de Usuarios

Este script permite gestionar los custom claims de los usuarios de Firebase Authentication.

## 📋 Comandos Disponibles

### 1. Asignar Claim (`set`)

Asigna un claim a un usuario. Si el claim ya existe, lo actualiza.

```bash
node scripts/manage-user-claims.js set <email> <claim> <value>
```

**Ejemplos:**
```bash
# Asignar claim admin
node scripts/manage-user-claims.js set admin@lucho.com admin true

# Asignar role
node scripts/manage-user-claims.js set admin@lucho.com role editor

# Asignar número
node scripts/manage-user-claims.js set admin@lucho.com level 5

# Asignar array (como JSON string)
node scripts/manage-user-claims.js set admin@lucho.com permissions '["read","write","delete"]'
```

**Tipos de valores soportados:**
- `true` / `false` → Boolean
- `123` / `45.67` → Number
- `"texto"` → String
- `'["item1","item2"]'` → Array (como JSON string)
- `'{"key":"value"}'` → Object (como JSON string)

### 2. Remover Claim (`remove`)

Remueve un claim específico de un usuario.

```bash
node scripts/manage-user-claims.js remove <email> <claim>
```

**Ejemplo:**
```bash
node scripts/manage-user-claims.js remove admin@lucho.com role
```

### 3. Ver Claims (`get`)

Muestra todos los claims y información de un usuario.

```bash
node scripts/manage-user-claims.js get <email>
```

**Ejemplo:**
```bash
node scripts/manage-user-claims.js get admin@lucho.com
```

**Salida:**
```
📋 Información del usuario:
   Email: admin@lucho.com
   UID: abc123...
   Email verificado: true
   Creado: 15/01/2024, 10:30:00
   Último login: 15/01/2024, 14:20:00

📋 Claims:
   admin: true
   role: admin
```

### 4. Listar Usuarios (`list`)

Lista usuarios que tienen claims asignados.

```bash
# Listar todos los usuarios con claims
node scripts/manage-user-claims.js list

# Listar usuarios con un claim específico
node scripts/manage-user-claims.js list admin

# Listar usuarios con un claim y valor específico
node scripts/manage-user-claims.js list admin true
```

### 5. Asignar Admin (`admin`)

Atajo para asignar el claim admin a un usuario.

```bash
node scripts/manage-user-claims.js admin <email>
```

**Ejemplo:**
```bash
node scripts/manage-user-claims.js admin admin@lucho.com
```

Esto asigna:
- `admin: true`
- `role: 'admin'`

### 6. Remover Admin (`unadmin`)

Atajo para remover el claim admin de un usuario.

```bash
node scripts/manage-user-claims.js unadmin <email>
```

**Ejemplo:**
```bash
node scripts/manage-user-claims.js unadmin admin@lucho.com
```

## 🚀 Usando con npm scripts

También puedes usar el script npm:

```bash
npm run claims set admin@lucho.com role editor
npm run claims get admin@lucho.com
npm run claims list admin
npm run claims admin admin@lucho.com
```

## 📝 Casos de Uso Comunes

### Crear y configurar un usuario admin

```bash
# 1. Crear usuario (si no existe)
node scripts/create-admin-user.js admin@lucho.com password123

# 2. Verificar que tiene claims admin
node scripts/manage-user-claims.js get admin@lucho.com
```

### Asignar múltiples roles

```bash
# Asignar varios claims
node scripts/manage-user-claims.js set editor@lucho.com role editor
node scripts/manage-user-claims.js set editor@lucho.com permissions '["read","write"]'
node scripts/manage-user-claims.js set editor@lucho.com level 2
```

### Ver todos los admins

```bash
node scripts/manage-user-claims.js list admin
```

### Remover permisos de un usuario

```bash
# Remover claim específico
node scripts/manage-user-claims.js remove user@lucho.com permissions

# O remover admin
node scripts/manage-user-claims.js unadmin user@lucho.com
```

## ⚠️ Notas Importantes

1. **Los claims se actualizan inmediatamente**, pero el usuario debe **refrescar su token** para ver los cambios en el frontend.

2. **Para que los cambios surtan efecto en el frontend**, el usuario debe:
   - Cerrar sesión y volver a iniciar sesión, O
   - Llamar a `user.getIdToken(true)` para forzar la actualización del token

3. **Los claims son personalizados** y pueden tener cualquier estructura que necesites.

4. **Los claims se incluyen en el token ID** del usuario, así que ten cuidado con el tamaño (máximo ~1000 caracteres).

## 🔒 Seguridad

- Solo usuarios con permisos de administrador pueden ejecutar este script
- El script requiere el `service-account-key.json` con permisos de administrador
- Los claims se verifican en el frontend para controlar el acceso

## 📚 Referencias

- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
