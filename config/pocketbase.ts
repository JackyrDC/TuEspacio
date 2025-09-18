import pocketbase from 'pocketbase';

// Configuración de PocketBase para diferentes entornos
const getBaseUrl = () => {
  // En desarrollo, usar la IP local de la máquina
  if (process.env.NODE_ENV === 'development') {
    // Cambiar esta IP por la tuya si es diferente
    return 'https://tuespacio-db.pockethost.io/';
  }
  
  // En producción, usar la URL de tu servidor
  return 'https://tuespacio-db.pockethost.io/';
};

const pb = new pocketbase(getBaseUrl());

// Configurar timeouts para evitar esperas largas
pb.beforeSend = function (url, options) {
  // Agregar logs para debugging
  console.log('🌐 PocketBase request:', url);
  
  options.timeout = 15000; // 15 segundos timeout
  options.headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };
  
  return { url, options };
};

// Manejar errores de respuesta
pb.afterSend = function (response, data) {
  if (!response.ok) {
    console.error('❌ PocketBase response error:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });
  } else {
    console.log('✅ PocketBase response success:', response.status);
  }
  
  return data;
};

export default pb;
