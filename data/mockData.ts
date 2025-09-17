import { Places, User, PlaceTypes, PlaceStatus, UserRoles } from '../types/types';

// Mock de roles de usuario
const ownerRole: UserRoles = {
  id: 'role_owner_1',
  role: 'Propietario',
  created: new Date('2024-01-15'),
  updated: new Date('2024-01-15')
};

const tenantRole: UserRoles = {
  id: 'role_tenant_1',
  role: 'Inquilino',
  created: new Date('2024-01-15'),
  updated: new Date('2024-01-15')
};

// Mock de tipos de propiedades
const apartmentType: PlaceTypes = {
  id: 'type_apartment',
  type: 'departamento',
  created: new Date('2024-01-15'),
  updated: new Date('2024-01-15')
};

const houseType: PlaceTypes = {
  id: 'type_house',
  type: 'casa',
  created: new Date('2024-01-15'),
  updated: new Date('2024-01-15')
};

// Mock de estados de propiedades
const availableStatus: PlaceStatus = {
  id: 'status_available',
  status: 'disponible',
  created: new Date('2024-01-15'),
  updated: new Date('2024-01-15')
};

const reservedStatus: PlaceStatus = {
  id: 'status_reserved',
  status: 'reservado',
  created: new Date('2024-01-15'),
  updated: new Date('2024-01-15')
};

// Mock de propietarios
export const mockOwners: User[] = [
  {
    id: 'owner_1',
    email: 'maria.rodriguez@gmail.com',
    name: 'María Rodríguez',
    avatar: '',
    type: 'Propietario',
    genre: 'femenino',
    isActive: true,
    created: new Date('2024-01-10'),
    updated: new Date('2024-09-10')
  },
  {
    id: 'owner_2',
    email: 'carlos.martinez@outlook.com',
    name: 'Carlos Martínez',
    avatar: '',
    type: 'Propietario',
    genre: 'masculino',
    isActive: true,
    created: new Date('2024-02-05'),
    updated: new Date('2024-08-20')
  },
  {
    id: 'owner_3',
    email: 'ana.lopez@yahoo.com',
    name: 'Ana López',
    avatar: '',
    type: 'Propietario',
    genre: 'femenino',
    isActive: true,
    created: new Date('2024-01-20'),
    updated: new Date('2024-09-01')
  },
  {
    id: 'owner_4',
    email: 'jorge.hernandez@gmail.com',
    name: 'Jorge Hernández',
    avatar: '',
    type: 'Propietario',
    genre: 'masculino',
    isActive: true,
    created: new Date('2024-03-12'),
    updated: new Date('2024-08-15')
  },
  {
    id: 'owner_5',
    email: 'lucia.garcia@hotmail.com',
    name: 'Lucía García',
    avatar: '',
    type: 'Propietario',
    genre: 'femenino',
    isActive: true,
    created: new Date('2024-02-28'),
    updated: new Date('2024-09-05')
  },
  {
    id: 'owner_6',
    email: 'roberto.perez@gmail.com',
    name: 'Roberto Pérez',
    avatar: '',
    type: 'Propietario',
    genre: 'masculino',
    isActive: true,
    created: new Date('2024-04-01'),
    updated: new Date('2024-08-30')
  }
];

// Mock de propiedades ampliado
export const mockProperties: Places[] = [
  {
    id: 'place_1',
    title: 'Apartamento Moderno cerca de UNAH',
    description: 'Hermoso apartamento de 2 habitaciones completamente amueblado, ubicado a solo 10 minutos caminando de la Universidad Nacional Autónoma de Honduras. Cuenta con WiFi de alta velocidad, aire acondicionado, cocina equipada y área de estudio. Ideal para estudiantes que buscan comodidad y cercanía a la universidad.',
    type: apartmentType,
    status: availableStatus,
    owner: mockOwners[0],
    location: { lat: 14.0723, lng: -87.1921 },
    size: 65,
    photos: [],
    created: new Date('2024-08-15'),
    updated: new Date('2024-09-10')
  },
  {
    id: 'place_2',
    title: 'Estudio Económico en Comayagüela',
    description: 'Estudio funcional y económico perfecto para estudiantes con presupuesto ajustado. Incluye cama, escritorio, mini-refrigerador y acceso a WiFi compartido. Ubicado en zona segura con transporte público cercano. Servicios básicos incluidos en el precio mensual.',
    type: apartmentType,
    status: availableStatus,
    owner: mockOwners[1],
    location: { lat: 14.0899, lng: -87.2072 },
    size: 25,
    photos: [],
    created: new Date('2024-08-20'),
    updated: new Date('2024-09-12')
  },
  {
    id: 'place_3',
    title: 'Casa Compartida en Colonia Palmira',
    description: 'Habitación privada en casa compartida con otros estudiantes. La casa cuenta con sala común, cocina completamente equipada, 2 baños completos, patio con área de lavandería y WiFi en toda la casa. Ambiente estudiantil amigable y seguro. Perfecto para quienes buscan compañía y economizar gastos.',
    type: houseType,
    status: availableStatus,
    owner: mockOwners[2],
    location: { lat: 14.0812, lng: -87.1734 },
    size: 30,
    photos: [],
    created: new Date('2024-07-30'),
    updated: new Date('2024-09-08')
  },
  {
    id: 'place_4',
    title: 'Apartamento Completo en Boulevard Morazán',
    description: 'Apartamento de lujo con 2 habitaciones, 2 baños, sala, comedor y cocina integral. Ubicado en una de las zonas más exclusivas de Tegucigalpa. Incluye aire acondicionado, WiFi de fibra óptica, electrodomésticos y acceso a área de piscina del edificio. Seguridad 24/7.',
    type: apartmentType,
    status: reservedStatus,
    owner: mockOwners[3],
    location: { lat: 14.0739, lng: -87.1872 },
    size: 85,
    photos: [],
    created: new Date('2024-08-05'),
    updated: new Date('2024-09-14')
  },
  {
    id: 'place_5',
    title: 'Habitación Individual en Residencia Estudiantil',
    description: 'Habitación individual en residencia especializada para estudiantes universitarios. Incluye cama individual, escritorio, armario, baño privado y aire acondicionado. La residencia cuenta con áreas comunes, biblioteca, gimnasio y servicio de limpieza semanal. Internet de alta velocidad incluido.',
    type: apartmentType,
    status: availableStatus,
    owner: mockOwners[4],
    location: { lat: 14.0945, lng: -87.1823 },
    size: 20,
    photos: [],
    created: new Date('2024-08-25'),
    updated: new Date('2024-09-11')
  },
  {
    id: 'place_6',
    title: 'Apartamento Familiar en Col. Loma Linda',
    description: 'Espacioso apartamento de 3 habitaciones ideal para estudiantes que prefieren vivir en familia o compartir con varios compañeros. Cuenta con sala amplia, comedor, cocina equipada, 2 baños completos y área de lavandería. Ubicado en zona residencial tranquila con fácil acceso a transporte público.',
    type: apartmentType,
    status: availableStatus,
    owner: mockOwners[5],
    location: { lat: 14.1045, lng: -87.1956 },
    size: 95,
    photos: [],
    created: new Date('2024-07-18'),
    updated: new Date('2024-09-13')
  },
  {
    id: 'place_7',
    title: 'Estudio Minimalista en Centro Histórico',
    description: 'Estudio moderno y minimalista ubicado en el corazón del centro histórico de Tegucigalpa. Perfecto para estudiantes de arte, historia o arquitectura que aprecian la cultura y la historia. Totalmente amueblado con diseño contemporáneo, WiFi, y a pocos metros de museos, bibliotecas y cafeterías.',
    type: apartmentType,
    status: availableStatus,
    owner: mockOwners[0],
    location: { lat: 14.0722, lng: -87.2067 },
    size: 35,
    photos: [],
    created: new Date('2024-09-01'),
    updated: new Date('2024-09-15')
  },
  {
    id: 'place_8',
    title: 'Casa Estudiantil en Barrio La Granja',
    description: 'Casa tradicional adaptada especialmente para estudiantes. Cuenta con 4 habitaciones individuales, cada una con su propio baño. Áreas comunes incluyen sala de estar, comedor, cocina industrial, área de estudio grupal y patio con parrilla. Ambiente familiar y seguro con portón eléctrico.',
    type: houseType,
    status: availableStatus,
    owner: mockOwners[1],
    location: { lat: 14.0634, lng: -87.1789 },
    size: 40,
    photos: [],
    created: new Date('2024-08-10'),
    updated: new Date('2024-09-09')
  },
  {
    id: 'place_9',
    title: 'Loft Moderno en Zona Rosa',
    description: 'Exclusivo loft de concepto abierto en la vibrante Zona Rosa. Perfecto para estudiantes de últimos años o posgrado que buscan un ambiente sofisticado. Incluye área de dormir en mezanine, oficina, cocina gourmet y sala de estar. Ubicado cerca de restaurantes, bares y centros culturales.',
    type: apartmentType,
    status: availableStatus,
    owner: mockOwners[2],
    location: { lat: 14.0889, lng: -87.1734 },
    size: 55,
    photos: [],
    created: new Date('2024-08-28'),
    updated: new Date('2024-09-14')
  },
  {
    id: 'place_10',
    title: 'Habitación Compartida Económica',
    description: 'Habitación compartida ideal para estudiantes con presupuesto muy ajustado. Cuenta con 2 camas individuales, escritorios para cada inquilino, armarios separados y baño compartido. La casa incluye cocina, sala común y WiFi. Ambiente estudiantil amigable y colaborativo.',
    type: apartmentType,
    status: availableStatus,
    owner: mockOwners[3],
    location: { lat: 14.0756, lng: -87.1845 },
    size: 18,
    photos: [],
    created: new Date('2024-09-05'),
    updated: new Date('2024-09-12')
  },
  {
    id: 'place_11',
    title: 'Apartamento con Vista Panorámica',
    description: 'Impresionante apartamento en piso alto con vista panorámica de la ciudad. Cuenta con 2 habitaciones, 1 baño, sala con ventanal de piso a techo, comedor y cocina moderna. Ideal para estudiantes que aprecian las vistas espectaculares y un ambiente inspirador para estudiar.',
    type: apartmentType,
    status: availableStatus,
    owner: mockOwners[4],
    location: { lat: 14.0823, lng: -87.1923 },
    size: 72,
    photos: [],
    created: new Date('2024-08-12'),
    updated: new Date('2024-09-10')
  },
  {
    id: 'place_12',
    title: 'Casa Colonial Restaurada',
    description: 'Hermosa casa colonial completamente restaurada que mantiene su encanto histórico con comodidades modernas. Ofrece habitaciones individuales para estudiantes con baños compartidos, sala común con biblioteca, comedor tradicional y patio central. Ambiente único lleno de historia y cultura.',
    type: houseType,
    status: availableStatus,
    owner: mockOwners[5],
    location: { lat: 14.0695, lng: -87.2034 },
    size: 45,
    photos: [],
    created: new Date('2024-07-25'),
    updated: new Date('2024-09-07')
  }
];

// Función para obtener propiedades con precios dinámicos
export const getPropertiesWithPricing = (): (Places & { 
  monthlyPrice: number; 
  dailyPrice: number; 
  deposit: number;
  amenities: {
    wifi: boolean;
    airConditioning: boolean;
    furnished: boolean;
    parking: boolean;
    laundry: boolean;
    kitchen: boolean;
    nearUniversity: boolean;
    security: boolean;
  };
  contact: {
    phone: string;
    whatsapp: string;
    preferredContact: 'phone' | 'whatsapp' | 'email';
  };
})[] => {
  return mockProperties.map((property, index) => {
    // Calcular precios basados en el tamaño y ubicación
    const basePrice = property.size * (15 + Math.random() * 10); // Entre L. 15-25 por m²
    const monthlyPrice = Math.round(basePrice / 50) * 50; // Redondear a múltiplos de 50
    const dailyPrice = Math.round(monthlyPrice / 30);
    const deposit = monthlyPrice;

    // Asignar amenidades basadas en el tipo y precio
    const amenities = {
      wifi: monthlyPrice > 8000 || Math.random() > 0.3,
      airConditioning: monthlyPrice > 12000 || Math.random() > 0.5,
      furnished: monthlyPrice > 10000 || Math.random() > 0.4,
      parking: property.type.type === 'casa' || Math.random() > 0.6,
      laundry: monthlyPrice > 9000 || Math.random() > 0.4,
      kitchen: property.type.type === 'casa' || property.size > 40,
      nearUniversity: property.title.toLowerCase().includes('unah') || property.title.toLowerCase().includes('universidad'),
      security: monthlyPrice > 15000 || Math.random() > 0.7
    };

    // Generar información de contacto
    const phoneNumbers = [
      '9876-5432', '8765-4321', '7654-3210', '9123-4567', 
      '8234-5678', '7345-6789', '9456-7890', '8567-8901'
    ];
    
    const contact = {
      phone: `+504 ${phoneNumbers[index % phoneNumbers.length]}`,
      whatsapp: `+504 ${phoneNumbers[index % phoneNumbers.length]}`,
      preferredContact: (['phone', 'whatsapp', 'email'] as const)[index % 3]
    };

    return {
      ...property,
      monthlyPrice,
      dailyPrice,
      deposit,
      amenities,
      contact
    };
  });
};

export default {
  mockOwners,
  mockProperties,
  getPropertiesWithPricing
};