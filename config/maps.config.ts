// Configuración para Google Maps
// Para usar este archivo:
// 1. Obtén una API Key de Google Cloud Console
// 2. Habilita la API de Maps SDK for Android/iOS
// 3. Agrega la API key a app.json

export const MAP_CONFIG = {
  // Coordenadas por defecto (Ciudad de México)
  DEFAULT_REGION: {
    latitude: 19.4326,
    longitude: -99.1332,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // Configuración de búsqueda
  DEFAULT_SEARCH_RADIUS: 5, // km
  MAX_SEARCH_RADIUS: 50, // km
  MIN_SEARCH_RADIUS: 0.5, // km
  
  // Colores para marcadores según estado
  MARKER_COLORS: {
    disponible: '#4CAF50',
    reservado: '#FF9800', 
    'no disponible': '#f44336',
    default: '#757575'
  },
  
  // Iconos para tipos de propiedades
  PLACE_ICONS: {
    casa: '🏠',
    departamento: '🏢',
    'local comercial': '🏪',
    oficina: '🏢',
    default: '📍'
  }
};

// Instrucciones para configurar Google Maps:
/*
1. Ve a Google Cloud Console (https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Maps SDK for Android
   - Maps SDK for iOS (si planeas usar iOS)
   - Places API (opcional, para autocompletado)
4. Crea credenciales > API Key
5. Agrega la API key a tu app.json:

{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "TU_API_KEY_AQUI"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "TU_API_KEY_AQUI"
      }
    }
  }
}

6. Para desarrollo, también puedes crear un archivo .env:
   GOOGLE_MAPS_API_KEY=tu_api_key_aqui
*/

export default MAP_CONFIG;
