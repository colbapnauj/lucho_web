# Lucho Web - CMS para Landing Page de Arquitectura

Sistema de gestión de contenido (CMS) para la landing page de arquitectura.

## 🚀 Características

- **Gestión de contenido**: Edita todas las secciones de la landing page
- **Firebase Integration**: Base de datos en tiempo real y autenticación
- **Cloudinary**: Gestión de imágenes en la nube
- **POO**: Arquitectura orientada a objetos con clases ES6
- **Vanilla JS**: Sin frameworks pesados, solo JavaScript moderno

## 📁 Estructura del Proyecto

```
lucho_web/
├── index.html              # Página pública
├── admin.html              # Panel de administración
├── styles.css              # Estilos de la página pública
├── admin.css               # Estilos del panel admin
├── script.js               # JavaScript público
├── admin.js                # JavaScript del CMS
├── firebase-config.js      # Configuración de Firebase
├── package.json            # Dependencias
├── src/
│   ├── models/            # Modelos POO
│   │   ├── ContentModel.js
│   │   ├── SectionModel.js
│   │   ├── ProjectModel.js
│   │   ├── TestimonialModel.js
│   │   └── FAQModel.js
│   ├── services/          # Servicios
│   │   ├── FirebaseService.js
│   │   ├── AuthService.js
│   │   └── ContentService.js
│   ├── controllers/       # Controladores
│   └── utils/             # Utilidades
│       └── cloudinary-config.js
└── README.md
```

## ⚙️ Configuración

### 1. Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita **Realtime Database** o **Firestore**
3. Habilita **Authentication** con Email/Password
4. Copia las credenciales a `firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  databaseURL: "TU_DATABASE_URL",
  projectId: "TU_PROJECT_ID",
  // ...
};
```

### 2. Cloudinary

1. Crea una cuenta en [Cloudinary](https://cloudinary.com/)
2. Obtén tu `cloud_name` y `upload_preset`
3. Configura en `src/utils/cloudinary-config.js`:

```javascript
export const cloudinaryConfig = {
  cloudName: 'TU_CLOUD_NAME',
  uploadPreset: 'TU_UPLOAD_PRESET',
  apiKey: 'TU_API_KEY'
};
```

### 3. Instalación

```bash
# Instalar dependencias
npm install

# O si prefieres usar directamente
# Asegúrate de tener Firebase SDK disponible
```

## 🔐 Autenticación

Para acceder al CMS:

1. Abre `admin.html` en tu navegador
2. Inicia sesión con las credenciales de Firebase
3. Si no tienes usuario, créalo desde Firebase Console o implementa registro

## 📝 Uso del CMS

### Secciones Editables

- **Hero**: Título, pre-título, botón, imagen de fondo
- **Servicios**: Header, título, texto, botón
- **Proyectos**: Lista de proyectos con imagen, título y subtítulo
- **Testimonios**: Lista de testimonios con avatar, nombre, posición y texto
- **FAQ**: Preguntas y respuestas frecuentes
- **Localidades**: Ciudades y descripciones
- **Footer**: Información de contacto y redes sociales

### Agregar Items

1. Navega a la sección deseada (Proyectos, Testimonios, etc.)
2. Haz clic en "Agregar [Item]"
3. Completa el formulario
4. Sube imágenes usando el botón "Subir Imagen" (Cloudinary)
5. Guarda los cambios

### Editar Contenido

1. Navega a la sección
2. Los formularios se llenan automáticamente con el contenido actual
3. Modifica los campos
4. Haz clic en "Guardar Cambios"

## 🛠️ Desarrollo

### Servidor Local

```bash
# Usar http-server
npm run dev

# O cualquier servidor estático
python -m http.server 8080
```

### Estructura de Datos en Firebase

El contenido se guarda en la siguiente estructura:

```
content/
├── hero/
├── services/
├── projects/
│   └── items/
├── testimonials/
│   └── items/
├── faq/
│   └── items/
└── ...
```

## 🔒 Seguridad

Asegúrate de configurar las reglas de seguridad en Firebase:

```json
{
  "rules": {
    "content": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## 📦 Tecnologías

- **Firebase**: Base de datos y autenticación
- **Cloudinary**: Gestión de imágenes
- **Vanilla JavaScript**: ES6+ modules
- **POO**: Clases y herencia

## 🚧 Próximas Mejoras

- [ ] Preview en tiempo real
- [ ] Historial de versiones
- [ ] Drag & drop para reordenar items
- [ ] Validaciones avanzadas
- [ ] Exportar/Importar contenido
- [ ] Roles y permisos

## 📄 Licencia

ISC
