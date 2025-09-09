import pb from "../config/pocketbase.js"
import { Contract, ContractStatus } from "../types/types"

export const createContract = async (contractData: Omit<Contract, "id">) => {
  const { data } = await pb.collection("contracts").create(contractData)
  return data as Contract
}

export const getContract = async (id: string) => {
  const { data } = await pb.collection("contracts").getOne(id)
  return data as Contract
}

export const updateContract = async (id: string, contractData: Partial<Contract>) => {
  const { data } = await pb.collection("contracts").update(id, contractData)
  return data as Contract
}

export const deleteContract = async (id: string) => {
  const result = await pb.collection("contracts").delete(id)
  return result
}

export const getContractsByStatus = async (status: ContractStatus) => {
  const result = await pb.collection("contracts").getList(1, 50, { filter: `status = "${status}"` })
  const contracts: Contract[] = result.items.map(item => ({
    id: item.id,
    tenant: item.tenant,
    property: item.property,
    startDate: item.startDate,
    endDate: item.endDate,
    status: item.status,
    pdf: item.pdf,
    created: item.created,
    updated: item.updated
  }))
  return contracts as Contract[]
}


const getContractsByOwner = async (ownerId: string) => {
  const result = await pb.collection("contracts").getList(1, 50, { filter: `property.owner = "${ownerId}"` })
  const contracts: Contract[] = result.items.map(item => ({
    id: item.id,
    tenant: item.tenant,
    property: item.property,
    startDate: item.startDate,
    endDate: item.endDate,
    status: item.status,
    pdf: item.pdf,
    created: item.created,
    updated: item.updated
  }))
  return contracts as Contract[]
}

const getContractByStatus = async (status: ContractStatus) => {
  const result = await pb.collection("contracts").getList(1, 50, { filter: `status = "${status}"` })
  const contracts: Contract[] = result.items.map(item => ({
    id: item.id,
    tenant: item.tenant,
    property: item.property,
    startDate: item.startDate,
    endDate: item.endDate,
    status: item.status,
    pdf: item.pdf,
    created: item.created,
    updated: item.updated
  }))
  return contracts as Contract[]
}

// Endpoint para buscar contratos con filtros combinados
const getContractsByStatusAndOwner = async (
  ownerId: string,
  statusFilter?: "activo" | "inactivo" | "finalizado",
  page: number = 1,
  perPage: number = 50
) => {
  try {
    // Construir filtros dinámicamente
    let filterConditions = [`property.owner = "${ownerId}"`];
    
    // Agregar filtro de estado si se proporciona
    if (statusFilter) {
      filterConditions.push(`status.status = "${statusFilter}"`);
    }
    
    const filter = filterConditions.join(" && ");
    
    const result = await pb.collection("contracts").getList(page, perPage, { 
      filter: filter,
      expand: "tenant,property,status,property.owner", // Expandir relaciones necesarias
      sort: "-created" // Ordenar por más recientes primero
    });
    
    const contracts: Contract[] = result.items.map(item => ({
      id: item.id,
      tenant: item.tenant,
      property: item.property,
      startDate: item.startDate,
      endDate: item.endDate,
      status: item.status,
      pdf: item.pdf,
      created: item.created,
      updated: item.updated
    }));
    
    return {
      items: contracts,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      page: result.page,
      perPage: result.perPage
    };
  } catch (error) {
    console.error("Error al buscar contratos por estado y propietario:", error);
    throw error;
  }
}

// Versión más flexible con múltiples filtros opcionales
const getContractsWithFilters = async (filters: {
  ownerId?: string;
  tenantId?: string;
  status?: "activo" | "inactivo" | "finalizado";
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
}, pagination: {
  page?: number;
  perPage?: number;
} = {}) => {
  try {
    const { page = 1, perPage = 50 } = pagination;
    let filterConditions: string[] = [];
    
    // Filtro por propietario
    if (filters.ownerId) {
      filterConditions.push(`property.owner = "${filters.ownerId}"`);
    }
    
    // Filtro por inquilino
    if (filters.tenantId) {
      filterConditions.push(`tenant = "${filters.tenantId}"`);
    }
    
    // Filtro por estado
    if (filters.status) {
      filterConditions.push(`status.status = "${filters.status}"`);
    }
    
    // Filtros de fecha de inicio
    if (filters.startDateFrom) {
      filterConditions.push(`startDate >= "${filters.startDateFrom.toISOString()}"`);
    }
    
    if (filters.startDateTo) {
      filterConditions.push(`startDate <= "${filters.startDateTo.toISOString()}"`);
    }
    
    // Filtros de fecha de fin
    if (filters.endDateFrom) {
      filterConditions.push(`endDate >= "${filters.endDateFrom.toISOString()}"`);
    }
    
    if (filters.endDateTo) {
      filterConditions.push(`endDate <= "${filters.endDateTo.toISOString()}"`);
    }
    
    // Si no hay filtros, obtener todos los contratos
    const filter = filterConditions.length > 0 ? filterConditions.join(" && ") : "";
    
    const result = await pb.collection("contracts").getList(page, perPage, { 
      filter: filter,
      expand: "tenant,property,status,property.owner",
      sort: "-created"
    });
    
    const contracts: Contract[] = result.items.map(item => ({
      id: item.id,
      tenant: item.tenant,
      property: item.property,
      startDate: item.startDate,
      endDate: item.endDate,
      status: item.status,
      pdf: item.pdf,
      created: item.created,
      updated: item.updated
    }));
    
    return {
      items: contracts,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      page: result.page,
      perPage: result.perPage
    };
  } catch (error) {
    console.error("Error al buscar contratos con filtros:", error);
    throw error;
  }
}



export { 
  getContractsByOwner,
  getContractsByStatusAndOwner,
  getContractsWithFilters
}