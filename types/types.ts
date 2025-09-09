type Geopoint = {
    lat: number
    lng: number
}

interface UserTypes {
    id: string
    typeName: "dueño"| "inquilino" | "administrador"
    created: Date
    updated: Date
}

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  type: UserTypes
  isActive: boolean
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

export {
    User,
    Places,
    Contract,
    Geopoint,
    UserTypes,
    ContractStatus,
    PlaceStatus,
    PlaceTypes
}