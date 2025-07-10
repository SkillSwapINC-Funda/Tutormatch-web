# TutorMatch - Plataforma de Tutorías Académicas

## Descripción del Proyecto

TutorMatch es una plataforma que conecta estudiantes con tutores académicos calificados. Diseñada exclusivamente para la comunidad universitaria UPC, permite a los estudiantes encontrar apoyo académico personalizado y a los tutores ofrecer sus servicios de enseñanza. 

## Características Principales

- **Sistema de Perfiles**: Perfiles detallados para tutores y estudiantes con fotos, información académica y datos de contacto.
- **Gestión de Tutorías**: Los tutores pueden crear, editar y eliminar sus ofertas de tutoría.
- **Disponibilidad Horaria**: Sistema intuitivo para seleccionar franjas horarias disponibles.
- **Sistema de Contacto**: Facilita la comunicación entre estudiantes y tutores a través de correo o WhatsApp.
- **Interfaz Moderna**: Diseño intuitivo y atractivo con modo oscuro.
- **Centro de Soporte**: Formulario de contacto para resolver dudas o reportar problemas.

## Tecnologías Utilizadas

- **Frontend**: React 18 con TypeScript
- **Construcción**: Vite para desarrollo rápido
- **Gestión de Estados**: Context API de React
- **Estilos**: TailwindCSS para interfaces responsivas y personalizables
- **Componentes UI**: PrimeReact para componentes avanzados
- **Autenticación**: Sistema seguro con recuperación de contraseña
- **Almacenamiento**: Soporte para imágenes de perfil y tutorías

## Instalación y Configuración

1. **Clonar el repositorio**
  ```bash
  git clone https://github.com/SkillSwapINC-Funda/TutorMatch-Frontend
  cd TutorMatch-Frontend
  ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   - Crea un archivo `.env.local` basado en `.env.example`
   - Configura las variables necesarias para la conexión con el backend

4. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

## Estructura del Proyecto

El proyecto está organizado en módulos funcionales:
- `user/`: Gestión de usuarios, perfiles y autenticación
- `tutoring/`: Funcionalidades de gestión de tutorías
- `course/`: Cursos y semestres académicos
- `dashboard/`: Interfaz principal del usuario
- `public/`: Páginas públicas y componentes compartidos
- `support/`: Sistema de ayuda y soporte

## Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:
1. Crea un fork del proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feat/amazing-feature`)
3. Realiza tus cambios y haz commit (`git commit -m 'Add some amazing feature'`)
4. Sube tu rama (`git push origin feat/amazing-feature`)
5. Abre un Pull Request

## Contacto y Soporte

Para soporte técnico o consultas, contacta a:
- Correo: rdri.dev03@gmail.com
- Horario: Lunes a Viernes, 9:00 am - 6:00 pm
