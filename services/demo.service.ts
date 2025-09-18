import pb from '../config/pocketbase';

// Datos de ejemplo para la demo
const demoProperties = [
  // Casas
  {
    title: 'Casa Moderna en Colonia Palmira',
    description: 'Hermosa casa de 3 habitaciones con diseño contemporáneo. Amplia sala, cocina equipada, 2.5 baños, área de lavandería y patio trasero. Ideal para familias.',
    price: 18000,
    property_type: 'casa',
    property_status: 'active',
    size: 180,
    bedrooms: 3,
    bathrooms: 2.5,
    address: 'Colonia Palmira, Tegucigalpa',
    neighborhood: 'Palmira',
    location: { lat: 14.0723, lon: -87.1921 },
    amenities: ['parking', 'garden', 'laundry', 'security'],
    photos: [],
    views: 245,
    applications: 8,
    featured: true,
  },
  {
    title: 'Casa Familiar en Lomas del Guijarro',
    description: 'Espaciosa casa de 4 habitaciones en zona exclusiva. Sala de estar, comedor, cocina moderna, estudio, 3 baños completos y amplio jardín.',
    price: 25000,
    property_type: 'casa',
    property_status: 'active',
    size: 220,
    bedrooms: 4,
    bathrooms: 3,
    address: 'Lomas del Guijarro, Tegucigalpa',
    neighborhood: 'Lomas del Guijarro',
    location: { lat: 14.0901, lon: -87.1769 },
    amenities: ['parking', 'garden', 'security', 'pool'],
    photos: [],
    views: 189,
    applications: 12,
    featured: true,
  },
  {
    title: 'Casa de Playa en Tela',
    description: 'Casa vacacional frente al mar con vista panorámica. 2 habitaciones, terraza amplia, acceso directo a la playa. Perfecta para alquiler turístico.',
    price: 15000,
    property_type: 'casa',
    property_status: 'active',
    size: 120,
    bedrooms: 2,
    bathrooms: 2,
    address: 'Tela, Atlántida',
    neighborhood: 'Centro',
    location: { lat: 15.7817, lon: -87.4571 },
    amenities: ['beach_access', 'terrace', 'parking'],
    photos: [],
    views: 156,
    applications: 5,
    featured: false,
  },

  // Apartamentos
  {
    title: 'Apartamento Ejecutivo en Torre Morazán',
    description: 'Moderno apartamento en el piso 15 con vista a la ciudad. 2 habitaciones, 2 baños, sala-comedor, cocina equipada, área de lavandería y balcón.',
    price: 12000,
    property_type: 'apartamento',
    property_status: 'active',
    size: 90,
    bedrooms: 2,
    bathrooms: 2,
    address: 'Colonia Los Próceres, Tegucigalpa',
    neighborhood: 'Los Próceres',
    location: { lat: 14.0833, lon: -87.1667 },
    amenities: ['elevator', 'security', 'gym', 'pool', 'parking'],
    photos: [],
    views: 320,
    applications: 15,
    featured: true,
  },
  {
    title: 'Apartamento Amueblado en Colonia Kennedy',
    description: 'Acogedor apartamento completamente amueblado. 1 habitación principal, baño completo, sala-comedor integrada, cocina equipada. Listo para habitar.',
    price: 8500,
    property_type: 'apartamento',
    property_status: 'active',
    size: 65,
    bedrooms: 1,
    bathrooms: 1,
    address: 'Colonia Kennedy, Tegucigalpa',
    neighborhood: 'Kennedy',
    location: { lat: 14.0889, lon: -87.1833 },
    amenities: ['furnished', 'parking', 'security'],
    photos: [],
    views: 198,
    applications: 7,
    featured: false,
  },
  {
    title: 'Apartamento de Lujo en Multiplaza',
    description: 'Exclusivo apartamento de 3 habitaciones cerca de Multiplaza. Acabados de primera, área social amplia, terraza con vista, 2 parqueos.',
    price: 20000,
    property_type: 'apartamento',
    property_status: 'active',
    size: 140,
    bedrooms: 3,
    bathrooms: 2.5,
    address: 'Boulevares, Tegucigalpa',
    neighborhood: 'Boulevares',
    location: { lat: 14.0667, lon: -87.1500 },
    amenities: ['elevator', 'security', 'gym', 'pool', 'parking', 'terrace'],
    photos: [],
    views: 412,
    applications: 23,
    featured: true,
  },

  // Habitaciones
  {
    title: 'Habitación Privada en Casa Familiar',
    description: 'Habitación privada con baño propio en casa familiar. Incluye muebles básicos, wifi, uso de áreas comunes y servicios básicos incluidos.',
    price: 4500,
    property_type: 'habitacion',
    property_status: 'active',
    size: 25,
    bedrooms: 1,
    bathrooms: 1,
    address: 'Colonia Las Minitas, Tegucigalpa',
    neighborhood: 'Las Minitas',
    location: { lat: 14.0756, lon: -87.1944 },
    amenities: ['wifi', 'furnished', 'shared_kitchen', 'parking'],
    photos: [],
    views: 89,
    applications: 3,
    featured: false,
  },
  {
    title: 'Suite para Estudiantes UNAH',
    description: 'Habitación tipo suite cerca de Ciudad Universitaria. Baño privado, área de estudio, wifi de alta velocidad. Ideal para estudiantes.',
    price: 5200,
    property_type: 'habitacion',
    property_status: 'active',
    size: 30,
    bedrooms: 1,
    bathrooms: 1,
    address: 'Colonia Ciudad Universitaria, Tegucigalpa',
    neighborhood: 'Ciudad Universitaria',
    location: { lat: 14.0889, lon: -87.1667 },
    amenities: ['wifi', 'furnished', 'study_area', 'shared_kitchen'],
    photos: [],
    views: 134,
    applications: 9,
    featured: false,
  },

  // Locales Comerciales
  {
    title: 'Local Comercial en Comayagüela',
    description: 'Amplio local comercial en zona de alto tráfico. Ideal para restaurante, tienda o oficina. Ubicación estratégica con fácil acceso.',
    price: 15000,
    property_type: 'local',
    property_status: 'active',
    size: 100,
    bedrooms: 0,
    bathrooms: 2,
    address: 'Comayagüela, Francisco Morazán',
    neighborhood: 'Centro',
    location: { lat: 14.0819, lon: -87.2167 },
    amenities: ['commercial_zone', 'parking', 'high_traffic'],
    photos: [],
    views: 78,
    applications: 4,
    featured: false,
  },

  // Oficinas
  {
    title: 'Oficina Ejecutiva en Torre Corporativa',
    description: 'Moderna oficina en el corazón financiero de la ciudad. Acabados de lujo, aire acondicionado, internet de alta velocidad, recepción compartida.',
    price: 12000,
    property_type: 'oficina',
    property_status: 'active',
    size: 60,
    bedrooms: 0,
    bathrooms: 1,
    address: 'Colonia Palmira, Tegucigalpa',
    neighborhood: 'Palmira',
    location: { lat: 14.0728, lon: -87.1917 },
    amenities: ['elevator', 'security', 'parking', 'reception', 'wifi'],
    photos: [],
    views: 95,
    applications: 6,
    featured: false,
  }
];

export const populateDemoData = async () => {
  try {
    console.log('🌱 Iniciando población de datos de demo...');
    
    // Verificar conexión
    await pb.health.check();
    console.log('✅ Conexión a PocketBase exitosa');
    
    let createdCount = 0;
    let errorCount = 0;
    
    for (const propertyData of demoProperties) {
      try {
        // Verificar si ya existe una propiedad similar
        const existing = await pb.collection('places').getList(1, 1, {
          filter: `title = "${propertyData.title}"`
        });
        
        if (existing.items.length > 0) {
          console.log(`⏭️  Propiedad "${propertyData.title}" ya existe, saltando...`);
          continue;
        }
        
        // Crear la propiedad
        const record = await pb.collection('places').create(propertyData);
        console.log(`✅ Creada: ${propertyData.title} (ID: ${record.id})`);
        createdCount++;
        
        // Pequeña pausa para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Error creando "${propertyData.title}":`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 RESUMEN:');
    console.log(`✅ Propiedades creadas: ${createdCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📋 Total procesadas: ${demoProperties.length}`);
    
    return {
      success: true,
      created: createdCount,
      errors: errorCount,
      total: demoProperties.length
    };
    
  } catch (error) {
    console.error('❌ Error poblando datos de demo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

export const clearDemoData = async () => {
  try {
    console.log('🧹 Limpiando datos de demo...');
    
    // Obtener todas las propiedades
    const allProperties = await pb.collection('places').getFullList();
    
    let deletedCount = 0;
    
    for (const property of allProperties) {
      try {
        await pb.collection('places').delete(property.id);
        console.log(`🗑️  Eliminada: ${property.title}`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Error eliminando "${property.title}":`, error);
      }
    }
    
    console.log(`\n✅ Eliminadas ${deletedCount} propiedades`);
    return { success: true, deleted: deletedCount };
    
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

export default {
  populateDemoData,
  clearDemoData,
  demoProperties
};