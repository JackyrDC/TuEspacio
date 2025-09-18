# TuEspacio

**Plataforma móvil para alquiler de propiedades en Honduras**

Una aplicación móvil desarrollada con React Native y Expo que conecta propietarios e inquilinos, facilitando la búsqueda y gestión de propiedades en alquiler, especialmente orientada al mercado estudiantil de Comayagua.

## Tecnologías

- **React Native** 0.81.4
- **Expo** ~54.0.7
- **TypeScript** ~5.9.2
- **PocketBase** ^0.26.2
- **React Navigation** ^7.1.17
- **React Native Reanimated** ^4.1.0

## Funcionalidades

### Autenticación
- Sistema de registro e inicio de sesión
- Perfiles de usuario diferenciados por roles
- Gestión segura de sesiones

### Gestión de Propiedades
- Catálogo de propiedades con filtros
- Búsqueda por tipo y características
- Galería de fotos y detalles completos
- Información de ubicación y precios

### Sistema de Favoritos
- Guardar propiedades de interés
- Gestión de lista de favoritos
- Acceso rápido a propiedades guardadas

## Requisitos

- Node.js 16+
- npm o yarn
- Expo CLI
- Dispositivo móvil con Expo Go o emulador

## Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar PocketBase:
   - Configurar URL en `config/pocketbase.ts`
   - Crear colecciones: `users`, `places`, `favorites`, `contracts`

3. Ejecutar aplicación:
   ```bash
   npx expo start
   ```

4. Escanear código QR con Expo Go

## Estructura del Proyecto

```
src/
├── components/    # Componentes reutilizables
├── screens/       # Pantallas de la aplicación
├── context/       # Providers (AuthContext)
├── constants/     # Constantes y colores
└── types/         # Tipos TypeScript
services/          # Servicios de API
config/            # Configuración PocketBase
assets/            # Recursos multimedia
```

## Pantallas

- **Home**: Catálogo de propiedades
- **Búsqueda**: Filtros avanzados
- **Favoritos**: Propiedades guardadas
- **Perfil**: Gestión de cuenta
- **Autenticación**: Login/Registro
- **Detalles**: Información de propiedades

## Licencia

MIT License

---

Desarrollado para facilitar el alquiler de propiedades en Honduras
