// services/maestrosService.ts
import { MaestroDTO } from '../types/maestro';

const API_BASE = '/api/maestros';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    (error as any).response = {
      status: response.status,
      statusText: response.statusText,
      data: errorData
    };
    throw error;
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

export const maestrosService = {
  getAll: () => fetch(API_BASE).then(handleResponse),
  
  getById: (id: number) => fetch(`${API_BASE}/${id}`).then(handleResponse),
  
  create: (maestro: MaestroDTO) => {
    console.log('🚀 Enviando maestro al backend:', maestro);
    return fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maestro)
    }).then(handleResponse);
  },
  
  update: (id: number, maestro: MaestroDTO) =>
    fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maestro)
    }).then(handleResponse),
    
  delete: (id: number) =>
    fetch(`${API_BASE}/${id}`, { method: 'DELETE' }).then(handleResponse)
};