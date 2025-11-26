import React, { useState, useEffect } from 'react';
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
import { avisosService } from '@/services/avisosService';
import { maestrosService } from '@/services/maestrosService';
import { Aviso } from '@/types/aviso';
import { Maestro } from '@/types/maestro';
import { useToast } from '@/hooks/use-toast';

const AvisosSection = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaestros, setSelectedMaestros] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterFecha, setFilterFecha] = useState<string>('');
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [maestros, setMaestros] = useState<Maestro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nuevoAviso, setNuevoAviso] = useState({
    titulo: '',
    mensaje: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'borrador' as const
  });

  // Cargar avisos y maestros al montar el componente
  useEffect(() => {
    console.log('🚀 Componente AvisosSection montado');
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Iniciando carga de datos...');
      
      // Cargar avisos
      const avisosData = await avisosService.getAll();
      console.log('📥 Avisos cargados (raw):', avisosData);
      
      // Asegurar que avisosData sea un array y mapear los campos correctamente
      const avisosMapeados = Array.isArray(avisosData) 
        ? avisosData.map((a: any) => ({
            ...a,
            destinatarios: a.destinatarios || [],
            fecha: a.fecha || a.fechaEnvio || new Date().toISOString(),
            estadoDisplay: a.estadoDisplay || (typeof a.estado === 'number' ? 
              ['Borrador', 'Programado', 'Enviado'][a.estado] : String(a.estado))
          }))
        : [];
      
      console.log('📥 Avisos mapeados:', avisosMapeados);
      setAvisos(avisosMapeados);
      
      // Cargar maestros
      const maestrosData = await maestrosService.getAll();
      console.log('👨‍🏫 Maestros cargados:', maestrosData);
      
      // Mapear maestros al formato correcto si es necesario
      const maestrosMapeados = Array.isArray(maestrosData) 
        ? maestrosData.map((m: any) => ({
            id: m.id,
            nombre: m.nombreCompleto || m.nombre || 'Sin nombre',
            curso: m.curso || '',
            fechaNac: m.fechaNacimiento || m.fechaNac || '',
            telefono: m.telefono || '',
            email: m.correoElectronico || m.email || '',
            procedencia: m.procedencia || '',
            modalidad: m.modalidad || ''
          }))
        : [];
      
      console.log('👨‍🏫 Maestros mapeados:', maestrosMapeados);
      setMaestros(maestrosMapeados);
      
    } catch (error: any) {
      console.error('❌ Error al cargar datos:', error);
      console.error('Detalles:', error.response?.data || error.message);
      setError(error.message || "Error al cargar los datos");
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los datos",
        variant: "destructive",
      });
      // Asegurar que haya arrays vacíos para evitar errores
      setAvisos([]);
      setMaestros([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔥 handleSubmit llamado');
    console.log('📝 Datos del formulario:', nuevoAviso);
    console.log('👥 Maestros seleccionados:', selectedMaestros);
    
    if (selectedMaestros.length === 0) {
      toast({
        title: "⚠️ Error",
        description: "Debe seleccionar al menos un destinatario",
        variant: "destructive",
      });
      return;
    }

    if (!nuevoAviso.titulo.trim()) {
      toast({
        title: "⚠️ Error",
        description: "El título es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!nuevoAviso.mensaje.trim()) {
      toast({
        title: "⚠️ Error",
        description: "El mensaje es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 Enviando aviso...');
      
      const usuarioCreadorId = 1; // TODO: obtener del usuario logueado
      
      // Usar fecha/hora actual - El backend ahora acepta fecha actual con margen de 5 minutos
      const fechaActual = new Date();
      const fechaISO = fechaActual.toISOString();
      
      const avisoDTO = {
        titulo: nuevoAviso.titulo,
        mensaje: nuevoAviso.mensaje,
        fechaEnvio: fechaISO,
        estado: 'enviado' as const,
        maestroIds: selectedMaestros,
      };

      console.log('📦 DTO a enviar:', avisoDTO);
      const avisoCreado = await avisosService.create(avisoDTO, usuarioCreadorId);
      console.log('✅ Aviso creado:', avisoCreado);
      
      // No es necesario llamar a enviar() porque ya se crea con estado "enviado"
      // El endpoint /enviar es solo para cambiar el estado de borradores o programados

      // Mostrar notificación de éxito
      toast({
        title: "✅ ¡Aviso Enviado!",
        description: `El aviso "${nuevoAviso.titulo}" se envió correctamente a ${selectedMaestros.length} maestro(s)`,
        duration: 5000,
      });

      // Cerrar modal y limpiar formulario
      setIsModalOpen(false);
      setNuevoAviso({
        titulo: '',
        mensaje: '',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'borrador'
      });
      setSelectedMaestros([]);
      
      // Recargar avisos
      console.log('🔄 Recargando lista de avisos...');
      await loadData();
      console.log('✅ Lista actualizada');
      
    } catch (error: any) {
      console.error('❌ Error al crear aviso:', error);
      console.error('📋 Detalles completos:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        errors: error.response?.data?.errors
      });
      
      // Log completo del response data
      console.error('🔍 Response data completo:', JSON.stringify(error.response?.data, null, 2));
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.title
        || error.response?.data?.errors 
        || error.message 
        || "No se pudo crear el aviso";
      
      toast({
        title: "❌ Error al enviar",
        description: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaestroSelect = (maestroId: number) => {
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
      (aviso.destinatarios && aviso.destinatarios.some(d => d.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesEstado = filterEstado === 'todos' || aviso.estado === filterEstado;
    const matchesFecha = !filterFecha || aviso.fecha.startsWith(filterFecha);

    return matchesSearch && matchesEstado && matchesFecha;
  });

  const getEstadoColor = (estado: string | number) => {
    // Convertir estado numérico (enum del backend) a string
    let estadoStr = '';
    if (typeof estado === 'number') {
      switch (estado) {
        case 0: estadoStr = 'borrador'; break;
        case 1: estadoStr = 'programado'; break;
        case 2: estadoStr = 'enviado'; break;
        default: estadoStr = 'desconocido'; break;
      }
    } else {
      estadoStr = estado.toLowerCase();
    }
    
    switch (estadoStr) {
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

  const getEstadoText = (estado: string | number): string => {
    // Convertir estado numérico (enum del backend) a string
    if (typeof estado === 'number') {
      switch (estado) {
        case 0: return 'Borrador';
        case 1: return 'Programado';
        case 2: return 'Enviado';
        default: return 'Desconocido';
      }
    }
    const estadoStr = String(estado);
    return estadoStr.charAt(0).toUpperCase() + estadoStr.slice(1);
  };

  // Renderizado con manejo de errores
  if (error && !isLoading) {
    return (
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-red-600 mb-2">Error al cargar datos</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={loadData}>Reintentar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            {isLoading ? (
              <div className="text-center text-gray-500 py-8">
                Cargando avisos...
              </div>
            ) : avisos.length === 0 ? (
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
                          <Badge className={getEstadoColor(aviso.estadoDisplay || aviso.estado)}>
                            {aviso.estadoDisplay || getEstadoText(aviso.estado)}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">{aviso.fecha}</span>
                      </div>
                      <p className="text-gray-600 mb-3">{aviso.mensaje}</p>
                      <div className="flex flex-wrap gap-2">
                        {aviso.destinatarios && aviso.destinatarios.map((destinatario, index) => (
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
                        checked={selectedMaestros.includes(maestro.id)}
                        onChange={() => handleMaestroSelect(maestro.id)}
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
                disabled={isSubmitting}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Aviso'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvisosSection; 