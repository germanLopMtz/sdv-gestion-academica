// types/aviso.ts
export interface Aviso {
  id: number;
  titulo: string;
  mensaje: string;
  destinatarios: string[];
  fecha: string;
  estado: number; // Enum numérico del backend
  estadoDisplay: string; // String legible para mostrar
  usuarioCreadorId?: number;
  maestroIds?: number[];
}

export interface AvisoDTO {
  titulo: string;
  mensaje: string;
  fechaEnvio: string;
  estado: number; // 0=Borrador, 1=Programado, 2=Enviado
  maestroIds: number[];
}
