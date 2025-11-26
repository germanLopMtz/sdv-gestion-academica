import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Aviso {
  id: number;
  titulo: string;
  mensaje: string;
  destinatarios: string[];
  fecha: string;
  estado: 'enviado' | 'programado' | 'borrador';
}

const AvisosSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaestros, setSelectedMaestros] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterFecha, setFilterFecha] = useState<string>('');
  const [avisos, setAvisos] = useState<Aviso[]>([
    {
      id: 1,
      titulo: "Taller de Técnicas de Doblaje",
      mensaje: "Se informa a todos los docentes que el próximo sábado 15 de abril se llevará a cabo un taller especial de técnicas avanzadas de doblaje. El taller será impartido por el reconocido actor de doblaje Mtro. Roberto Sánchez y se enfocará en la sincronización labial y la interpretación emocional.",
      destinatarios: ["Mtra. Lizzy Hernández", "Mtra. Ana Martínez", "Dr. Carlos Rodríguez"],
      fecha: "2024-04-10",
      estado: "enviado"
    },
    {
      id: 2,
      titulo: "Audiciones para Proyecto de Animación",
      mensaje: "Se convoca a todos los docentes a participar en las audiciones para el nuevo proyecto de animación 'Voces del Desierto'. Las audiciones se realizarán el próximo martes 18 de abril en el estudio principal. Se requiere preparar un monólogo de 2 minutos y una canción a capella.",
      destinatarios: ["Dir. Armando LeBlohic", "Mtra. María González", "Mtra. Laura Torres"],
      fecha: "2024-04-08",
      estado: "enviado"
    },
    {
      id: 3,
      titulo: "Actualización de Equipos de Estudio",
      mensaje: "Informamos que durante el fin de semana del 20-21 de abril se realizará la actualización de los equipos de grabación en los estudios 1 y 2. Por favor, coordinar las sesiones de práctica para evitar conflictos de horario. Los nuevos equipos incluirán software de sincronización avanzada y procesadores de audio de última generación.",
      destinatarios: ["Mtro. Juan Pérez", "Mtra. Lizzy Hernández", "Dr. Carlos Rodríguez"],
      fecha: "2024-04-05",
      estado: "programado"
    },
    {
      id: 4,
      titulo: "Conferencia: Tendencias en Doblaje",
      mensaje: "El próximo jueves 25 de abril se realizará una conferencia sobre las nuevas tendencias en el mundo del doblaje, incluyendo IA y localización de contenido. La conferencia será transmitida en línea y se recomienda la asistencia de todos los docentes. Se otorgará constancia de participación.",
      destinatarios: ["Mtra. Ana Martínez", "Mtro. Roberto Sánchez", "Mtra. Laura Torres"],
      fecha: "2024-04-12",
      estado: "borrador"
    },
    {
      id: 5,
      titulo: "Evaluación de Proyectos Finales",
      mensaje: "Se recuerda a todos los docentes que la fecha límite para la entrega de las evaluaciones de los proyectos finales de los estudiantes es el 30 de abril. Por favor, asegurarse de revisar los criterios de evaluación actualizados en la plataforma y coordinar con los demás docentes para la retroalimentación final.",
      destinatarios: ["Dir. Armando LeBlohic", "Mtra. María González", "Mtro. Juan Pérez"],
      fecha: "2024-04-15",
      estado: "programado"
    }
  ]);
  const [nuevoAviso, setNuevoAviso] = useState({
    titulo: '',
    mensaje: '',
    destinatarios: [] as string[],
    fecha: new Date().toISOString().split('T')[0],
    estado: 'borrador' as const
  });

  // Lista de maestros (esto debería venir de tu base de datos)
  const maestros = [
    { id: 1, nombre: 'Dir. Armando LeBlohic' },
    { id: 2, nombre: 'Mtra. María González' },
    { id: 3, nombre: 'Mtra. Ana Martínez' },
    { id: 4, nombre: 'Dr. Carlos Rodríguez' },
    { id: 5, nombre: 'Mtra. Lizzy Hernández' },
    { id: 6, nombre: 'Mtro. Roberto Sánchez' },
    { id: 7, nombre: 'Mtra. Laura Torres' },
    { id: 8, nombre: 'Mtro. Juan Pérez' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const avisoEnviado: Aviso = {
      id: Date.now(),
      titulo: nuevoAviso.titulo,
      mensaje: nuevoAviso.mensaje,
      destinatarios: selectedMaestros.map(id => 
        maestros.find(m => m.id.toString() === id)?.nombre || ''
      ),
      fecha: nuevoAviso.fecha,
      estado: 'enviado'
    };

    setAvisos(prev => [avisoEnviado, ...prev]);
    setIsModalOpen(false);
    setNuevoAviso({
      titulo: '',
      mensaje: '',
      destinatarios: [],
      fecha: new Date().toISOString().split('T')[0],
      estado: 'borrador'
    });
    setSelectedMaestros([]);
  };

  const handleMaestroSelect = (maestroId: string) => {
    setSelectedMaestros(prev => {
      if (prev.includes(maestroId)) {
        return prev.filter(id => id !== maestroId);
      }
      return [...prev, maestroId];
    });
  };

  const filteredMaestros = maestros.filter(maestro =>
    maestro.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvisos = avisos.filter(aviso => {
    const matchesSearch = 
      aviso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aviso.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aviso.destinatarios.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEstado = filterEstado === 'todos' || aviso.estado === filterEstado;
    const matchesFecha = !filterFecha || aviso.fecha === filterFecha;

    return matchesSearch && matchesEstado && matchesFecha;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'enviado':
        return 'bg-green-100 text-green-800';
      case 'programado':
        return 'bg-blue-100 text-blue-800';
      case 'borrador':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Lizzy Hernández</h2>
              <p className="text-gray-600 mt-1">Coordinadora</p>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg p-3 sm:p-6">
            <CardTitle className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex items-center space-x-3 justify-center lg:justify-start">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-lg sm:text-xl">Gestión de Avisos</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
                <Button
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                  onClick={() => setIsModalOpen(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  NUEVO AVISO
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {avisos.length === 0 ? (
              <div className="text-center text-gray-500">
                Seleccione "NUEVO AVISO" para enviar un mensaje a los docentes
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Input
                      placeholder="Buscar avisos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <svg
                      className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <Select value={filterEstado} onValueChange={setFilterEstado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="enviado">Enviados</SelectItem>
                      <SelectItem value="programado">Programados</SelectItem>
                      <SelectItem value="borrador">Borradores</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={filterFecha}
                    onChange={(e) => setFilterFecha(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  {filteredAvisos.map((aviso) => (
                    <div key={aviso.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-gray-800">{aviso.titulo}</h3>
                          <Badge className={getEstadoColor(aviso.estado)}>
                            {aviso.estado.charAt(0).toUpperCase() + aviso.estado.slice(1)}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">{aviso.fecha}</span>
                      </div>
                      <p className="text-gray-600 mb-3">{aviso.mensaje}</p>
                      <div className="flex flex-wrap gap-2">
                        {aviso.destinatarios.map((destinatario, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            {destinatario}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  {filteredAvisos.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No se encontraron avisos que coincidan con los criterios de búsqueda
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Nuevo Aviso */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800">Nuevo Aviso</DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600">
              Complete el formulario para enviar un mensaje a los docentes
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-sm sm:text-base">Título del Aviso</Label>
              <Input
                id="titulo"
                value={nuevoAviso.titulo}
                onChange={(e) => setNuevoAviso(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ingrese el título del aviso"
                className="text-sm sm:text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensaje" className="text-sm sm:text-base">Mensaje</Label>
              <Textarea
                id="mensaje"
                value={nuevoAviso.mensaje}
                onChange={(e) => setNuevoAviso(prev => ({ ...prev, mensaje: e.target.value }))}
                placeholder="Escriba el mensaje para los docentes"
                className="min-h-[100px] sm:min-h-[150px] text-sm sm:text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Destinatarios</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Buscar docentes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm sm:text-base"
                  />
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[150px] sm:max-h-[200px] overflow-y-auto p-2 border rounded-lg">
                  {filteredMaestros.map((maestro) => (
                    <div key={maestro.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`maestro-${maestro.id}`}
                        checked={selectedMaestros.includes(maestro.id.toString())}
                        onChange={() => handleMaestroSelect(maestro.id.toString())}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 sm:w-5 sm:h-5"
                      />
                      <label htmlFor={`maestro-${maestro.id}`} className="text-sm sm:text-base text-gray-700">
                        {maestro.nombre}
                      </label>
                    </div>
                  ))}
                  {filteredMaestros.length === 0 && (
                    <div className="col-span-1 sm:col-span-2 text-center text-gray-500 py-2 text-sm sm:text-base">
                      No se encontraron docentes
                    </div>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {selectedMaestros.length} docente(s) seleccionado(s)
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha" className="text-sm sm:text-base">Fecha de Envío</Label>
              <Input
                id="fecha"
                type="date"
                value={nuevoAviso.fecha}
                onChange={(e) => setNuevoAviso(prev => ({ ...prev, fecha: e.target.value }))}
                className="text-sm sm:text-base"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base"
              >
                Enviar Aviso
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvisosSection; 