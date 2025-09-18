type Geopoint = {
    lat: number
    lng: number
}

interface UserRoles {
    id: string
    role: "Inquilino"| "Propietario" | "Administrador"
    created: Date
    updated: Date
}

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  type?: string // Campo simplificado para el rol del usuario
  genre?: "masculino" | "femenino" // Campo para género del usuario
  isActive: boolean
  phone?: string // Campo adicional para teléfono
  bio?: string // Campo adicional para descripción personal (máximo 40 caracteres)
  created: Date
  updated: Date
}

interface PlaceTypes {
    id: string
    type: "casa" | "departamento" | "local comercial" | "oficina"
    created: Date
    updated: Date
}

interface PlaceStatus{
    id: string
    status: "disponible" | "no disponible" | "reservado"
    created: Date
    updated: Date
}

interface Places{
    id: string
    title: string
    description: string
    type: PlaceTypes
    status: PlaceStatus
    owner: User
    location: Geopoint
    size: number
    price: number // Campo de precio agregado
    photos: string[]
    created: Date
    updated: Date
}

interface ContractStatus{
    id: string
    status: "activo" | "inactivo" | "finalizado"
    created: Date
    updated: Date
}

interface Contract{
    id: string
    tenant: User
    property: Places
    startDate: Date
    endDate: Date
    status: ContractStatus
    pdf: string
    created: Date
    updated: Date
}

interface Favorites{
    id: string
    user: User
    places: Places // Cambiar de 'property' a 'places' para coincidir con PocketBase
    created: Date
    updated: Date
}

interface Meets{
    id: string
    owner: User
    client: User
    property: Places
    date: Date
}

export type{
    User,
    Places,
    Places as Property, // Agregar alias para compatibilidad
    Contract,
    Geopoint,
    UserRoles,
    ContractStatus,
    PlaceStatus,
    PlaceTypes,
    Meets,
    Favorites
}