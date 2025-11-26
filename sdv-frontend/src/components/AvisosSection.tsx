import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { avisosService } from '@/services/avisosService';
import { maestrosService } from '@/services/maestrosService';
import { useToast } from '@/hooks/use-toast';

interface Maestro {
  id: number;
  nombre: string;
}

interface Aviso {
  id: number;
  titulo: string;
  mensaje: string;
  fechaEnvio: string;
  estado: number;
  estadoDisplay: string;
  destinatarios: string[];
}

const AvisosSection = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaestros, setSelectedMaestros] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [maestros, setMaestros] = useState<Maestro[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avisosLeidos, setAvisosLeidos] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5)
  });
  
  // Obtener usuario directamente desde localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    console.log('👤 Usuario cargado:', user);
    console.log('🔑 Tipo del usuario:', user?.tipo);
    return user;
  });
  
  // tipo: 1 = Administrador, tipo: 2 = Profesor
  const isAdmin = currentUser?.tipo === 1;
  console.log('✅ ¿Es admin?:', isAdmin, '| Tipo:', currentUser?.tipo);

  useEffect(() => {
    loadData();
    
    // Actualizar usuario si cambia en localStorage
    const checkUser = () => {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (JSON.stringify(user) !== JSON.stringify(currentUser)) {
        setCurrentUser(user);
      }
    };
    
    // Verificar cada segundo por cambios en el usuario
    const interval = setInterval(checkUser, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let avisosResponse;
      
      // Si es admin, cargar todos los avisos
      // Si es maestro, solo cargar los avisos donde es destinatario
      if (isAdmin) {
        avisosResponse = await avisosService.getAll().catch(() => []);
      } else {
        const maestroId = currentUser?.id;
        if (maestroId) {
          avisosResponse = await avisosService.getByMaestro(maestroId).catch(() => []);
        } else {
          avisosResponse = [];
        }
      }

      // Cargar maestros (solo admin necesita la lista completa)
      const maestrosResponse = isAdmin 
        ? await maestrosService.getAll().catch(() => [])
        : [];

      // Procesar avisos
      const avisosArray = Array.isArray(avisosResponse) ? avisosResponse : [];
      console.log('📋 Avisos recibidos del backend:', avisosArray);
      console.log('👤 Usuario actual:', currentUser);
      
      // Mapear destinatarios de objetos a strings
      const avisosMapeados = avisosArray.map((aviso: any) => {
        console.log(`📨 Aviso "${aviso.titulo}": estado=${aviso.estado}, estadoDisplay="${aviso.estadoDisplay}"`);
        return {
          ...aviso,
          destinatarios: Array.isArray(aviso.destinatarios)
            ? aviso.destinatarios.map((d: any) => 
                typeof d === 'string' ? d : (d.maestroNombre || `Maestro ${d.maestroId}`)
              )
            : []
        };
      });
      setAvisos(avisosMapeados);

      // Procesar maestros  
      const maestrosArray = Array.isArray(maestrosResponse) ? maestrosResponse : [];
      const maestrosMapeados = maestrosArray.map((m: any) => ({
        id: m.id,
        nombre: m.nombreCompleto || m.nombre || `Maestro ${m.id}`
      }));
      setMaestros(maestrosMapeados);

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.mensaje.trim()) {
      toast({
        title: "Error",
        description: "Complete todos los campos",
        variant: "destructive"
      });
      return;
    }

    if (selectedMaestros.length === 0) {
      toast({
        title: "Error",
        description: "Seleccione al menos un maestro",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Combinar fecha y hora en formato ISO
      const fechaHora = `${formData.fecha}T${formData.hora}:00`;
      const fechaEnvio = new Date(fechaHora);
      const ahora = new Date();
      
      // Calcular si debe enviarse ahora o programarse
      const debeEnviarseAhora = fechaEnvio <= ahora;
      
      // Crear aviso siempre con estado Programado (1)
      const avisoDTO = {
        titulo: formData.titulo,
        mensaje: formData.mensaje,
        fechaEnvio: fechaEnvio.toISOString(),
        estado: 1, // Siempre Programado al crear
        maestroIds: selectedMaestros
      };

      console.log('📅 Fecha envío:', fechaEnvio.toLocaleString());
      console.log('🕐 Ahora:', ahora.toLocaleString());
      console.log('📦 ¿Enviar ahora?:', debeEnviarseAhora);

      // Obtener el ID del usuario actual
      const usuarioId = currentUser?.id || 1;

      // 1. Crear el aviso (estado inicial: Programado)
      const avisoCreado = await avisosService.create(avisoDTO, usuarioId);
      console.log('✅ Aviso creado:', avisoCreado);

      // 2. Si debe enviarse ahora, llamar a /enviar
      if (debeEnviarseAhora && avisoCreado?.id) {
        console.log('📤 Enviando aviso...');
        await avisosService.enviar(avisoCreado.id, usuarioId);
        console.log('✅ Aviso enviado');
      }

      toast({
        title: "✅ Aviso Enviado",
        description: `Enviado a ${selectedMaestros.length} maestro(s)`,
        duration: 3000
      });

      // Limpiar y cerrar
      setFormData({
        titulo: '',
        mensaje: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().slice(0, 5)
      });
      setSelectedMaestros([]);
      setIsModalOpen(false);
      
      // Recargar lista
      await loadData();

    } catch (error: any) {
      console.error('Error enviando aviso:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo enviar el aviso",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMaestro = (id: number) => {
    setSelectedMaestros(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getEstadoBadge = (estado: string) => {
    const lower = estado.toLowerCase();
    if (lower.includes('enviado')) return 'bg-green-100 text-green-800';
    if (lower.includes('programado')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleMarcarLeido = async (avisoId: number) => {
    try {
      const maestroId = currentUser?.id;
      if (!maestroId) {
        toast({
          title: "Error",
          description: "No se pudo identificar al maestro",
          variant: "destructive"
        });
        return;
      }

      await avisosService.marcarLeido(avisoId, maestroId);
      
      // Agregar a la lista de leídos
      setAvisosLeidos(prev => new Set(prev).add(avisoId));
      
      toast({
        title: "✅ Marcado como leído",
        description: "El aviso ha sido marcado como leído",
      });
    } catch (error) {
      console.error('Error al marcar como leído:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar el aviso como leído",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="flex justify-between items-center">
              <span>Gestión de Avisos</span>
              {isAdmin && (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  + NUEVO AVISO
                </Button>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-8">Cargando...</div>
            ) : avisos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay avisos. Crea uno nuevo.
              </div>
            ) : (
              <div className="space-y-4">
                {avisos
                  // Filtrar: Si no es admin, solo mostrar avisos enviados (estado 2)
                  .filter(aviso => isAdmin || aviso.estado === 2)
                  .map((aviso) => {
                    const estaLeido = avisosLeidos.has(aviso.id);
                    return (
                  <div 
                    key={aviso.id} 
                    className={`border rounded-lg p-4 shadow-sm transition-all ${
                      estaLeido 
                        ? 'bg-gray-50 opacity-60' 
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold text-lg ${estaLeido ? 'line-through text-gray-400' : ''}`}>
                          {aviso.titulo}
                        </h3>
                        {estaLeido && (
                          <Badge className="bg-gray-200 text-gray-600">
                            Leído
                          </Badge>
                        )}
                        <Badge className={getEstadoBadge(aviso.estadoDisplay)}>
                          {aviso.estadoDisplay}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(aviso.fechaEnvio).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`mb-2 ${estaLeido ? 'text-gray-400' : 'text-gray-600'}`}>
                      {aviso.mensaje}
                    </p>
                    {aviso.destinatarios && aviso.destinatarios.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {aviso.destinatarios.map((dest, idx) => (
                          <Badge key={idx} variant="secondary">
                            {dest}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Botón para marcar como leído (solo para maestros/profesores que no lo han leído) */}
                    {!isAdmin && aviso.estado === 2 && !estaLeido && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarcarLeido(aviso.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          ✓ Marcar como leído
                        </Button>
                      </div>
                    )}
                  </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Aviso</DialogTitle>
            <DialogDescription>
              Complete el formulario para enviar un aviso
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Título del aviso"
                required
              />
            </div>

            <div>
              <Label htmlFor="mensaje">Mensaje</Label>
              <Textarea
                id="mensaje"
                value={formData.mensaje}
                onChange={(e) => setFormData(prev => ({ ...prev, mensaje: e.target.value }))}
                placeholder="Mensaje del aviso"
                rows={4}
                required
              />
            </div>

            <div>
              <Label>Destinatarios ({selectedMaestros.length} seleccionados)</Label>
              <Input
                placeholder="Buscar maestros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
              <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                {maestros
                  .filter(m => m.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(maestro => (
                    <div key={maestro.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`m-${maestro.id}`}
                        checked={selectedMaestros.includes(maestro.id)}
                        onChange={() => toggleMaestro(maestro.id)}
                        className="rounded"
                      />
                      <label htmlFor={`m-${maestro.id}`} className="cursor-pointer">
                        {maestro.nombre}
                      </label>
                    </div>
                  ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha">Fecha de Envío</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="hora">Hora de Envío</Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
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
