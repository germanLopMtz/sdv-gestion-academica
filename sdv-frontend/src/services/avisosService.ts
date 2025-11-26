// services/avisosService.ts
import { avisosApi } from './api';
import { Aviso, AvisoDTO } from '../types/aviso';

export const avisosService = {
  getAll: async () => {
    const response = await avisosApi.getAll<Aviso[]>();
    return response.data;
  },

  getById: async (id: number) => {
    const response = await avisosApi.getById<Aviso>(id);
    return response.data;
  },

  create: async (data: AvisoDTO, usuarioCreadorId: number) => {
    const response = await avisosApi.create<Aviso>(data, usuarioCreadorId);
    return response.data;
  },

  update: async (id: number, data: AvisoDTO) => {
    const response = await avisosApi.update<Aviso>(id, data);
    return response.data;
  },

  remove: async (id: number) => {
    const response = await avisosApi.remove<void>(id);
    return response.data;
  },

  getByEstado: async (estado: string) => {
    const response = await avisosApi.getByEstado<Aviso[]>(estado);
    return response.data;
  },

  getByMaestro: async (maestroId: number) => {
    const response = await avisosApi.getByMaestro<Aviso[]>(maestroId);
    return response.data;
  },

  enviar: async (id: number, usuarioId: number) => {
    const response = await avisosApi.enviar<Aviso>(id, usuarioId);
    return response.data;
  },

  cancelar: async (id: number) => {
    const response = await avisosApi.cancelar<Aviso>(id);
    return response.data;
  },

  marcarLeido: async (avisoId: number, maestroId: number) => {
    const response = await avisosApi.marcarLeido<void>(avisoId, maestroId);
    return response.data;
  },

  buscar: async (searchTerm: string) => {
    const response = await avisosApi.buscar<Aviso[]>(searchTerm);
    return response.data;
  },
};
