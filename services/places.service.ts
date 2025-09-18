import pb from "../config/pocketbase"
import { Places, Geopoint } from "../types/types"

// Función para testear la conexión a PocketBase
const testConnection = async () => {
    try {
        console.log('🧪 Probando conexión a PocketBase...');
        
        // Test 1: Health check
        const health = await pb.health.check();
        console.log('✅ Health check exitoso:', health);
        
        // Test 2: Verificar que la colección existe
        try {
            const testQuery = await pb.collection("places").getList(1, 1);
            console.log('✅ Colección places accesible, total items:', testQuery.totalItems);
            return true;
        } catch (collectionError) {
            console.error('❌ Error accediendo a colección places:', collectionError);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error de conexión a PocketBase:', error);
        return false;
    }
};

const getPlaces = async () => {
    try {
        console.log('🏠 Cargando propiedades desde PocketBase...');
        
        // Verificar conexión primero
        const isConnected = await testConnection();
        if (!isConnected) {
            throw new Error('No se pudo establecer conexión con PocketBase');
        }
        
        // Obtener todas las propiedades reales de PocketBase
        const places = await pb.collection("places").getList(1, 50, {
            sort: '-created',
            expand: 'owner'
        });
        
        console.log(`✅ Propiedades cargadas desde PocketBase: ${places.totalItems}`);
        return places;
        
    } catch (error: any) {
        console.error('❌ Error al cargar lugares desde PocketBase:', error);
        
        // Proporcionar información más detallada del error
        if (error.response) {
            console.error('Error de respuesta:', error.response.data);
            console.error('Código de estado:', error.response.status);
        }
        
        // En caso de error, devolver estructura vacía
        return {
            page: 1,
            perPage: 50,
            totalItems: 0,
            totalPages: 0,
            items: []
        };
    }
}

const getPlaceById = async (id: string) => {
    try {
        console.log('🔍 Buscando propiedad por ID en PocketBase:', id);
        
        // Buscar directamente en PocketBase
        const place = await pb.collection("places").getOne(id, {
            expand: 'owner'
        });
        
        console.log('✅ Propiedad encontrada en PocketBase:', place.title);
        return place;
        
    } catch (error) {
        console.error('❌ Error al cargar lugar por ID desde PocketBase:', error);
        throw error;
    }
}

const getPlacebyOwner = async (id: string) => {
    try {
        console.log('🔍 Buscando propiedades para el usuario:', id);
        
        // Obtener todas las propiedades
        const allPlaces = await pb.collection("places").getFullList();
        console.log('📊 Total de propiedades en BD:', allPlaces.length);
        
        if (allPlaces.length === 0) {
            console.log('📭 No hay propiedades en la base de datos');
            return [];
        }
        
        // Debug: mostrar estructura de las primeras propiedades
        console.log('🔬 Estructura de propiedades (primeras 2):');
        allPlaces.slice(0, 2).forEach((place, index) => {
            console.log(`Propiedad ${index + 1}:`, {
                id: place.id,
                title: place.title,
                owner: place.owner,
                created_by: place.created_by,
                property_type: place.property_type,
                property_status: place.property_status
            });
        });
        
        // Filtrar propiedades del usuario usando el campo owner
        const userPlaces = allPlaces.filter((place: any) => {
            const isOwner = (
                place.owner === id ||
                place.created_by === id ||
                (typeof place.owner === 'object' && place.owner?.id === id)
            );
            
            if (isOwner) {
                console.log('✅ Encontrada propiedad:', place.title || place.id);
            }
            
            return isOwner;
        });
        
        console.log(`🎯 Propiedades del usuario encontradas: ${userPlaces.length}`);
        return userPlaces;
        
    } catch (error: any) {
        console.error('❌ Error al buscar propiedades:', error.message);
        return [];
    }
}

const getPlacebyName = async (name: string) => {
    const places = await pb.collection("places").getList(1, 50, { filter: `name = "${name}"` })
    return places
}

const getPlacesbyLocation = async (location: string) => {
    const places = await pb.collection("places").getList(1, 50, { filter: `location = "${location}"` })
    return places
}

const createPlace = async (placeData: any) => {
    try {
        console.log('=== CREANDO PROPIEDAD EN POCKETBASE ===');
        console.log('Datos recibidos:', JSON.stringify(placeData, null, 2));
        
        // Validaciones básicas antes de enviar
        if (!placeData.title || !placeData.description) {
            throw new Error('Título y descripción son requeridos');
        }
        
        if (!placeData.location || !placeData.location.lat || !placeData.location.lng) {
            throw new Error('Ubicación es requerida');
        }
        
        if (!placeData.owner) {
            throw new Error('Campo owner (propietario) es requerido');
        }
        
        // Debug específico para las coordenadas
        console.log('🌍 VALIDANDO COORDENADAS:');
        console.log('- Latitud:', placeData.location.lat, typeof placeData.location.lat);
        console.log('- Longitud:', placeData.location.lng, typeof placeData.location.lng);
        
        // Asegurar que las coordenadas sean números válidos
        const latitude = parseFloat(placeData.location.lat);
        const longitude = parseFloat(placeData.location.lng);
        
        if (isNaN(latitude) || isNaN(longitude)) {
            throw new Error(`Coordenadas inválidas: lat=${placeData.location.lat}, lng=${placeData.location.lng}`);
        }
        
        console.log('- Latitud convertida:', latitude);
        console.log('- Longitud convertida:', longitude);
        
        // Preparar datos optimizados para PocketBase
        const optimizedData = {
            title: placeData.title,
            description: placeData.description,
            owner: placeData.owner,
            // IMPORTANTE: PocketBase usa "lon" en lugar de "lng"
            location: {
                lat: latitude,
                lon: longitude  // ← Cambio aquí: usar "lon" en lugar de "lng"
            },
            size: placeData.size || 0,
            price: placeData.price || placeData.monthlyPrice || 0, // Usar price como campo principal
            monthlyPrice: placeData.monthlyPrice || placeData.price || 0, // Mantener compatibilidad
            deposit: placeData.deposit || 0,
            address: placeData.address || '',
            city: placeData.city || '',
            neighborhood: placeData.neighborhood || '',
            property_type: placeData.property_type || 'departamento',
            property_status: placeData.property_status || 'disponible',
            photos: placeData.photos || [],
            amenities: placeData.amenities || {},
            contract: placeData.contract || {},
            rules: placeData.rules || {},
            created_by: placeData.created_by || placeData.owner
        };
        
        console.log('📤 Datos optimizados para enviar a PocketBase:');
        console.log(JSON.stringify(optimizedData, null, 2));
        console.log('🌍 Objeto location específico:', JSON.stringify(optimizedData.location, null, 2));
        
        // Crear la propiedad
        const place = await pb.collection("places").create(optimizedData);
        
        console.log('✅ Propiedad creada exitosamente en PocketBase!');
        console.log('📍 Coordenadas guardadas:', {
            saved_lat: place.location?.lat,
            saved_lon: place.location?.lon,  // ← Cambio aquí también
            saved_lng: place.location?.lng,  // ← Ver si existe lng también
            location_object: place.location
        });
        
        return place;
        
    } catch (error: any) {
        console.error('❌ Error al crear propiedad:', error);
        
        // Mejorar el mensaje de error basado en el tipo de error
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            console.error('Detalles del error de PocketBase:', errorData);
            
            // Extraer mensajes de error específicos
            if (errorData.message) {
                throw new Error(`Error del servidor: ${errorData.message}`);
            } else if (errorData.data) {
                const fieldErrors = Object.entries(errorData.data)
                    .map(([field, error]: [string, any]) => `${field}: ${error.message}`)
                    .join(', ');
                throw new Error(`Errores de validación: ${fieldErrors}`);
            }
        }
        
        // Error genérico
        throw new Error(error.message || 'Error desconocido al crear la propiedad');
    }
}

const updatePlace = async (id: string, placeData: Partial<Places>) => {
    const place = await pb.collection("places").update(id, placeData)
    return place
}

const deletePlace = async (id: string) => {
    const place = await pb.collection("places").delete(id)
    return place
}

// Buscar lugares cercanos geográficamente
const getPlacesNearby = async (
    centerPoint: Geopoint, 
    radiusKm: number = 5, 
    page: number = 1, 
    perPage: number = 50
) => {
    try {
        const radiusInMeters = radiusKm * 1000;
        const filter = `location @nearby(${centerPoint.lat}, ${centerPoint.lng}, ${radiusInMeters})`;
        
        const places = await pb.collection("places").getList(
            page,
            perPage,
            {
                filter: filter,
                expand: "type,status,owner", 
                sort: "+created" 
            }
        );
        
        return places;
    } catch (error) {
        console.error("Error al buscar lugares cercanos:", error);
        throw error;
    }
}

// Buscar lugares cercanos con filtros adicionales
const getPlacesNearbyWithFilters = async (
    centerPoint: Geopoint,
    radiusKm: number = 5,
    filters?: {
        type?: string;
        status?: string;
        minSize?: number;
        maxSize?: number;
    },
    page: number = 1,
    perPage: number = 50
) => {
    try {
        const radiusInMeters = radiusKm * 1000;
        let filterConditions = [`location @nearby(${centerPoint.lat}, ${centerPoint.lng}, ${radiusInMeters})`];
        
        // Agregar filtros adicionales
        if (filters?.type) {
            filterConditions.push(`type.type = "${filters.type}"`);
        }
        
        if (filters?.status) {
            filterConditions.push(`status.status = "${filters.status}"`);
        }
        
        if (filters?.minSize) {
            filterConditions.push(`size >= ${filters.minSize}`);
        }
        
        if (filters?.maxSize) {
            filterConditions.push(`size <= ${filters.maxSize}`);
        }
        
        const filter = filterConditions.join(" && ");
        
        const places = await pb.collection("places").getList(
            page,
            perPage,
            {
                filter: filter,
                expand: "type,status,owner",
                sort: "+created"
            }
        );
        
        return places;
    } catch (error) {
        console.error("Error al buscar lugares cercanos con filtros:", error);
        throw error;
    }
}

// Calcular distancia entre dos puntos geográficos (usando fórmula Haversine)
const calculateDistance = (point1: Geopoint, point2: Geopoint): number => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

// Búsqueda por texto libre
const searchPlaces = async (searchText: string) => {
    try {
        console.log('🔍 Buscando propiedades en PocketBase con texto:', searchText);
        
        if (!searchText || searchText.trim() === '') {
            // Si no hay texto de búsqueda, devolver todas las propiedades reales
            return await getPlaces();
        }
        
        const searchTerm = searchText.toLowerCase().trim();
        
        // Buscar en PocketBase usando filtros
        const filterConditions = [
            `title ~ "${searchTerm}"`,
            `description ~ "${searchTerm}"`,
            `address ~ "${searchTerm}"`,
            `city ~ "${searchTerm}"`,
            `neighborhood ~ "${searchTerm}"`,
            `property_type ~ "${searchTerm}"`
        ];
        
        const filter = filterConditions.join(' || ');
        
        const places = await pb.collection("places").getList(1, 50, {
            filter: filter,
            sort: '-created',
            expand: 'owner'
        });
        
        console.log(`✅ Búsqueda completada: ${places.totalItems} propiedades encontradas`);
        return places;
        
    } catch (error) {
        console.error('❌ Error al buscar lugares en PocketBase:', error);
        
        // En caso de error, devolver estructura vacía
        return {
            page: 1,
            perPage: 50,
            totalItems: 0,
            totalPages: 0,
            items: []
        };
    }
};

// Filtros rápidos
const filterPlaces = async (filterId: string | null, searchText: string = '') => {
    try {
        console.log('🔧 Aplicando filtros:', { filterId, searchText });
        
        // Verificar conexión primero
        try {
            await pb.health.check();
        } catch (healthError) {
            console.error('❌ Error de conexión en filterPlaces:', healthError);
            throw new Error('No se pudo conectar a PocketBase');
        }
        
        let filterConditions: string[] = [];
        
        // Primero aplicar búsqueda por texto si existe
        if (searchText && searchText.trim() !== '') {
            const searchTerm = searchText.toLowerCase().trim();
            const textFilters = [
                `title ~ "${searchTerm}"`,
                `description ~ "${searchTerm}"`,
                `address ~ "${searchTerm}"`,
                `city ~ "${searchTerm}"`,
                `neighborhood ~ "${searchTerm}"`,
                `property_type ~ "${searchTerm}"`
            ];
            filterConditions.push(`(${textFilters.join(' || ')})`);
        }
        
        // Luego aplicar filtro rápido si existe
        if (filterId) {
            switch (filterId) {
                case 'near-unah':
                    // Propiedades cerca de UNAH (por título, descripción o dirección)
                    filterConditions.push(`(title ~ "unah" || title ~ "universidad" || description ~ "unah" || description ~ "universidad" || address ~ "unah" || address ~ "universidad")`);
                    break;
                
                case 'economic':
                    // Propiedades económicas (menos de L. 10,000) - usar el campo price
                    filterConditions.push(`(price < 10000 || monthlyPrice < 10000)`);
                    break;
                
                case 'furnished':
                    // Propiedades amuebladas (buscar en descripción o título)
                    filterConditions.push(`(title ~ "amueblado" || description ~ "amueblado" || title ~ "furnished" || description ~ "furnished")`);
                    break;
                
                case 'wifi':
                    // Propiedades con WiFi (buscar en descripción o título)
                    filterConditions.push(`(title ~ "wifi" || description ~ "wifi" || title ~ "internet" || description ~ "internet")`);
                    break;
                
                case 'studio':
                    // Estudios o propiedades pequeñas
                    filterConditions.push(`(size <= 40 || title ~ "estudio" || property_type = "estudio")`);
                    break;
                
                default:
                    break;
            }
        }
        
        // Construir filtro final
        const finalFilter = filterConditions.length > 0 ? filterConditions.join(' && ') : '';
        
        console.log('🔍 Filtro final aplicado:', finalFilter);
        
        const places = await pb.collection("places").getList(1, 50, {
            filter: finalFilter || undefined,
            sort: '-created',
            expand: 'owner'
        });
        
        console.log(`✅ Filtros aplicados: ${places.totalItems} propiedades encontradas`);
        return places;
        
    } catch (error) {
        console.error('❌ Error al filtrar lugares en PocketBase:', error);
        
        // En caso de error, devolver estructura vacía
        return {
            page: 1,
            perPage: 50,
            totalItems: 0,
            totalPages: 0,
            items: []
        };
    }
};

// Función para corregir coordenadas existentes
const fixCoordinates = async () => {
    try {
        console.log('🔧 === CORRIGIENDO COORDENADAS ===');
        
        const places = await pb.collection("places").getList(1, 50, {
            sort: '-created'
        });
        
        console.log(`📊 Revisando ${places.items.length} propiedades para corrección:`);
        
        let correctedCount = 0;
        
        for (let i = 0; i < places.items.length; i++) {
            const place = places.items[i];
            console.log(`\n🔍 Analizando propiedad: ${place.title}`);
            
            let needsUpdate = false;
            let newLocation = place.location;
            
            // Verificar si location existe pero está malformado
            if (!place.location) {
                console.log('  ❌ Sin coordenadas - asignando coordenadas de Comayagua por defecto');
                newLocation = {
                    lat: 14.0723 + (Math.random() - 0.5) * 0.02,
                    lon: -87.6431 + (Math.random() - 0.5) * 0.02  // ← Usar "lon"
                };
                needsUpdate = true;
            } else if (typeof place.location === 'string') {
                console.log('  ⚠️ Coordenadas como string - convirtiendo a objeto');
                try {
                    const parsed = JSON.parse(place.location);
                    // Convertir lng a lon si es necesario
                    newLocation = {
                        lat: parsed.lat,
                        lon: parsed.lon || parsed.lng  // ← Priorizar "lon" pero aceptar "lng"
                    };
                    needsUpdate = true;
                } catch (e) {
                    console.log('  ❌ No se pudo parsear location string - usando coordenadas por defecto');
                    newLocation = {
                        lat: 14.0723 + (Math.random() - 0.5) * 0.02,
                        lon: -87.6431 + (Math.random() - 0.5) * 0.02  // ← Usar "lon"
                    };
                    needsUpdate = true;
                }
            } else if (typeof place.location === 'object') {
                // Verificar que tenga lat y lon/lng válidos
                const hasValidLat = place.location.lat && !isNaN(place.location.lat);
                const hasValidLon = (place.location.lon && !isNaN(place.location.lon)) || 
                                   (place.location.lng && !isNaN(place.location.lng));
                
                if (!hasValidLat || !hasValidLon) {
                    console.log('  ⚠️ Coordenadas inválidas - corrigiendo');
                    newLocation = {
                        lat: hasValidLat ? place.location.lat : 14.0723 + (Math.random() - 0.5) * 0.02,
                        lon: hasValidLon ? (place.location.lon || place.location.lng) : -87.6431 + (Math.random() - 0.5) * 0.02  // ← Usar "lon"
                    };
                    needsUpdate = true;
                } else {
                    // Si tiene lng pero no lon, convertir
                    if (place.location.lng && !place.location.lon) {
                        console.log('  🔄 Convirtiendo lng a lon');
                        newLocation = {
                            lat: place.location.lat,
                            lon: place.location.lng  // ← Convertir lng a lon
                        };
                        needsUpdate = true;
                    } else {
                        console.log('  ✅ Coordenadas válidas');
                    }
                }
            }
            
            if (needsUpdate) {
                console.log(`  🔧 Actualizando coordenadas:`, newLocation);
                
                try {
                    await pb.collection("places").update(place.id, {
                        location: newLocation
                    });
                    correctedCount++;
                    console.log('  ✅ Coordenadas corregidas exitosamente');
                } catch (updateError) {
                    console.error('  ❌ Error al actualizar coordenadas:', updateError);
                }
            }
        }
        
        console.log(`\n🎉 Corrección completada: ${correctedCount} propiedades actualizadas`);
        return { totalChecked: places.items.length, corrected: correctedCount };
        
    } catch (error) {
        console.error('❌ Error en corrección de coordenadas:', error);
        throw error;
    }
};

// Función para debuggear coordenadas en propiedades existentes
const debugCoordinates = async () => {
    try {
        console.log('🔍 === DEBUGGING COORDENADAS ===');
        
        const places = await pb.collection("places").getList(1, 10, {
            sort: '-created'
        });
        
        console.log(`📊 Analizando ${places.items.length} propiedades:`);
        
        places.items.forEach((place, index) => {
            console.log(`\n🏠 Propiedad ${index + 1}: ${place.title}`);
            console.log('📍 Campo location completo:', place.location);
            console.log('📍 Tipo de location:', typeof place.location);
            
            if (place.location) {
                if (typeof place.location === 'object') {
                    console.log('  - lat:', place.location.lat, typeof place.location.lat);
                    console.log('  - lon:', place.location.lon, typeof place.location.lon);
                    console.log('  - lng:', place.location.lng, typeof place.location.lng);
                    
                    // Identificar problemas
                    if (place.location.lng && !place.location.lon) {
                        console.log('  ⚠️ PROBLEMA: Tiene lng pero no lon');
                    } else if (place.location.lon && !place.location.lng) {
                        console.log('  ✅ CORRECTO: Usa lon (formato PocketBase)');
                    } else if (place.location.lng && place.location.lon) {
                        console.log('  🔄 DUPLICADO: Tiene ambos lng y lon');
                    }
                } else {
                    console.log('  - location como string:', place.location);
                }
            } else {
                console.log('  - ❌ Sin coordenadas');
            }
        });
        
        return places;
        
    } catch (error) {
        console.error('❌ Error en debug de coordenadas:', error);
        throw error;
    }
};

// Función para verificar que las coordenadas se están enviando correctamente antes de guardar
export const testCoordinateSaving = async (coords: { latitude: number, longitude: number }) => {
    console.log('🧪 TESTING COORDINATE SAVING:');
    console.log('📍 Input coordinates:', coords);
    
    const locationObject = {
        lat: coords.latitude,
        lon: coords.longitude  // Aseguramos que usa "lon" no "lng"
    };
    
    console.log('📦 Location object to save:', locationObject);
    console.log('✅ Ready for PocketBase (uses "lon" field)');
    
    return locationObject;
};

export default {
    getPlaces,
    getPlaceById,
    getPlacebyOwner,
    getPlacebyName,
    getPlacesbyLocation,
    getPlacesNearby,
    getPlacesNearbyWithFilters,
    calculateDistance,
    searchPlaces,
    filterPlaces,
    createPlace,
    updatePlace,
    deletePlace,
    testConnection,
    debugCoordinates,
    fixCoordinates,
    testCoordinateSaving
}