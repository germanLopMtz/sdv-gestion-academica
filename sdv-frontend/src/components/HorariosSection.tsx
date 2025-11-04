import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Edit, Trash2, Clock, MapPin, Users, Calendar } from 'lucide-react';
import { horariosApi, usuariosApi, alumnosApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: number;
  name: string;
}

interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  displayName: string;
}

interface Maestro {
  id: number;
  nombreCompleto: string;
  tipo: number;
}

interface Alumno {
  id: number;
  nombreCompleto: string;
}

interface ClassSchedule {
  id: number;
  roomId: number;
  roomName: string;
  timeSlotId: number;
  timeSlotDisplay: string;
  maestroId: number;
  maestroName: string;
  dayOfWeek: number;
  dayOfWeekDisplay: string;
  modalidad: number;
  modalidadDisplay: string;
  tipoDeCurso: number;
  tipoDeCursoDisplay: string;
  alumnos: Array<{
    id: number;
    alumnoId: number;
    alumnoName: string;
  }>;
  currentCapacity: number;
  maxCapacity: number;
  createdAt: string;
}

const dayOfWeekOptions = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const modalidadOptions = [
  { value: 1, label: 'Presencial' },
  { value: 2, label: 'Virtual' },
];

const tipoCursoOptions = [
  { value: 1, label: 'Seminario' },
  { value: 2, label: 'Diplomado' },
];

const HorariosSection = () => {
  const { toast: showToast } = useToast();
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [maestros, setMaestros] = useState<Maestro[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Filtros del listado
  const [filters, setFilters] = useState({
    tipo: 'all', // 'all' | '1' | '2'
    dayOfWeek: 'all', // 'all' | '1'..'6'
    timeSlotId: 'all', // 'all' | id
    maestroId: 'all',
    roomId: 'all',
  });

  const [formData, setFormData] = useState({
    roomId: '',
    timeSlotId: '',
    maestroId: '',
    dayOfWeek: '',
    modalidad: '',
    tipoDeCurso: '',
    alumnoIds: [] as number[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [schedulesRes, roomsRes, timeSlotsRes, usuariosRes, alumnosRes] = await Promise.all([
        horariosApi.getAll(),
        horariosApi.getRooms(),
        horariosApi.getTimeSlots(),
        usuariosApi.getAll(),
        alumnosApi.getAll(),
      ]);

      setSchedules(schedulesRes.data as ClassSchedule[]);
      setRooms(roomsRes.data as Room[]);
      setTimeSlots(timeSlotsRes.data as TimeSlot[]);
      
      // Filtrar solo maestros (tipo = 2)
      const maestrosData = (usuariosRes.data as any[]).filter(u => u.tipo === 2);
      setMaestros(maestrosData);
      
      setAlumnos(alumnosRes.data as Alumno[]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showToast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(s => {
    if (filters.tipo !== 'all' && s.tipoDeCurso.toString() !== filters.tipo) return false;
    if (filters.dayOfWeek !== 'all' && s.dayOfWeek.toString() !== filters.dayOfWeek) return false;
    if (filters.timeSlotId !== 'all' && s.timeSlotId.toString() !== filters.timeSlotId) return false;
    if (filters.maestroId !== 'all' && s.maestroId.toString() !== filters.maestroId) return false;
    if (filters.roomId !== 'all' && s.roomId.toString() !== filters.roomId) return false;
    return true;
  });

  // Cálculo de disponibles para día/horario seleccionados en filtros
  const selectedDay = filters.dayOfWeek === 'all' ? null : parseInt(filters.dayOfWeek);
  const selectedTimeSlotId = filters.timeSlotId === 'all' ? null : parseInt(filters.timeSlotId);
  const occupiedMaestroIds = new Set(
    schedules
      .filter(s => (selectedDay ? s.dayOfWeek === selectedDay : false) && (selectedTimeSlotId ? s.timeSlotId === selectedTimeSlotId : false))
      .map(s => s.maestroId)
  );
  const occupiedRoomIds = new Set(
    schedules
      .filter(s => (selectedDay ? s.dayOfWeek === selectedDay : false) && (selectedTimeSlotId ? s.timeSlotId === selectedTimeSlotId : false))
      .map(s => s.roomId)
  );
  const availableMaestros = maestros.filter(m => !selectedDay || !selectedTimeSlotId || !occupiedMaestroIds.has(m.id));
  const availableRooms = rooms.filter(r => !selectedDay || !selectedTimeSlotId || !occupiedRoomIds.has(r.id));

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.roomId) errors.push('Debe seleccionar un aula');
    if (!formData.timeSlotId) errors.push('Debe seleccionar un horario');
    if (!formData.maestroId) errors.push('Debe seleccionar un maestro');
    if (!formData.dayOfWeek) errors.push('Debe seleccionar un día de la semana');
    if (!formData.modalidad) errors.push('Debe seleccionar una modalidad');
    if (!formData.tipoDeCurso) errors.push('Debe seleccionar un tipo de curso');
    if (formData.alumnoIds.length === 0) errors.push('Debe seleccionar al menos un alumno');

    // Validar cupo máximo
    const maxCapacity = formData.tipoDeCurso === '2' ? 5 : 12; // Diplomado: 5, Seminario: 12
    if (formData.alumnoIds.length > maxCapacity) {
      errors.push(`El cupo máximo para ${formData.tipoDeCurso === '2' ? 'Diplomado' : 'Seminario'} es de ${maxCapacity} alumnos`);
    }

    // Validar horario 8-10 PM en viernes/sábado
    const selectedTimeSlot = timeSlots.find(ts => ts.id === parseInt(formData.timeSlotId));
    const dayOfWeekNum = parseInt(formData.dayOfWeek);
    if (selectedTimeSlot && selectedTimeSlot.startTime === '20:00' && 
        (dayOfWeekNum === 5 || dayOfWeekNum === 6)) {
      errors.push('No se permiten clases de 8:00-10:00 PM los viernes y sábados');
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      showToast({
        title: 'Errores de validación',
        description: errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    setValidationErrors([]);

    try {
      setIsLoading(true);
      const payload = {
        roomId: parseInt(formData.roomId),
        timeSlotId: parseInt(formData.timeSlotId),
        maestroId: parseInt(formData.maestroId),
        dayOfWeek: parseInt(formData.dayOfWeek),
        modalidad: parseInt(formData.modalidad),
        tipoDeCurso: parseInt(formData.tipoDeCurso),
        alumnoIds: formData.alumnoIds,
      };

      if (isEditing && selectedScheduleId) {
        await horariosApi.update(selectedScheduleId, payload);
        showToast({
          title: 'Éxito',
          description: 'Horario actualizado correctamente',
        });
      } else {
        await horariosApi.create(payload);
        showToast({
          title: 'Éxito',
          description: 'Horario creado correctamente',
        });
      }

      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al guardar el horario';
      showToast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await horariosApi.getById(id);
      const schedule = response.data as ClassSchedule;

      setFormData({
        roomId: schedule.roomId.toString(),
        timeSlotId: schedule.timeSlotId.toString(),
        maestroId: schedule.maestroId.toString(),
        dayOfWeek: schedule.dayOfWeek.toString(),
        modalidad: schedule.modalidad.toString(),
        tipoDeCurso: schedule.tipoDeCurso.toString(),
        alumnoIds: schedule.alumnos.map(a => a.alumnoId),
      });

      setSelectedScheduleId(id);
      setIsEditing(true);
      setIsModalOpen(true);
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'No se pudo cargar el horario',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedScheduleId) return;

    try {
      setIsLoading(true);
      await horariosApi.remove(selectedScheduleId);
      showToast({
        title: 'Éxito',
        description: 'Horario eliminado correctamente',
      });
      setIsDeleteModalOpen(false);
      setSelectedScheduleId(null);
      loadData();
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'No se pudo eliminar el horario',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      roomId: '',
      timeSlotId: '',
      maestroId: '',
      dayOfWeek: '',
      modalidad: '',
      tipoDeCurso: '',
      alumnoIds: [],
    });
    setIsEditing(false);
    setSelectedScheduleId(null);
    setValidationErrors([]);
  };

  const handleAlumnoToggle = (alumnoId: number) => {
    setFormData(prev => {
      const isSelected = prev.alumnoIds.includes(alumnoId);
      const newAlumnoIds = isSelected
        ? prev.alumnoIds.filter(id => id !== alumnoId)
        : [...prev.alumnoIds, alumnoId];

      // Validar cupo máximo
      const maxCapacity = prev.tipoDeCurso === '2' ? 5 : 12;
      if (newAlumnoIds.length > maxCapacity) {
        showToast({
          title: 'Cupo excedido',
          description: `El cupo máximo es de ${maxCapacity} alumnos`,
          variant: 'destructive',
        });
        return prev;
      }

      return { ...prev, alumnoIds: newAlumnoIds };
    });
  };

  const getMaxCapacity = () => {
    return formData.tipoDeCurso === '2' ? 5 : 12;
  };

  const isTimeSlotDisabled = (timeSlotId: number) => {
    if (!formData.dayOfWeek) return false;
    const dayOfWeekNum = parseInt(formData.dayOfWeek);
    const timeSlot = timeSlots.find(ts => ts.id === timeSlotId);
    return timeSlot?.startTime === '20:00' && (dayOfWeekNum === 5 || dayOfWeekNum === 6);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Horarios</h1>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Horario
        </Button>
      </div>

      {/* Barra de filtros */}
      <Card className="mb-4 border border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <Label className="text-blue-700">Tipo</Label>
              <Select value={filters.tipo} onValueChange={(v) => setFilters(prev => ({ ...prev, tipo: v }))}>
                <SelectTrigger className="border-blue-300 focus:ring-blue-500 focus:border-blue-500"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">Seminario</SelectItem>
                  <SelectItem value="2">Diplomado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-blue-700">Día</Label>
              <Select value={filters.dayOfWeek} onValueChange={(v) => setFilters(prev => ({ ...prev, dayOfWeek: v }))}>
                <SelectTrigger className="border-blue-300 focus:ring-blue-500 focus:border-blue-500"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {dayOfWeekOptions.map(d => (
                    <SelectItem key={d.value} value={d.value.toString()}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-blue-700">Horario</Label>
              <Select value={filters.timeSlotId} onValueChange={(v) => setFilters(prev => ({ ...prev, timeSlotId: v }))}>
                <SelectTrigger className="border-blue-300 focus:ring-blue-500 focus:border-blue-500"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {timeSlots.map(ts => (
                    <SelectItem key={ts.id} value={ts.id.toString()}>{ts.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-blue-700">Maestro</Label>
              <Select value={filters.maestroId} onValueChange={(v) => setFilters(prev => ({ ...prev, maestroId: v }))}>
                <SelectTrigger className="border-blue-300 focus:ring-blue-500 focus:border-blue-500"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {maestros.map(m => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.nombreCompleto}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-blue-700">Aula</Label>
              <Select value={filters.roomId} onValueChange={(v) => setFilters(prev => ({ ...prev, roomId: v }))}>
                <SelectTrigger className="border-blue-300 focus:ring-blue-500 focus:border-blue-500"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {rooms.map(r => (
                    <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <Button
              variant="outline"
              className="border-blue-600 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              onClick={() => setFilters({ tipo: 'all', dayOfWeek: 'all', timeSlotId: 'all', maestroId: 'all', roomId: 'all' })}
            >
              Limpiar filtros
            </Button>
          </div>
          {selectedDay && selectedTimeSlotId && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border border-blue-200">
                <CardHeader><CardTitle className="text-base text-blue-700">Maestros disponibles</CardTitle></CardHeader>
                <CardContent>
                  {availableMaestros.length === 0 ? <p className="text-sm text-gray-500">Sin disponibilidad</p> : (
                    <div className="flex flex-wrap gap-2">{availableMaestros.map(m => (<Badge key={m.id} variant="outline">{m.nombreCompleto}</Badge>))}</div>
                  )}
                </CardContent>
              </Card>
              <Card className="border border-blue-200">
                <CardHeader><CardTitle className="text-base text-blue-700">Aulas disponibles</CardTitle></CardHeader>
                <CardContent>
                  {availableRooms.length === 0 ? <p className="text-sm text-gray-500">Sin disponibilidad</p> : (
                    <div className="flex flex-wrap gap-2">{availableRooms.map(r => (<Badge key={r.id} variant="outline">{r.name}</Badge>))}</div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && schedules.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando horarios...</p>
        </div>
      ) : schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No hay horarios registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{schedule.dayOfWeekDisplay}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(schedule.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedScheduleId(schedule.id);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{schedule.timeSlotDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{schedule.roomName}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Maestro: </span>
                    <span>{schedule.maestroName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>
                      {schedule.currentCapacity}/{schedule.maxCapacity} alumnos
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{schedule.tipoDeCursoDisplay}</Badge>
                    <Badge variant="outline">{schedule.modalidadDisplay}</Badge>
                  </div>
                  {schedule.alumnos.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs font-medium text-gray-600 mb-1">Alumnos:</p>
                      <div className="flex flex-wrap gap-1">
                        {schedule.alumnos.map((alumno) => (
                          <Badge key={alumno.id} variant="secondary" className="text-xs">
                            {alumno.alumnoName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Crear/Editar */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Horario' : 'Nuevo Horario'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifica los datos del horario' : 'Completa los datos para crear un nuevo horario'}
            </DialogDescription>
          </DialogHeader>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm font-medium text-red-800 mb-1">Errores de validación:</p>
              <ul className="list-disc list-inside text-sm text-red-700">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dayOfWeek">Día de la Semana *</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un día" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOfWeekOptions.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timeSlot">Horario *</Label>
                <Select
                  value={formData.timeSlotId}
                  onValueChange={(value) => setFormData({ ...formData, timeSlotId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un horario" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem
                        key={slot.id}
                        value={slot.id.toString()}
                        disabled={isTimeSlotDisabled(slot.id)}
                      >
                        {slot.displayName}
                        {isTimeSlotDisabled(slot.id) && ' (No disponible viernes/sábado)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="room">Aula *</Label>
              <Select
                value={formData.roomId}
                onValueChange={(value) => setFormData({ ...formData, roomId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un aula" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maestro">Maestro *</Label>
              <Select
                value={formData.maestroId}
                onValueChange={(value) => setFormData({ ...formData, maestroId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un maestro" />
                </SelectTrigger>
                <SelectContent>
                  {maestros.map((maestro) => (
                    <SelectItem key={maestro.id} value={maestro.id.toString()}>
                      {maestro.nombreCompleto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="modalidad">Modalidad *</Label>
                <Select
                  value={formData.modalidad}
                  onValueChange={(value) => setFormData({ ...formData, modalidad: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione modalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {modalidadOptions.map((modalidad) => (
                      <SelectItem key={modalidad.value} value={modalidad.value.toString()}>
                        {modalidad.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipoDeCurso">Tipo de Curso *</Label>
                <Select
                  value={formData.tipoDeCurso}
                  onValueChange={(value) => {
                    const maxCapacity = value === '2' ? 5 : 12;
                    const newAlumnoIds = formData.alumnoIds.slice(0, maxCapacity);
                    setFormData({
                      ...formData,
                      tipoDeCurso: value,
                      alumnoIds: newAlumnoIds,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoCursoOptions.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value.toString()}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>
                Alumnos * (Máximo: {getMaxCapacity()}) - Seleccionados: {formData.alumnoIds.length}
              </Label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto mt-2">
                {alumnos.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay alumnos disponibles</p>
                ) : (
                  <div className="space-y-2">
                    {alumnos.map((alumno) => {
                      const isSelected = formData.alumnoIds.includes(alumno.id);
                      const isDisabled = !isSelected && formData.alumnoIds.length >= getMaxCapacity();
                      return (
                        <div
                          key={alumno.id}
                          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-100 border border-blue-300'
                              : isDisabled
                              ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                          onClick={() => !isDisabled && handleAlumnoToggle(alumno.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => !isDisabled && handleAlumnoToggle(alumno.id)}
                            className="cursor-pointer"
                          />
                          <span className="text-sm">{alumno.nombreCompleto}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Eliminar */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar horario?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar este horario?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteModalOpen(false); setSelectedScheduleId(null); }}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HorariosSection;

