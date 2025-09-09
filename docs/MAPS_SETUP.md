# 🗺️ Configuración de Google Maps API

## 📋 Pasos para Configurar Google Maps

### 1. **Obtener API Key de Google**

1. **Ve a Google Cloud Console**: https://console.cloud.google.com/
2. **Crea un proyecto** o selecciona uno existente
3. **Habilita las APIs**:
   - Maps SDK for Android
   - Maps SDK for iOS  
   - Places API (opcional)
4. **Ve a "Credentials" → "Create Credentials" → "API Key"**
5. **Copia tu API Key**

### 2. **Configurar en el Proyecto**

1. **Reemplaza en `app.json`**:
   ```json
   "TU_GOOGLE_MAPS_API_KEY_AQUI" → "tu_api_key_real"
   ```

2. **Crear archivo `.env`** (copia de `.env.example`):
   ```
   GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 3. **Verificar Instalación**

```bash
# Instalar dependencias
npx expo install react-native-maps

# Limpiar cache
npx expo start --clear
```

### 4. **Restricciones de Seguridad (Recomendado)**

En Google Cloud Console:
- **Application restrictions**: Restricción por bundle ID/package name
- **API restrictions**: Solo las APIs que necesitas

### 5. **Testing**

- **Desarrollo**: API key sin restricciones
- **Producción**: API key con restricciones por app

## 🔧 Características del Mapa

### ✅ **Funcionalidades Implementadas**
- **Mapa interactivo** con Google Maps
- **Marcadores personalizados** por tipo de propiedad
- **Callouts informativos** con detalles
- **Geolocalización** del usuario
- **Círculo de búsqueda** con radio configurable
- **Colores por estado** (disponible, reservado, etc.)

### 🎯 **Marcadores por Tipo**
- 🏠 Casa
- 🏢 Departamento/Oficina  
- 🏪 Local comercial
- 📍 Genérico

### 🎨 **Colores por Estado**
- 🟢 Verde: Disponible
- 🟠 Naranja: Reservado
- 🔴 Rojo: No disponible
- ⚫ Gris: Sin estado

## 🚨 **Troubleshooting**

### **Error: "Map failed to load"**
- Verificar API key válida
- Verificar APIs habilitadas
- Verificar restricciones

### **Marcadores no aparecen**
- Verificar formato de coordenadas
- Verificar datos de `places` prop

### **Error de permisos**
- Verificar permisos de ubicación
- Verificar en dispositivo real

## 💰 **Costos**

- **Maps SDK**: $7 por 1000 cargas
- **Static Maps**: $2 por 1000 cargas  
- **Places API**: Variable según uso

**Cuota gratuita**: $200/mes de crédito

---

**Estado**: ✅ Configurado para producción
**Última actualización**: 1 septiembre 2025
