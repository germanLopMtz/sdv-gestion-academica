import { apiClient } from './api';

export interface MensualidadDTO {
  alumnoId: number;
  mes: number; // 1-7 (AGO-FEB)
  año: number;
  monto: number;
  estado: number; // 0: Pendiente, 1: Pagado
  fechaPago?: string;
  concepto: number; // 1: Inscripción, 2: Mensualidad, 3: Material, 4: Otro
  metodoPago: number; // 1: Efectivo, 2: Transferencia, 3: Tarjeta, 4: Otro
  observaciones?: string;
}

export interface MensualidadOutPutDTO {
  id: number;
  alumnoId: number;
  alumnoNombre: string;
  curso: string;
  mes: number;
  año: number;
  monto: number;
  estado: number;
  fechaPago?: string;
  concepto: number;
  metodoPago: number;
  observaciones?: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
}

export interface MensualidadResumenDTO {
  alumnoId: number;
  alumnoNombre: string;
  curso: string;
  montoMensualidad: number;
  pagosPorMes: Record<string, string | null>;
  totalPagado: number;
}

export const mensualidadesApi = {
  create: (data: MensualidadDTO) =>
    apiClient.post<MensualidadOutPutDTO>('/Mensualidades', data),
  
  getAll: () =>
    apiClient.get<MensualidadOutPutDTO[]>('/Mensualidades'),
  
  getResumen: (año?: number) =>
    apiClient.get<MensualidadResumenDTO[]>('/Mensualidades/resumen', {
      params: año ? { año } : {}
    }),
  
  getById: (id: number) =>
    apiClient.get<MensualidadOutPutDTO>(`/Mensualidades/${id}`),
  
  getByAlumno: (alumnoId: number, año?: number) =>
    apiClient.get<MensualidadOutPutDTO[]>(`/Mensualidades/alumno/${alumnoId}`, {
      params: año ? { año } : {}
    }),
  
  getByMes: (mes: number, año: number) =>
    apiClient.get<MensualidadOutPutDTO[]>(`/Mensualidades/mes/${mes}/año/${año}`),
  
  getByEstado: (estado: number, año?: number) =>
    apiClient.get<MensualidadOutPutDTO[]>(`/Mensualidades/estado/${estado}`, {
      params: año ? { año } : {}
    }),
  
  buscar: (searchTerm: string) =>
    apiClient.get<MensualidadOutPutDTO[]>(`/Mensualidades/buscar?searchTerm=${encodeURIComponent(searchTerm)}`),
  
  update: (id: number, data: MensualidadDTO) =>
    apiClient.put<MensualidadOutPutDTO>(`/Mensualidades/${id}`, data),
  
  remove: (id: number) =>
    apiClient.delete(`/Mensualidades/${id}`),
};

