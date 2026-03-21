import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, History, Search, Users, Calendar } from 'lucide-react';
import { horariosApi, asistenciaApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ClassSchedule {
  id: number;
  roomName: string;
  timeSlotDisplay: string;
  maestroName: string;
  dayOfWeekDisplay: string;
  tipoDeCursoDisplay: string;
  modalidadDisplay: string;
  currentCapacity: number;
  maxCapacity: number;
}

interface AlumnoInscrito {
  id?: number;
  alumnoId?: number;
  nombre?: string;
  alumnoNombre?: string;
  nombreCompleto?: string;
  alumnoName?: string;
}

const getAlumnoId = (a: AlumnoInscrito): number => a.id ?? a.alumnoId ?? 0;
const getAlumnoNombre = (a: AlumnoInscrito): string =>
  a.nombre ?? a.alumnoNombre ?? a.nombreCompleto ?? a.alumnoName ?? '—';

interface HistorialItem {
  Fecha?: string;
  fecha?: string;
  alumnoId?: number;
  nombreAlumno?: string;
  estadoCodigo?: string;
  estado?: string;
}

const getHistorialNombre = (item: HistorialItem): string =>
  item.nombreAlumno ?? '—';

const formatFecha = (raw: string | undefined): string => {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const estadoBadge = (codigo: string | undefined) => {
  if (codigo === 'S') return <Badge className="bg-green-100 text-green-700 border-green-200">Asistió</Badge>;
  if (codigo === 'N') return <Badge className="bg-red-100 text-red-700 border-red-200">Faltó</Badge>;
  if (codigo === 'J') return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Justificado</Badge>;
  return <Badge className="bg-gray-100 text-gray-500 border-gray-200">Sin registro</Badge>;
};

const AsistenciasSection = () => {
  const { toast } = useToast();

  const [clases, setClases] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDia, setSelectedDia] = useState('all');

  const [isRegistrarOpen, setIsRegistrarOpen] = useState(false);
  const [selectedClaseId, setSelectedClaseId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [alumnos, setAlumnos] = useState<AlumnoInscrito[]>([]);
  const [asistencias, setAsistencias] = useState<Record<number, 'S' | 'N' | 'J' | null>>({});
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isHistorialOpen, setIsHistorialOpen] = useState(false);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const [isPorFechaOpen, setIsPorFechaOpen] = useState(false);
  const [fechaConsulta, setFechaConsulta] = useState(new Date().toISOString().split('T')[0]);
  const [asistenciaPorFecha, setAsistenciaPorFecha] = useState<HistorialItem[]>([]);
  const [loadingPorFecha, setLoadingPorFecha] = useState(false);
  const [savingRow, setSavingRow] = useState<number | null>(null);

  useEffect(() => {
    loadClases();
  }, []);

  const loadClases = async () => {
    try {
      const response = await horariosApi.getAll<ClassSchedule[]>();
      setClases(response.data);
    } catch (error) {
      console.error('Error loading clases:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar las clases.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRegistrar = async (claseId: number) => {
    setSelectedClaseId(claseId);
    setIsRegistrarOpen(true);
    setLoadingAlumnos(true);
    try {
      const response = await asistenciaApi.getAlumnosByClase<AlumnoInscrito[]>(claseId);
      setAlumnos(response.data);
      const init: Record<number, 'S' | 'N' | 'J' | null> = {};
      response.data.forEach(a => { init[getAlumnoId(a)] = null; });
      setAsistencias(init);
    } catch (error) {
      console.error('Error loading alumnos:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los alumnos.', variant: 'destructive' });
    } finally {
      setLoadingAlumnos(false);
    }
  };

  const handleOpenHistorial = async (claseId: number) => {
    setSelectedClaseId(claseId);
    setIsHistorialOpen(true);
    setLoadingHistorial(true);
    try {
      const response = await asistenciaApi.getHistorial<HistorialItem[] | HistorialItem>(claseId);
      const data = response.data;
      setHistorial(Array.isArray(data) ? data : data ? [data] : []);
    } catch (error) {
      console.error('Error loading historial:', error);
      toast({ title: 'Error', description: 'No se pudo cargar el historial.', variant: 'destructive' });
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleOpenPorFecha = (claseId: number) => {
    setSelectedClaseId(claseId);
    setAsistenciaPorFecha([]);
    setFechaConsulta(new Date().toISOString().split('T')[0]);
    setIsPorFechaOpen(true);
  };

  const fetchPorFecha = async (claseId: number, date: string) => {
    setLoadingPorFecha(true);
    try {
      // Get attendance records for this date
      const historialRes = await asistenciaApi.getHistorial<HistorialItem[] | HistorialItem>(claseId);
      const all = Array.isArray(historialRes.data) ? historialRes.data : historialRes.data ? [historialRes.data] : [];
      const registered = all.filter(item => {
        const itemDate = (item.Fecha ?? item.fecha ?? '').split('T')[0];
        return itemDate === date;
      });

      // Get all enrolled students and merge — show everyone, with or without a record
      const alumnosRes = await asistenciaApi.getAlumnosByClase<AlumnoInscrito[]>(claseId);
      const todosAlumnos = Array.isArray(alumnosRes.data) ? alumnosRes.data : [];
      const registeredIds = new Set(registered.map(r => r.alumnoId));

      const sinRegistro: HistorialItem[] = todosAlumnos
        .filter(a => !registeredIds.has(getAlumnoId(a)))
        .map(a => ({
          alumnoId: getAlumnoId(a),
          nombreAlumno: getAlumnoNombre(a),
          estadoCodigo: undefined,
          Fecha: date,
        }));

      setAsistenciaPorFecha([...registered, ...sinRegistro]);
    } catch (error) {
      console.error('Error loading asistencia por fecha:', error);
      toast({ title: 'Error', description: 'No se pudo cargar la asistencia para esa fecha.', variant: 'destructive' });
    } finally {
      setLoadingPorFecha(false);
    }
  };

  const handleAsistenciaChange = (alumnoId: number, estado: 'S' | 'N' | 'J') => {
    setAsistencias(prev => ({
      ...prev,
      [alumnoId]: prev[alumnoId] === estado ? null : estado,
    }));
  };

  const pendienteCount = alumnos.filter(a => !asistencias[getAlumnoId(a)]).length;

  const handleSaveAsistencia = async () => {
    if (!selectedClaseId) return;
    setSaving(true);
    try {
      if (pendienteCount > 0) {
        toast({ title: 'Atención', description: `Faltan ${pendienteCount} alumno(s) por marcar.`, variant: 'destructive' });
        setSaving(false);
        return;
      }
      const statusMap: Record<string, number> = { S: 1, N: 2, J: 3 };
      await asistenciaApi.registrar({
        classScheduleId: selectedClaseId,
        fecha,
        asistencias: Object.entries(asistencias)
          .filter(([, estado]) => estado !== null)
          .map(([alumnoId, estado]) => ({
            alumnoId: parseInt(alumnoId),
            status: statusMap[estado as string],
          })),
      });
      toast({ title: 'Éxito', description: 'Asistencia registrada correctamente.' });
      setIsRegistrarOpen(false);
    } catch (error) {
      console.error('Error saving asistencia:', error);
      toast({ title: 'Error', description: 'No se pudo guardar la asistencia.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEstado = async (item: HistorialItem, nuevoEstado: 'S' | 'N' | 'J') => {
    if (!selectedClaseId || !item.alumnoId || item.estadoCodigo === nuevoEstado) return;
    const statusMap: Record<string, number> = { S: 1, N: 2, J: 3 };
    setSavingRow(item.alumnoId);
    try {
      await asistenciaApi.registrar({
        classScheduleId: selectedClaseId,
        fecha: fechaConsulta,
        asistencias: [{ alumnoId: item.alumnoId, status: statusMap[nuevoEstado] }],
      });
      setAsistenciaPorFecha(prev =>
        prev.map(r => r.alumnoId === item.alumnoId ? { ...r, estadoCodigo: nuevoEstado } : r)
      );
      toast({ title: 'Actualizado', description: `Estado de ${item.nombreAlumno} cambiado a ${nuevoEstado === 'S' ? 'Asistió' : nuevoEstado === 'N' ? 'Faltó' : 'Justificado'}.` });
    } catch (error) {
      console.error('Error updating estado:', error);
      toast({ title: 'Error', description: 'No se pudo actualizar el estado.', variant: 'destructive' });
    } finally {
      setSavingRow(null);
    }
  };

  const filteredClases = clases.filter(clase => {
    const matchesSearch =
      searchTerm === '' ||
      clase.tipoDeCursoDisplay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clase.maestroName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clase.roomName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDia = selectedDia === 'all' || clase.dayOfWeekDisplay === selectedDia;
    return matchesSearch && matchesDia;
  });

  const selectedClase = clases.find(c => c.id === selectedClaseId);

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Control de Asistencias</h2>
              <p className="text-gray-600 mt-1">Administrador</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="text-center sm:text-right">
                <p className="text-sm text-gray-500">Total de Clases</p>
                <p className="text-2xl font-bold text-blue-600">{clases.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg p-3 sm:p-6">
            <CardTitle className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex items-center space-x-3 justify-center lg:justify-start">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-lg sm:text-xl">Gestión de Asistencias</span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="p-3 sm:p-6 bg-gray-50 border-b">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-full sm:max-w-sm">
                  <Input
                    placeholder="Buscar curso, maestro o aula..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <Select value={selectedDia} onValueChange={setSelectedDia}>
                  <SelectTrigger className="w-full sm:w-48 rounded-xl border-gray-300">
                    <SelectValue placeholder="Todos los días" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los días</SelectItem>
                    {diasSemana.map(dia => (
                      <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                      <th className="px-4 py-3 text-left">Curso</th>
                      <th className="px-4 py-3 text-left">Maestro</th>
                      <th className="px-4 py-3 text-left">Día</th>
                      <th className="px-4 py-3 text-left">Horario</th>
                      <th className="px-4 py-3 text-left">Aula</th>
                      <th className="px-4 py-3 text-left">Alumnos</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClases.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-gray-500">
                          <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          No se encontraron clases
                        </td>
                      </tr>
                    ) : (
                      filteredClases.map((clase, index) => (
                        <tr
                          key={clase.id}
                          className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}
                        >
                          <td className="px-4 py-3 font-medium text-gray-800">{clase.tipoDeCursoDisplay}</td>
                          <td className="px-4 py-3 text-gray-600">{clase.maestroName}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                              {clase.dayOfWeekDisplay}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{clase.timeSlotDisplay}</td>
                          <td className="px-4 py-3 text-gray-600">{clase.roomName}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {clase.currentCapacity}/{clase.maxCapacity}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2 flex-wrap">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                onClick={() => handleOpenRegistrar(clase.id)}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Tomar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-300 text-blue-600 hover:bg-blue-50 text-xs"
                                onClick={() => handleOpenHistorial(clase.id)}
                              >
                                <History className="w-3 h-3 mr-1" />
                                Historial
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-purple-300 text-purple-600 hover:bg-purple-50 text-xs"
                                onClick={() => handleOpenPorFecha(clase.id)}
                              >
                                <Calendar className="w-3 h-3 mr-1" />
                                Por Fecha
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal: Tomar Asistencia */}
      <Dialog open={isRegistrarOpen} onOpenChange={setIsRegistrarOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Tomar Asistencia
            </DialogTitle>
            <DialogDescription className="sr-only">Registra la asistencia de los alumnos para esta clase.</DialogDescription>
          </DialogHeader>

          {selectedClase && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-3 text-sm grid grid-cols-2 gap-2 border border-blue-100">
                <div><span className="text-gray-500">Curso:</span> <span className="font-medium">{selectedClase.tipoDeCursoDisplay}</span></div>
                <div><span className="text-gray-500">Maestro:</span> <span className="font-medium">{selectedClase.maestroName}</span></div>
                <div><span className="text-gray-500">Día:</span> <span className="font-medium">{selectedClase.dayOfWeekDisplay}</span></div>
                <div><span className="text-gray-500">Horario:</span> <span className="font-medium">{selectedClase.timeSlotDisplay}</span></div>
              </div>

              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium text-gray-700">Fecha:</Label>
                <Input
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  className="w-44 rounded-lg border-gray-300"
                />
              </div>

              {loadingAlumnos ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                </div>
              ) : alumnos.length === 0 ? (
                <p className="text-center text-gray-500 py-6 text-sm">No hay alumnos inscritos en esta clase.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  <div className="flex justify-between text-xs text-gray-400 px-2 pb-1 border-b">
                    <span>Alumno</span>
                    <div className="flex items-center gap-3">
                      {pendienteCount > 0 && (
                        <span className="text-orange-500 font-medium">{pendienteCount} sin marcar</span>
                      )}
                      <span>S = Sí &nbsp;|&nbsp; N = No &nbsp;|&nbsp; J = Justificado</span>
                    </div>
                  </div>
                  {alumnos.map(alumno => {
                    const aId = getAlumnoId(alumno);
                    return (
                    <div
                      key={aId}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 border transition-colors ${
                        asistencias[aId] === null || asistencias[aId] === undefined
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[55%]">{getAlumnoNombre(alumno)}</span>
                      <div className="flex gap-1">
                        {(['S', 'N', 'J'] as const).map(estado => (
                          <button
                            key={estado}
                            type="button"
                            onClick={() => handleAsistenciaChange(aId, estado)}
                            className={`w-9 h-9 rounded-full text-xs font-bold border-2 transition-all ${
                              asistencias[aId] === estado
                                ? estado === 'S'
                                  ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                  : estado === 'N'
                                  ? 'bg-red-500 border-red-500 text-white shadow-sm'
                                  : 'bg-yellow-400 border-yellow-400 text-white shadow-sm'
                                : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
                            }`}
                          >
                            {estado}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setIsRegistrarOpen(false)}>Cancelar</Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSaveAsistencia}
              disabled={saving || alumnos.length === 0 || pendienteCount > 0}
            >
              {saving ? 'Guardando...' : 'Guardar Asistencia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Historial */}
      <Dialog open={isHistorialOpen} onOpenChange={setIsHistorialOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <History className="w-5 h-5 text-blue-600" />
              Historial — {selectedClase?.tipoDeCursoDisplay}
            </DialogTitle>
            <DialogDescription className="sr-only">Historial completo de asistencias de la clase.</DialogDescription>
          </DialogHeader>

          {loadingHistorial ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
            </div>
          ) : historial.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-sm">No hay registros de asistencia para esta clase.</p>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr className="text-gray-600 uppercase text-xs">
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Alumno</th>
                    <th className="px-3 py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-gray-600">{formatFecha(item.Fecha ?? item.fecha)}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{getHistorialNombre(item)}</td>
                      <td className="px-3 py-2 text-center">{estadoBadge(item.estadoCodigo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistorialOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Por Fecha */}
      <Dialog open={isPorFechaOpen} onOpenChange={setIsPorFechaOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <Calendar className="w-5 h-5 text-purple-600" />
              Asistencia por Fecha — {selectedClase?.tipoDeCursoDisplay}
            </DialogTitle>
            <DialogDescription className="sr-only">Consulta y edita la asistencia de los alumnos por fecha.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 mb-4">
            <Label className="text-sm font-medium text-gray-700">Fecha:</Label>
            <Input
              type="date"
              value={fechaConsulta}
              onChange={e => setFechaConsulta(e.target.value)}
              className="w-44 rounded-lg border-gray-300"
            />
            <Button
              size="sm"
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
              onClick={() => selectedClaseId && fetchPorFecha(selectedClaseId, fechaConsulta)}
            >
              Buscar
            </Button>
          </div>

          {loadingPorFecha ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-purple-600" />
            </div>
          ) : asistenciaPorFecha.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">No hay registros para esta fecha. Selecciona una fecha y presiona Buscar.</p>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr className="text-gray-600 uppercase text-xs">
                    <th className="px-3 py-2 text-left">Alumno</th>
                    <th className="px-3 py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {asistenciaPorFecha.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 font-medium text-gray-800">{getHistorialNombre(item)}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          {savingRow === item.alumnoId ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
                          ) : (['S', 'N', 'J'] as const).map(estado => (
                            <button
                              key={estado}
                              type="button"
                              onClick={() => handleUpdateEstado(item, estado)}
                              className={`w-9 h-9 rounded-full text-xs font-bold border-2 transition-all ${
                                item.estadoCodigo === estado
                                  ? estado === 'S'
                                    ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                    : estado === 'N'
                                    ? 'bg-red-500 border-red-500 text-white shadow-sm'
                                    : 'bg-yellow-400 border-yellow-400 text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
                              }`}
                            >
                              {estado}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPorFechaOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AsistenciasSection;
