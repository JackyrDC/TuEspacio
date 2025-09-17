# TuEspacio - Aplicación de Renta de Apartamentos

Una aplicación móvil desarrollada con React Native y Expo para facilitar la renta de apartamentos, especialmente orientada al mercado estudiantil de Comayagua.

## 🚀 Tecnologías Utilizadas

- **React Native** 0.81.4
- **Expo** 54.0.7
- **TypeScript** 5.9.2
- **PocketBase** 0.26.2 (Backend)
- **React Navigation** (Navegación)
- **Expo Linear Gradient** (Gradientes)
- **React Native Reanimated** (Animaciones)

## 📱 Características Implementadas

### ✅ Splash Screen
- Logo animado de TuEspacio
- Fondo azul plano profesional
- Frase de valor: "Encuentra alojamiento seguro en Comayagua"
- Animaciones fluidas de entrada
- Transición automática a la aplicación principal

### ✅ Sistema de Autenticación
- **Pantalla de Login/Registro**: Formulario completo con validaciones
- **Persistencia de Sesión**: Login automático al abrir la app
- **Validaciones**: Email, contraseña, confirmación, nombres
- **Manejo de Errores**: Mensajes claros y manejo de errores de red
- **Contexto Global**: Estado de autenticación disponible en toda la app
- **Integración PocketBase**: Uso completo de auth.service.ts existente

## 🎨 Diseño

### Colores Principales
- **Azul Principal**: #2563EB (moderno y profesional)
- **Azul Oscuro**: #1D4ED8
- **Rosa Salmón**: #FB7185 (secundario elegante)
- **Naranja Acento**: #F97316
- **Fondo**: #F8F9FA

### Estructura de Carpetas
```
src/
├── components/          # Componentes reutilizables
│   ├── CustomInput.tsx  # Input con validaciones y estilos
│   └── CustomButton.tsx # Botón personalizable
├── screens/            # Pantallas de la aplicación
│   ├── SplashScreen.tsx
│   ├── LoginScreen.tsx  # Login y registro
│   ├── HomeScreen.tsx
│   └── index.ts
├── navigation/         # Configuración de navegación
│   └── AppNavigator.tsx
├── context/           # Contextos React
│   └── AuthContext.tsx # Estado global de autenticación
├── constants/          # Constantes y configuración
│   └── Colors.ts
├── services/           # Servicios de API (ya existentes)
└── types/             # Tipos TypeScript (ya existentes)
```

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el proyecto:
```bash
npm start
```

3. Escanear el código QR con Expo Go en tu dispositivo móvil

## 📋 Próximos Pasos - Flujo de Usuario Estudiante

1. ✅ **Pantalla de Login/Registro** 
   - ✅ Formularios de autenticación
   - ✅ Integración con servicios de auth existentes
   - ✅ Persistencia de sesiones
   - ✅ Validaciones y manejo de errores

2. **Pantalla Principal/Home**
   - Mapa interactivo de propiedades
   - Lista de propiedades destacadas
   - Filtros de búsqueda

3. **Pantalla de Resultados**
   - Lista de propiedades filtradas
   - Tarjetas con información básica

4. **Pantalla de Detalles de Propiedad**
   - Galería de fotos
   - Información completa
   - Perfil del propietario

5. **Pantalla de Reservar/Aplicar**
   - Formulario de aplicación
   - Subida de documentos
   - Firma digital de contrato

6. **Pantalla de Mis Reservas/Contratos**
   - Contratos activos
   - Historial
   - Comunicaciones

7. **Perfil de Usuario**
   - Datos personales
   - Documentos verificados
   - Preferencias

8. **Soporte/Ayuda**
   - FAQ
   - Reportar problemas
   - Chat de soporte

## 🔗 Servicios Backend Disponibles

- `auth.service.ts` - Autenticación de usuarios
- `users.service.ts` - Gestión de usuarios
- `places.service.ts` - Gestión de propiedades
- `contracts.ts` - Gestión de contratos

## 📝 Notas de Desarrollo

- Mantener compatibilidad con las versiones especificadas
- Usar el sistema de colores definido en `Colors.ts`
- Seguir la estructura de carpetas establecida
- Implementar animaciones fluidas para mejor UX
- Priorizar simplicidad y estándares de desarrollo