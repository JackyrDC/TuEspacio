import pb from "../config/pocketbase"
import { Places, Geopoint } from "../types/types"
import { mockProperties, getPropertiesWithPricing } from "../data/mockData"

const getPlaces = async () => {
    try {
        // Usar datos mock para demostración
        const mockPropertiesWithPricing = getPropertiesWithPricing();
        
        // Simular la estructura de respuesta de PocketBase
        return {
            page: 1,
            perPage: 50,
            totalItems: mockPropertiesWithPricing.length,
            totalPages: 1,
            items: mockPropertiesWithPricing
        };
    } catch (error) {
        console.error('Error al cargar lugares:', error);
        // Fallback a PocketBase si es necesario
        const places = await pb.collection("places").getList()
        return places
    }
}

const getPlaceById = async (id: string) => {
    try {
        // Buscar en datos mock primero
        const mockPropertiesWithPricing = getPropertiesWithPricing();
        const mockProperty = mockPropertiesWithPricing.find(p => p.id === id);
        
        if (mockProperty) {
            return mockProperty;
        }
        
        // Fallback a PocketBase si no se encuentra en mock
        const place = await pb.collection("places").getOne(id)
        return place
    } catch (error) {
        console.error('Error al cargar lugar por ID:', error);
        throw error;
    }
}

const getPlacebyOwner = async (id:string)=>{
    const places = await pb.collection("places").getFullList({ filter: `owner.id = "${id}"` })
    return places
}

const getPlacebyName = async (name: string) => {
    const places = await pb.collection("places").getList(1, 50, { filter: `name = "${name}"` })
    return places
}

const getPlacesbyLocation = async (location: string) => {
    const places = await pb.collection("places").getList(1, 50, { filter: `location = "${location}"` })
    return places
}

const createPlace = async (placeData: Places) => {
    const place = await pb.collection("places").create(placeData)
    return place
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
        const mockPropertiesWithPricing = getPropertiesWithPricing();
        
        if (!searchText || searchText.trim() === '') {
            // Si no hay texto de búsqueda, devolver todas las propiedades
            return {
                page: 1,
                perPage: 50,
                totalItems: mockPropertiesWithPricing.length,
                totalPages: 1,
                items: mockPropertiesWithPricing
            };
        }
        
        const searchTerm = searchText.toLowerCase().trim();
        
        // Filtrar propiedades que coincidan con el texto de búsqueda
        const filteredProperties = mockPropertiesWithPricing.filter(property => {
            // Buscar en título
            const titleMatch = property.title.toLowerCase().includes(searchTerm);
            
            // Buscar en descripción
            const descriptionMatch = property.description.toLowerCase().includes(searchTerm);
            
            // Buscar en tipo de propiedad
            const typeMatch = property.type.type.toLowerCase().includes(searchTerm);
            
            // Buscar en nombre del propietario
            const ownerMatch = property.owner.name.toLowerCase().includes(searchTerm);
            
            // Buscar términos relacionados con ubicación (simplificado)
            const locationKeywords = ['unah', 'universidad', 'centro', 'zona rosa', 'palmira', 'loma linda', 'granja', 'comayagüela', 'morazán'];
            const locationMatch = locationKeywords.some(keyword => 
                keyword.includes(searchTerm) || searchTerm.includes(keyword)
            );
            
            return titleMatch || descriptionMatch || typeMatch || ownerMatch || locationMatch;
        });
        
        return {
            page: 1,
            perPage: 50,
            totalItems: filteredProperties.length,
            totalPages: 1,
            items: filteredProperties
        };
    } catch (error) {
        console.error('Error al buscar lugares:', error);
        throw error;
    }
};

// Filtros rápidos
const filterPlaces = async (filterId: string | null, searchText: string = '') => {
    try {
        const mockPropertiesWithPricing = getPropertiesWithPricing();
        let filteredProperties = mockPropertiesWithPricing;
        
        // Primero aplicar búsqueda por texto si existe
        if (searchText && searchText.trim() !== '') {
            const searchTerm = searchText.toLowerCase().trim();
            filteredProperties = filteredProperties.filter(property => {
                const titleMatch = property.title.toLowerCase().includes(searchTerm);
                const descriptionMatch = property.description.toLowerCase().includes(searchTerm);
                const typeMatch = property.type.type.toLowerCase().includes(searchTerm);
                const ownerMatch = property.owner.name.toLowerCase().includes(searchTerm);
                
                const locationKeywords = ['unah', 'universidad', 'centro', 'zona rosa', 'palmira', 'loma linda', 'granja', 'comayagüela', 'morazán'];
                const locationMatch = locationKeywords.some(keyword => 
                    keyword.includes(searchTerm) || searchTerm.includes(keyword)
                );
                
                return titleMatch || descriptionMatch || typeMatch || ownerMatch || locationMatch;
            });
        }
        
        // Luego aplicar filtro rápido si existe
        if (filterId) {
            filteredProperties = filteredProperties.filter(property => {
                switch (filterId) {
                    case 'near-unah':
                        // Propiedades cerca de UNAH (por título o amenidades)
                        return property.title.toLowerCase().includes('unah') || 
                               property.title.toLowerCase().includes('universidad') ||
                               property.amenities?.nearUniversity === true;
                    
                    case 'economic':
                        // Propiedades económicas (menos de L. 10,000)
                        return property.monthlyPrice < 10000;
                    
                    case 'furnished':
                        // Propiedades amuebladas
                        return property.amenities?.furnished === true;
                    
                    case 'wifi':
                        // Propiedades con WiFi
                        return property.amenities?.wifi === true;
                    
                    case 'studio':
                        // Estudios o propiedades pequeñas (menos de 40 m²)
                        return property.size <= 40 || 
                               property.title.toLowerCase().includes('estudio');
                    
                    default:
                        return true;
                }
            });
        }
        
        return {
            page: 1,
            perPage: 50,
            totalItems: filteredProperties.length,
            totalPages: 1,
            items: filteredProperties
        };
    } catch (error) {
        console.error('Error al filtrar lugares:', error);
        throw error;
    }
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
    deletePlace
}