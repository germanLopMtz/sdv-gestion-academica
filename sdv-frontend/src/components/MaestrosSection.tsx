import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { maestrosService } from '../services/maestrosService';
import { MaestroOutPutDTO, Maestro, mapMaestroToDisplay, CursoType, MaestroDTO } from '../types/maestro';

// Funciones de mapeo para el formulario
const getCursoDisplayName = (tipo: CursoType, numeroDiplomado?: number, especialidad?: string): string => {
  switch (tipo) {
    case CursoType.Diplomado:
      return especialidad || 'Sin especialidad';
    default:
      return '';
  }
};

const parseCursoFromDisplay = (displayName: string): { tipo: CursoType; numeroDiplomado?: number; especialidad?: string } => {
  // Los nuevos cursos son: Doblaje, Locución, Influencer Kids, Actuación y Canto
  const cursoNames = ['Doblaje', 'Locución', 'Influencer Kids', 'Actuación y Canto'];
  
  if (cursoNames.includes(displayName)) {
    return {
      tipo: CursoType.Diplomado,
      especialidad: displayName
    };
  }
  
  return { tipo: CursoType.None };
};




interface NewMaestro {
  nombre: string;
  curso: string;
  fechaNac: string;
  telefono: string;
  email: string;
  procedencia: string;
  direccion: string;
  contrasena: string;
}

const MaestrosSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaestros, setSelectedMaestros] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({
    curso: '',
    procedencia: ''
  });
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [newMaestro, setNewMaestro] = useState<NewMaestro>({
    nombre: '',
    curso: '',
    fechaNac: '',
    telefono: '',
    email: '',
    procedencia: '',
    direccion: '',
    contrasena: ''
  });

  const [maestros, setMaestros] = useState<Maestro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaestros();
  }, []);

  const loadMaestros = async () => {
    try {
      const data: MaestroOutPutDTO[] = await maestrosService.getAll();
      const displayMaestros = data.map(mapMaestroToDisplay);
      setMaestros(displayMaestros);
      setLoading(false);
    } catch (error) {
      console.error('Error loading maestros:', error);
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMaestros(filteredMaestros.map(m => m.id));
    } else {
      setSelectedMaestros([]);
    }
  };

  const handleMaestroSelect = (id: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedMaestros(prev => [...prev, id]);
    } else {
      setSelectedMaestros(prev => prev.filter(m => m !== id));
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    const newFilters = { ...filterValues };
    Object.keys(newFilters).forEach(key => {
      if (!newFilters[key as keyof typeof newFilters]) {
        delete newFilters[key as keyof typeof newFilters];
      }
    });
    setActiveFilters(newFilters);
    setIsFilterModalOpen(false);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setFilterValues({
      curso: '',
      procedencia: ''
    });
  };

  const filteredMaestros = maestros.filter(maestro => {
    const matchesSearch = searchTerm === '' || 
      maestro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maestro.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maestro.curso.toLowerCase().includes(searchTerm.toLowerCase());

    if (Object.keys(activeFilters).length === 0) {
      return matchesSearch;
    }

    const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
      switch (key) {
        case 'curso':
          return maestro.curso === value;
        case 'procedencia':
          return maestro.procedencia === value;
        default:
          return true;
      }
    });

    return matchesSearch && matchesFilters;
  });

  const handleEditClick = () => {
    if (selectedMaestros.length === 1) {
      const maestroToEdit = maestros.find(m => m.id === selectedMaestros[0]);
      if (maestroToEdit) {
        setNewMaestro({
          nombre: maestroToEdit.nombre,
          curso: maestroToEdit.curso,
          fechaNac: maestroToEdit.fechaNac,
          telefono: maestroToEdit.telefono,
          email: maestroToEdit.email,
          procedencia: maestroToEdit.procedencia,
          direccion: '', // Estos campos no están en el objeto display, se dejarán vacíos para edición
          contrasena: ''
        });
        setIsEditing(true);
        setIsModalOpen(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que se hayan seleccionado curso
    if (!newMaestro.curso) {
      alert('Por favor seleccione un curso');
      return;
    }
    
    // Convertir datos del formulario al formato de API
    const cursoInfo = parseCursoFromDisplay(newMaestro.curso);
    
    // Convertir fecha al formato ISO si es necesario
    let fechaISO = newMaestro.fechaNac;
    if (fechaISO && !fechaISO.includes('T')) {
      // Si es una fecha en formato YYYY-MM-DD, convertir a ISO
      fechaISO = new Date(fechaISO + 'T00:00:00.000Z').toISOString();
    }
    
    const maestroData: MaestroDTO = {
      nombreCompleto: newMaestro.nombre,
      fechaNacimiento: fechaISO,
      telefono: newMaestro.telefono,
      correoElectronico: newMaestro.email,
      procedencia: newMaestro.procedencia,
      tipoDeCurso: cursoInfo.tipo,
      especialidad: cursoInfo.especialidad,
      direccion: newMaestro.direccion,
      contrasena: newMaestro.contrasena
    };

    console.log('📤 Datos que se envían al backend:', maestroData);
    console.log('📤 Curso info parsed:', cursoInfo);

    try {
      if (isEditing && selectedMaestros.length > 0) {
        // Actualizar maestro existente
        const result = await maestrosService.update(selectedMaestros[0], maestroData);
        console.log('✅ Maestro actualizado exitosamente:', result);
      } else {
        // Crear nuevo maestro
        const result = await maestrosService.create(maestroData);
        console.log('✅ Maestro creado exitosamente:', result);
      }
      
      // Recargar la lista después de la operación
      await loadMaestros();
      
    } catch (error: any) {
      console.error('❌ Error al guardar maestro:', error);
      
      // Intentar obtener más detalles del error
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
      } else if (error.message) {
        console.error('❌ Error message:', error.message);
      }
      
      // Mostrar error al usuario
      alert(`Error al guardar maestro: ${error.message || 'Error desconocido'}`);
    }

    // Limpiar formulario y cerrar modal
    setIsModalOpen(false);
    setIsEditing(false);
    setNewMaestro({
      nombre: '',
      curso: '',
      fechaNac: '',
      telefono: '',
      email: '',
      procedencia: '',
      direccion: '',
      contrasena: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMaestro(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewMaestro(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Eliminar todos los maestros seleccionados
      await Promise.all(
        selectedMaestros.map(id => maestrosService.delete(id))
      );
      
      console.log('Maestros eliminados exitosamente');
      
      // Recargar la lista después de eliminar
      await loadMaestros();
      
    } catch (error) {
      console.error('Error al eliminar maestros:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
    
    setSelectedMaestros([]);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800"></h2>
              <p className="text-gray-600 mt-1">Administrador</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="text-center sm:text-right">
                <p className="text-sm text-gray-500">Total de Maestros</p>
                <p className="text-2xl font-bold text-blue-600">{maestros.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg p-3 sm:p-6">
            <CardTitle className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex items-center space-x-3 justify-center lg:justify-start">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-lg sm:text-xl">Gestión de Maestros</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
                <Button
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                  onClick={() => {
                    setIsEditing(false);
                    setIsModalOpen(true);
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  AGREGAR
                </Button>
                <Button
                  variant="outline"
                  className={`bg-white/10 hover:bg-white/20 text-white border-white/20 ${
                    selectedMaestros.length !== 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleEditClick}
                  disabled={selectedMaestros.length !== 1}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  EDITAR
                </Button>
                <Button
                  variant="outline"
                  className={`bg-red-600 hover:bg-red-700 text-white border-red-600 ${
                    selectedMaestros.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleDeleteClick}
                  disabled={selectedMaestros.length === 0}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  ELIMINAR
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  onClick={() => setIsFilterModalOpen(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  FILTRAR
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="p-3 sm:p-6 bg-gray-50 border-b">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-full sm:max-w-sm">
                    <Input
                      placeholder="Buscar maestro..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Filtros activos */}
                {Object.keys(activeFilters).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(activeFilters).map(([key, value]) => (
                      <Badge
                        key={key}
                        variant="secondary"
                        className="px-3 py-1 rounded-full flex items-center space-x-1"
                      >
                        <span>{key}: {value}</span>
                        <button
                          onClick={() => {
                            const newFilters = { ...activeFilters };
                            delete newFilters[key];
                            setActiveFilters(newFilters);
                          }}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <div className="max-h-[600px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedMaestros.length === filteredMaestros.length && filteredMaestros.length > 0}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                              />
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Nombre completo</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Curso</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Fecha nac.</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Teléfono</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Correo</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Procedencia</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {loading ? (
                            <tr>
                              <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                Cargando maestros...
                              </td>
                            </tr>
                          ) : filteredMaestros.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                No se encontraron maestros
                              </td>
                            </tr>
                          ) : (
                            filteredMaestros.map((maestro) => (
                              <tr key={maestro.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={selectedMaestros.includes(maestro.id)}
                                    onChange={(e) => handleMaestroSelect(maestro.id, e.target.checked)}
                                  />
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                      <span className="text-sm font-medium text-blue-600">
                                        {maestro.nombre.split(' ').map(n => n[0]).join('')}
                                      </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{maestro.nombre}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge 
                                    variant="default"
                                    className="px-3 py-1 rounded-full"
                                  >
                                    {maestro.curso}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">{maestro.fechaNac}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{maestro.telefono}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{maestro.email}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{maestro.procedencia}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Filtros */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Filtrar Maestros</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Seleccione los criterios de filtrado para los maestros
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="curso-filter">Curso</Label>
              <select
                id="curso-filter"
                name="curso"
                value={filterValues.curso}
                onChange={(e) => handleFilterChange('curso', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccione el curso</option>
                <option value="Doblaje">Doblaje</option>
                <option value="Locución">Locución</option>
                <option value="Actuación y Canto">Actuación y Canto</option>
                <option value="Influencer Kids">Influencer Kids</option>


              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="procedencia">Procedencia</Label>
              <Input
                id="procedencia"
                name="procedencia"
                value={filterValues.procedencia}
                onChange={(e) => handleFilterChange('procedencia', e.target.value)}
                placeholder="Ej: Hermosillo, Son. MX"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsFilterModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={applyFilters}>
              Aplicar Filtros
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Agregar/Editar Maestro */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Editar Maestro' : 'Agregar Nuevo Maestro'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {isEditing 
                ? 'Modifique los datos del maestro seleccionado'
                : 'Complete el formulario con los datos del nuevo maestro'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={newMaestro.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Mtra. María González"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="curso">Curso</Label>
                <select
                  id="curso"
                  name="curso"
                  value={newMaestro.curso}
                  onChange={(e) => handleSelectChange('curso', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Seleccione el curso</option>
                  <option value="Doblaje">Doblaje</option>
                  <option value="Locución">Locución</option>
                  <option value="Influencer Kids">Influencer Kids</option>
                  <option value="Actuación y Canto">Actuación y Canto</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaNac">Fecha de nacimiento</Label>
                <Input
                  id="fechaNac"
                  name="fechaNac"
                  type="date"
                  value={newMaestro.fechaNac}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={newMaestro.telefono}
                  onChange={handleInputChange}
                  placeholder="Ej: 52 6621234567"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newMaestro.email}
                onChange={handleInputChange}
                placeholder="ejemplo@sdv.edu.mx"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedencia">Procedencia</Label>
              <Input
                id="procedencia"
                name="procedencia"
                value={newMaestro.procedencia}
                onChange={handleInputChange}
                placeholder="Ej: Hermosillo, Son. MX"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                name="direccion"
                value={newMaestro.direccion}
                onChange={handleInputChange}
                placeholder="Ej: Calle 123, Col. Centro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contrasena">Contraseña</Label>
              <Input
                id="contrasena"
                name="contrasena"
                type="password"
                value={newMaestro.contrasena}
                onChange={handleInputChange}
                placeholder="Ingrese una contraseña"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Guardar cambios' : 'Agregar maestro'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">Confirmar Eliminación</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {selectedMaestros.length === 1 
                ? '¿Está seguro que desea eliminar al maestro seleccionado?'
                : `¿Está seguro que desea eliminar a los ${selectedMaestros.length} maestros seleccionados?`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaestrosSection; 