import pb from "../config/pocketbase.js"
import { Places, Geopoint } from "../types/types"

const getPlaces = async () => {
    const places = await pb.collection("places").getList<Places>()
    return places
}

const getPlaceById = async (id: string) => {
    const place = await pb.collection("places").getOne<Places>(id)
    return place
}

const getPlacebyOwner = async (id:string)=>{
    const places = await pb.collection("places").getFullList<Places>({ filter: `owner.id = "${id}"` })
    return places
}

const getPlacebyName = async (name: string) => {
    const places = await pb.collection("places").getList<Places>(1, 50, { filter: `name = "${name}"` })
    return places
}

const getPlacesbyLocation = async (location: string) => {
    const places = await pb.collection("places").getList<Places>(1, 50, { filter: `location = "${location}"` })
    return places
}

const createPlace = async (placeData: Places) => {
    const place = await pb.collection("places").create<Places>(placeData)
    return place
}

const updatePlace = async (id: string, placeData: Partial<Places>) => {
    const place = await pb.collection("places").update<Places>(id, placeData)
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
        
        const places = await pb.collection("places").getList<Places>(
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
        
        const places = await pb.collection("places").getList<Places>(
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

export default {
    getPlaces,
    getPlaceById,
    getPlacebyOwner,
    getPlacebyName,
    getPlacesbyLocation,
    getPlacesNearby,
    getPlacesNearbyWithFilters,
    calculateDistance,
    createPlace,
    updatePlace,
    deletePlace
}