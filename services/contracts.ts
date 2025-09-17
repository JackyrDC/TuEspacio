import pb from '../config/pocketbase';
import { Contract, ContractStatus, User, Places } from "../types/types"

export const createContract = async (contractData: Omit<Contract, "id">) => {
  const result = await pb.collection("contracts").create(contractData)
  return {
    ...result,
    startDate: new Date(result.startDate),
    endDate: new Date(result.endDate),
    created: new Date(result.created),
    updated: new Date(result.updated)
  } as unknown as Contract
}

export const getContract = async (id: string) => {
  const result = await pb.collection("contracts").getOne(id, {
    expand: "tenant,property,status"
  })
  return {
    ...result,
    tenant: result.expand?.tenant || { id: result.tenant } as User,
    property: result.expand?.property || { id: result.property } as Places,
    status: result.expand?.status || { status: result.status } as ContractStatus,
    startDate: new Date(result.startDate),
    endDate: new Date(result.endDate),
    created: new Date(result.created),
    updated: new Date(result.updated)
  } as unknown as Contract
}

export const updateContract = async (id: string, contractData: Partial<Contract>) => {
  const result = await pb.collection("contracts").update(id, contractData)
  return {
    ...result,
    startDate: new Date(result.startDate),
    endDate: new Date(result.endDate),
    created: new Date(result.created),
    updated: new Date(result.updated)
  } as unknown as Contract
}

export const deleteContract = async (id: string) => {
  const result = await pb.collection("contracts").delete(id)
  return result
}

export const getContractsByStatus = async (status: ContractStatus) => {
  const result = await pb.collection("contracts").getList(1, 50, { 
    filter: `status = "${status}"`,
    expand: "tenant,property,status"
  })
  
  const contracts: Contract[] = result.items.map((item: any) => ({
    id: item.id,
    tenant: item.expand?.tenant || { id: item.tenant } as any,
    property: item.expand?.property || { id: item.property } as any,
    startDate: new Date(item.startDate),
    endDate: new Date(item.endDate),
    status: item.expand?.status || { status: item.status } as any,
    pdf: item.pdf,
    created: new Date(item.created),
    updated: new Date(item.updated)
  }))
  return contracts
}

const getContractsByOwner = async (ownerId: string) => {
  const result = await pb.collection("contracts").getList(1, 50, { 
    filter: `property.owner = "${ownerId}"`,
    expand: "tenant,property,status"
  })

  const contracts: Contract[] = result.items.map((item: any) => ({
    id: item.id,
    tenant: item.expand?.tenant || { id: item.tenant } as User,
    property: item.expand?.property || { id: item.property } as Places,
    startDate: new Date(item.startDate),
    endDate: new Date(item.endDate),
    status: item.expand?.status || { status: item.status } as ContractStatus,
    pdf: item.pdf,
    created: new Date(item.created),
    updated: new Date(item.updated)
  }))
  return contracts
}

const getContractByStatus = async (status: ContractStatus) => {
  const result = await pb.collection("contracts").getList(1, 50, { 
    filter: `status = "${status}"`,
    expand: "tenant,property,status"
  })

  const contracts: Contract[] = result.items.map((item: any) => ({
    id: item.id,
    tenant: item.expand?.tenant || { id: item.tenant } as User,
    property: item.expand?.property || { id: item.property } as Places,
    startDate: new Date(item.startDate),
    endDate: new Date(item.endDate),
    status: item.expand?.status || { status: item.status } as ContractStatus,
    pdf: item.pdf,
    created: new Date(item.created),
    updated: new Date(item.updated)
  }))
  return contracts
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

    const contracts: Contract[] = result.items.map((item: any) => ({
      id: item.id,
      tenant: item.expand?.tenant || { id: item.tenant } as User,
      property: item.expand?.property || { id: item.property } as Places,
      startDate: new Date(item.startDate),
      endDate: new Date(item.endDate),
      status: item.expand?.status || { status: item.status } as ContractStatus,
      pdf: item.pdf,
      created: new Date(item.created),
      updated: new Date(item.updated)
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

    const contracts: Contract[] = result.items.map((item: any) => ({
      id: item.id,
      tenant: item.expand?.tenant || { id: item.tenant } as User,
      property: item.expand?.property || { id: item.property } as Places,
      startDate: new Date(item.startDate),
      endDate: new Date(item.endDate),
      status: item.expand?.status || { status: item.status } as ContractStatus,
      pdf: item.pdf,
      created: new Date(item.created),
      updated: new Date(item.updated)
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