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
  options.timeout = 10000; // 10 segundos timeout
  return { url, options };
};

export default pb;
