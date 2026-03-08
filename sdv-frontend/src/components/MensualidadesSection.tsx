import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mensualidadApi, alumnosApi } from '@/services/api';
import { X } from 'lucide-react';
import { Calendar, Users } from 'lucide-react';

const MensualidadesSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    estadoPago?: string;
    mes?: string;
    nombre?: string;
  }>({});
  const [filterValues, setFilterValues] = useState({
    estadoPago: '',
    mes: '',
    nombre: ''
  });
  const [paymentData, setPaymentData] = useState({
    fecha: '',
    monto: '',
    concepto: '',
    metodoPago: '',
    observaciones: '',
    alumno: '',
    mes: '',
    mensualidadId: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMensualidad, setSelectedMensualidad] = useState<any>(null);
  const [fecha, setFecha] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const [mensualidadesData, setMensualidadesData] = useState<any[]>([]);
  
  
  const formatCurrency = (value: number) => `$${value.toFixed(0)}`;

  const parseAmount = (value: unknown): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const normalized = value.replace(/[^\d.-]/g, '');
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const normalizeMes = (value: unknown): string | null => {
    if (typeof value === 'number' && value >= 1 && value <= 12) {
      const numericMap: Record<number, string> = {
        1: 'ENE', 2: 'FEB', 3: 'MAR', 4: 'ABR', 5: 'MAY', 6: 'JUN',
        7: 'JUL', 8: 'AGO', 9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DIC'
      };
      return numericMap[value] ?? null;
    }

    if (typeof value === 'string') {
      const upper = value.trim().toUpperCase();
      const aliases: Record<string, string> = {
        ENERO: 'ENE', ENE: 'ENE',
        FEBRERO: 'FEB', FEB: 'FEB',
        MARZO: 'MAR', MAR: 'MAR',
        ABRIL: 'ABR', ABR: 'ABR',
        MAYO: 'MAY', MAY: 'MAY',
        JUNIO: 'JUN', JUN: 'JUN',
        JULIO: 'JUL', JUL: 'JUL',
        AGOSTO: 'AGO', AGO: 'AGO',
        SEPTIEMBRE: 'SEP', SETIEMBRE: 'SEP', SEP: 'SEP',
        OCTUBRE: 'OCT', OCT: 'OCT',
        NOVIEMBRE: 'NOV', NOV: 'NOV',
        DICIEMBRE: 'DIC', DIC: 'DIC'
      };
      return aliases[upper] ?? (meses.includes(upper) ? upper : null);
    }

    return null;
  };

  const normalizeEstado = (value: unknown): 'PAGADO' | 'PENDIENTE' | null => {
    if (typeof value === 'boolean') return value ? 'PAGADO' : 'PENDIENTE';
    if (typeof value !== 'string') return null;

    const upper = value.trim().toUpperCase();
    if (['PAGADO', 'S', 'SI', 'TRUE', 'APLICADO'].includes(upper)) return 'PAGADO';
    if (['PENDIENTE', 'N', 'NO', 'FALSE', 'VENCIDO'].includes(upper)) return 'PENDIENTE';
    return null;
  };

  const mapRows = (rows: any[]): any[] => {
    if (rows.length === 0) return [];

    const alreadyGrouped = rows.some(item => item?.pagos && typeof item.pagos === 'object');
    if (alreadyGrouped) {
      return rows.map((item, index) => {
        const pagos = meses.reduce((acc: Record<string, string | null>, mes) => {
          acc[mes] = normalizeEstado(item?.pagos?.[mes]) ?? item?.pagos?.[mes] ?? null;
          return acc;
        }, {});

        return {
          id: Number(item?.id ?? index + 1),
          nombre: item?.nombre ?? item?.alumnoNombre ?? item?.nombreCompleto ?? 'Sin nombre',
          curso: item?.curso ?? item?.tipoCurso ?? 'Sin curso',
          mensualidad: typeof item?.mensualidad === 'string' ? item.mensualidad : formatCurrency(parseAmount(item?.mensualidad ?? item?.monto ?? 0)),
          pagos,
          fecha: item?.fecha ?? item?.fechaPago ?? '-',
          totalPagado: typeof item?.totalPagado === 'string' ? item.totalPagado : formatCurrency(parseAmount(item?.totalPagado ?? 0)),
          aula: item?.aula ?? '-',
          cargo: item?.cargo ?? 'Estudiante',
          conceptos: item?.conceptos ?? [
            { id: Number(item?.id ?? index + 1) * 10 + 1, nombre: 'Inscripción', estado: 'N' },
            { id: Number(item?.id ?? index + 1) * 10 + 2, nombre: 'Mensualidad', estado: 'N' },
            { id: Number(item?.id ?? index + 1) * 10 + 3, nombre: 'Material', estado: 'N' }
          ],
          registrosPorMes: item?.registrosPorMes ?? {}
        };
      });
    }

    const grouped: Record<string, any> = {};

    rows.forEach((item, index) => {
      const alumnoId = Number(item?.alumnoId ?? item?.idAlumno ?? item?.alumno?.id ?? item?.id ?? index + 1);
      const nombre = item?.nombreCompleto ?? item?.alumnoNombre ?? item?.nombre ?? `Alumno ${alumnoId}`;
      const curso = item?.curso ?? item?.tipoCurso ?? 'Sin curso';
      const key = `${alumnoId}-${curso}`;

      if (!grouped[key]) {
        grouped[key] = {
          id: alumnoId,
          nombre,
          curso,
          mensualidad: formatCurrency(parseAmount(item?.montoMensualidad ?? item?.monto ?? 0)),
          pagos: meses.reduce((acc: Record<string, string | null>, mes) => {
            acc[mes] = null;
            return acc;
          }, {}),
          fecha: item?.fechaPago ?? item?.fecha ?? '-',
          totalPagado: 0,
          aula: item?.aula ?? '-',
          cargo: 'Estudiante',
          conceptos: [
            { id: alumnoId * 10 + 1, nombre: 'Inscripción', estado: 'N' },
            { id: alumnoId * 10 + 2, nombre: 'Mensualidad', estado: 'N' },
            { id: alumnoId * 10 + 3, nombre: 'Material', estado: 'N' }
          ],
          registrosPorMes: {}
        };
      }

      const mes = normalizeMes(item?.mes ?? item?.mesPago ?? item?.nombreMes);
      const estado = normalizeEstado(item?.estadoPago ?? item?.estado ?? item?.estatus);
      if (mes) {
        grouped[key].pagos[mes] = estado;
        if (item?.id) {
          grouped[key].registrosPorMes[mes] = Number(item.id);
        }
      }

      const monto = parseAmount(item?.monto ?? item?.montoPagado ?? 0);
      if (estado === 'PAGADO') {
        grouped[key].totalPagado += monto;
        grouped[key].conceptos = grouped[key].conceptos.map((concepto: any) =>
          concepto.nombre === 'Mensualidad' ? { ...concepto, estado: 'S' } : concepto
        );
      }

      const cuota = parseAmount(item?.montoMensualidad ?? item?.cuota ?? 0);
      if (cuota > 0) {
        grouped[key].mensualidad = formatCurrency(cuota);
      }
    });

    return Object.values(grouped).map((item: any) => ({
      ...item,
      totalPagado: formatCurrency(item.totalPagado)
    }));
  };

  const cursoTypeToLabel: Record<number, string> = {
    1: 'Seminario Doblaje y Locución 1',
    2: 'Seminario Doblaje y Locución 2',
    3: 'Diplomado N4',
    4: 'Diplomado N5',
    5: 'Influencer Kids 1',
    6: 'Influencer Kids 2',
    7: 'Club Masters',
  };

  const loadMensualidades = async () => {
    try {
      setIsLoadingData(true);

      // 1. Cargar alumnos y mensualidades en paralelo
      const [alumnosRes, mensualidadesRaw] = await Promise.all([
        alumnosApi.getAll<any>().catch(() => ({ data: [] })),
        (async () => {
          try {
            const res = await mensualidadApi.getResumen<any>();
            return res.data;
          } catch {
            try {
              const res = await mensualidadApi.getAll<any>();
              return res.data;
            } catch {
              return [];
            }
          }
        })()
      ]);

      // 2. Normalizar lista de alumnos
      const alumnosRaw = alumnosRes.data;
      const alumnosList: any[] = Array.isArray(alumnosRaw)
        ? alumnosRaw
        : Array.isArray(alumnosRaw?.data)
          ? alumnosRaw.data
          : Array.isArray(alumnosRaw?.items)
            ? alumnosRaw.items
            : [];

      // 3. Normalizar lista de mensualidades
      const mensualidadesList: any[] = Array.isArray(mensualidadesRaw)
        ? mensualidadesRaw
        : Array.isArray(mensualidadesRaw?.data)
          ? mensualidadesRaw.data
          : Array.isArray(mensualidadesRaw?.items)
            ? mensualidadesRaw.items
            : [];

      // 4. Si hay datos de mensualidades agrupados, mapear normalmente y mezclar con alumnos sin pagos
      const mensualidadesRows = mapRows(mensualidadesList);

      // 4b. Construir mapa de alumno para enriquecer curso si el endpoint de mensualidades no lo trae
      const alumnosMap: Record<number, any> = {};
      alumnosList.forEach((a: any) => {
        const aId = Number(a?.id ?? a?.Id ?? 0);
        if (aId > 0) alumnosMap[aId] = a;
      });

      const mensualidadesEnriquecidas = mensualidadesRows.map((row: any) => {
        if (row.curso && row.curso !== 'Sin curso') return row;
        const alumno = alumnosMap[row.id];
        if (!alumno) return row;
        const tipoCurso = alumno?.tipoDeCurso ?? alumno?.TipoDeCurso;
        const curso = typeof tipoCurso === 'number'
          ? (cursoTypeToLabel[tipoCurso] ?? 'Sin curso')
          : (alumno?.curso ?? 'Sin curso');
        return { ...row, curso };
      });

      // 5. Crear un set de IDs de alumnos que ya tienen mensualidades
      const alumnosConPagos = new Set(mensualidadesEnriquecidas.map((r: any) => r.id));

      // 6. Agregar alumnos que no tienen ningún registro de mensualidad
      const alumnosSinPagos = alumnosList
        .filter((a: any) => {
          const aId = Number(a?.id ?? a?.Id ?? 0);
          return aId > 0 && !alumnosConPagos.has(aId);
        })
        .map((a: any) => {
          const aId = Number(a?.id ?? a?.Id ?? 0);
          const nombre = a?.nombreCompleto ?? a?.NombreCompleto ?? a?.nombre ?? `Alumno ${aId}`;
          const tipoCurso = a?.tipoDeCurso ?? a?.TipoDeCurso;
          const curso = typeof tipoCurso === 'number'
            ? (cursoTypeToLabel[tipoCurso] ?? 'Sin curso')
            : (a?.curso ?? 'Sin curso');

          return {
            id: aId,
            nombre,
            curso,
            mensualidad: '$0',
            pagos: meses.reduce((acc: Record<string, string | null>, mes) => {
              acc[mes] = null;
              return acc;
            }, {}),
            fecha: '-',
            totalPagado: '$0',
            aula: '-',
            cargo: 'Estudiante',
            conceptos: [
              { id: aId * 10 + 1, nombre: 'Inscripción', estado: 'N' },
              { id: aId * 10 + 2, nombre: 'Mensualidad', estado: 'N' },
              { id: aId * 10 + 3, nombre: 'Material', estado: 'N' }
            ],
            registrosPorMes: {}
          };
        });

      setMensualidadesData([...mensualidadesEnriquecidas, ...alumnosSinPagos]);
    } catch (error) {
      console.error('Error al cargar mensualidades:', error);
      setMensualidadesData([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    setFecha(formatted);
    loadMensualidades();
  }, []);

  const handleStudentSelect = (id: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedStudents(prev => [...prev, id]);
    } else {
      setSelectedStudents(prev => prev.filter(studentId => studentId !== id));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedStudents(filteredMensualidades.map(mensualidad => mensualidad.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleRegisterPayment = () => {
    if (selectedStudents.length === 1) {
      const selectedStudent = mensualidadesData.find(m => m.id === selectedStudents[0]);
      if (selectedStudent) {
        const primerMesPendiente = meses.find(mes => selectedStudent.pagos[mes] === null);
        setPaymentData(prev => ({
          ...prev,
          alumno: selectedStudent.id.toString(),
          monto: typeof selectedStudent.mensualidad === 'string'
            ? selectedStudent.mensualidad.replace('$', '').replace(',', '')
            : String(selectedStudent.mensualidad ?? '0'),
          mes: primerMesPendiente || '',
          mensualidadId: ''
        }));
      }
    } else {
      setPaymentData({
        fecha: '',
        monto: '',
        concepto: '',
        metodoPago: '',
        observaciones: '',
        alumno: '',
        mes: '',
        mensualidadId: ''
      });
    }
    setIsEditing(false);
    setIsPaymentModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedStudents.length === 1) {
      const selectedStudent = mensualidadesData.find(m => m.id === selectedStudents[0]);
      if (selectedStudent) {
        // Encontrar el primer mes pagado para editar
        const primerMesPagado = meses.find(mes => selectedStudent.pagos[mes] === 'PAGADO');
        
        setPaymentData(prev => ({
          ...prev,
          alumno: selectedStudent.id.toString(),
          monto: typeof selectedStudent.mensualidad === 'string'
            ? selectedStudent.mensualidad.replace('$', '').replace(',', '')
            : String(selectedStudent.mensualidad ?? '0'),
          mes: primerMesPagado || '',
          concepto: 'Mensualidad',
          metodoPago: 'Efectivo',
          mensualidadId: primerMesPagado ? String(selectedStudent.registrosPorMes?.[primerMesPagado] ?? '') : ''
        }));
        setIsEditing(true);
        setIsPaymentModalOpen(true);
      }
    }
  };

  const handleSavePayment = async () => {
    try {
      // Normalizar fecha a YYYY-MM-DD independientemente del input
      const rawFecha = paymentData.fecha;
      let fechaNormalizada = rawFecha;
      if (rawFecha && !rawFecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parsed = new Date(rawFecha);
        if (!isNaN(parsed.getTime())) {
          fechaNormalizada = parsed.toISOString().slice(0, 10);
        }
      }

      const payload = {
        alumnoId: Number(paymentData.alumno),
        fechaPago: fechaNormalizada,
        monto: Number(paymentData.monto),
        concepto: paymentData.concepto || 'Mensualidad',
        metodoPago: paymentData.metodoPago || 'Efectivo',
        observaciones: paymentData.observaciones,
        mes: paymentData.mes,
        estadoPago: 'PAGADO'
      };

      if (isEditing && paymentData.mensualidadId) {
        await mensualidadApi.update(Number(paymentData.mensualidadId), payload);
      } else {
        await mensualidadApi.create(payload);
      }

      await loadMensualidades();
      setIsPaymentModalOpen(false);
      setPaymentData({
        fecha: '',
        monto: '',
        concepto: '',
        metodoPago: '',
        observaciones: '',
        alumno: '',
        mes: '',
        mensualidadId: ''
      });
      setSelectedStudents([]);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar pago:', error);
      alert('No se pudo guardar el pago. Revisa que el backend esté disponible y los datos sean válidos.');
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
    // Eliminar filtros vacíos
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
      estadoPago: '',
      mes: '',
      nombre: ''
    });
    setSearchTerm('');
  };

  const filteredMensualidades = mensualidadesData.filter(mensualidad => {
    // Búsqueda rápida por nombre (barra del header)
    if (
      searchTerm.trim() &&
      !mensualidad.nombre.toLowerCase().includes(searchTerm.trim().toLowerCase())
    ) {
      return false;
    }

    // Si no hay filtros activos, mostrar todos los alumnos
    if (Object.keys(activeFilters).length === 0) {
      return true;
    }

    // Aplicar filtros del modal
    return Object.entries(activeFilters).every(([key, value]) => {
      switch (key) {
        case 'nombre':
          return mensualidad.nombre.toLowerCase().includes((value as string).trim().toLowerCase());
        case 'estadoPago':
          if (value === 'PAGADO') {
            return Object.values(mensualidad.pagos).some(pago => pago === 'PAGADO');
          } else if (value === 'PENDIENTE') {
            return Object.values(mensualidad.pagos).some(pago => pago === 'PENDIENTE');
          }
          return true;
        case 'mes':
          return mensualidad.pagos[value] !== undefined;
        default:
          return true;
      }
    });
  });

  const handleSaveMensualidad = () => {
    // Aquí iría la lógica para guardar la mensualidad
    console.log('Guardando mensualidad:', selectedMensualidad);
    setIsModalOpen(false);
    setSelectedMensualidad(null);
  };

  const openPrintWindow = () => {
    // Aquí iría la lógica para abrir la ventana de impresión
    console.log('Imprimiendo lista de mensualidades');
  };

  const handleEstadoChange = (conceptoId, estado) => {
    // Placeholder function, might be removed or repurposed
    console.log(`Concepto ${conceptoId} estado cambiado a ${estado} (placeholder)`);
  };

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return '?';
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  };

  return (
    <div className="p-4 lg:p-6 bg-[#f8fafc] min-h-screen w-full">
      <div className="max-w-full mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Gestión de Mensualidades</h2>
              <p className="text-base text-gray-600">Registro y control de pagos mensuales</p>
        </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-base text-gray-500">Fecha</p>
                <p className="text-2xl font-bold text-blue-600">{fecha}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>
      </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg py-4 md:py-6">
            <CardTitle className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-2">
              <div className="flex items-center space-x-3 md:space-x-4">
                <Users className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-base lg:text-xl">Control de Mensualidades</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
                <Input
                  placeholder="Buscar alumno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-full sm:max-w-xs text-sm md:text-base"
                />
                 <Button
                  size="sm"
                  className="bg-green-700 hover:bg-green-800 text-sm"
                  onClick={handleRegisterPayment}
                >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">REGISTRAR</span>
              </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-sm"
                  onClick={handleEdit}
                  disabled={selectedStudents.length !== 1}
                >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span className="text-sm font-medium">EDITAR</span>
              </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-600 text-sm"
                  onClick={() => setIsFilterModalOpen(true)}
                >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                FILTRAR
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <div className="p-3 bg-gray-50 border-b">
              <div className="flex flex-col space-y-3">
                {/* Filtros activos */}
                {Object.keys(activeFilters).length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-gray-600">Filtros activos:</span>
                    {Object.entries(activeFilters).map(([key, value]) => (
                      <Badge
                        key={key}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-0.5 text-xs"
                      >
                        <span className="capitalize">
                          {key === 'estadoPago' ? 'Estado: ' : key === 'mes' ? 'Mes: ' : 'Nombre: '}
                          {value}
                        </span>
                        <button
                          onClick={() => {
                            const newFilters = { ...activeFilters };
                            delete newFilters[key as keyof typeof activeFilters];
                            setActiveFilters(newFilters);
                            setFilterValues(prev => ({
                              ...prev,
                              [key]: ''
                            }));
                          }}
                          className="ml-1 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs text-gray-600 hover:text-gray-900"
                    >
                      Limpiar todos
              </Button>
                  </div>
                )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
              <div className="relative">
                <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full">
                    <thead className="bg-blue-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedStudents.length === filteredMensualidades.length && filteredMensualidades.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                  </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Nombre completo</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Curso</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Mensualidad</th>
                  {meses.map(mes => (
                          <th key={mes} className="px-2 py-2 text-center text-xs font-medium text-gray-700">{mes}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                      {isLoadingData && (
                        <tr>
                          <td colSpan={16} className="px-3 py-6 text-center text-sm text-gray-500">
                            Cargando mensualidades...
                          </td>
                        </tr>
                      )}
                      {!isLoadingData && filteredMensualidades.length === 0 && (
                        <tr>
                          <td colSpan={16} className="px-3 py-6 text-center text-sm text-gray-500">
                            No hay mensualidades para mostrar.
                          </td>
                        </tr>
                      )}
                      {filteredMensualidades.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={selectedStudents.includes(item.id)}
                              onChange={(e) => handleStudentSelect(item.id, e.target.checked)}
                            />
                    </td>
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                {getInitials(item.nombre)}
                              </div>
                              {item.nombre}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-700">
                            <Badge variant={item.curso.includes('Diplomado') || item.curso.includes('Club') ? 'default' : 'secondary'} className="text-sm">
                        {item.curso}
                      </Badge>
                    </td>
                          <td className="px-3 py-2 text-sm font-semibold text-gray-900">{item.mensualidad}</td>
                    {meses.map(mes => (
                            <td key={mes} className="px-2 py-2 text-center">
                        {item.pagos?.[mes] === 'PAGADO' && (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white text-sm">
                            PAGADO
                          </Badge>
                        )}
                        {item.pagos?.[mes] === 'PENDIENTE' && (
                          <Badge variant="destructive" className="text-sm">
                            PENDIENTE
                          </Badge>
                        )}
                        {(!item.pagos || item.pagos?.[mes] === null || item.pagos?.[mes] === undefined) && item.pagos?.[mes] !== 'PAGADO' && item.pagos?.[mes] !== 'PENDIENTE' && (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
                </div>
              </div>
          </div>
        </CardContent>
      </Card>

        {/* Modal de registro/edición de pago */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="sm:max-w-[600px] p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">
                {isEditing ? 'Editar Pago' : 'Registrar Pago'}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                {isEditing ? 'Edite el pago del alumno seleccionado' : 'Registre el pago para el alumno seleccionado'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha de pago</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={paymentData.fecha}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, fecha: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto</Label>
                  <Input
                    id="monto"
                    type="number"
                    value={paymentData.monto}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, monto: e.target.value }))}
                    placeholder="Ingrese el monto"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="concepto">Concepto</Label>
                  <Select
                    value={paymentData.concepto || undefined}
                    onValueChange={(value) => setPaymentData(prev => ({ ...prev, concepto: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el concepto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inscripcion">Inscripción</SelectItem>
                      <SelectItem value="Mensualidad">Mensualidad</SelectItem>
                      <SelectItem value="Material">Material</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mes">Mes a pagar</Label>
                  <Select
                    value={paymentData.mes || undefined}
                    onValueChange={(value) => setPaymentData(prev => ({ ...prev, mes: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map(mes => (
                        <SelectItem key={mes} value={mes}>
                          {mes}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metodoPago">Método de pago</Label>
                <Select
                  value={paymentData.metodoPago || undefined}
                  onValueChange={(value) => setPaymentData(prev => ({ ...prev, metodoPago: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Input
                  id="observaciones"
                  value={paymentData.observaciones}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Ingrese observaciones adicionales"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setPaymentData({
                    fecha: '',
                    monto: '',
                    concepto: '',
                    metodoPago: '',
                    observaciones: '',
                    alumno: '',
                    mes: '',
                    mensualidadId: ''
                  });
                  setIsEditing(false);
                }}
                className="border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePayment}
                className="bg-green-500 hover:bg-green-600"
              >
                {isEditing ? 'Guardar Cambios' : 'Registrar Pago'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de filtros */}
        <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">Filtrar Mensualidades</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Seleccione los criterios de filtrado para los pagos
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del alumno</Label>
                <Input
                  id="nombre"
                  value={filterValues.nombre}
                  onChange={(e) => handleFilterChange('nombre', e.target.value)}
                  placeholder="Buscar por nombre..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estadoPago">Estado del Pago</Label>
                <Select
                  value={filterValues.estadoPago || undefined}
                  onValueChange={(value) => handleFilterChange('estadoPago', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAGADO">Pagado</SelectItem>
                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mes">Mes</Label>
                <Select
                  value={filterValues.mes || undefined}
                  onValueChange={(value) => handleFilterChange('mes', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map(mes => (
                      <SelectItem key={mes} value={mes}>
                        {mes}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row justify-between gap-4">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="border-gray-300 hover:bg-gray-100"
              >
                Limpiar filtros
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={applyFilters}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Aplicar filtros
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de mensualidad */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">
                Registrar Mensualidad
              </DialogTitle>
            </DialogHeader>
            {selectedMensualidad && (
              <div className="mt-6">
                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-900 text-lg">{selectedMensualidad.curso}</h3>
                    <Badge variant="secondary" className="text-sm">
                      {selectedMensualidad.fecha}
                    </Badge>
                  </div>
                  <div className="text-base text-blue-700">
                    <p>Alumno: {selectedMensualidad.nombre}</p>
                    <p>Aula: {selectedMensualidad.aula}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-base">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-3 text-left">Concepto</th>
                        <th className="border p-3 text-center">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMensualidad.conceptos.map((concepto) => (
                        <tr key={concepto.id} className="hover:bg-gray-50">
                          <td className="border p-3">{concepto.nombre}</td>
                          <td className="border p-3 text-center">
                            <div className="flex flex-wrap justify-center gap-3">
                              {(['S', 'N', 'J'] as const).map((tipo) => (
                                <Button
                                  key={tipo}
                                  size="lg"
                                  variant="outline"
                                  className={`h-10 px-6 text-lg font-bold border-2
                                    ${concepto.estado === tipo ?
                                      tipo === 'S' ? 'border-green-500 bg-green-100 text-green-700' :
                                      tipo === 'N' ? 'border-red-500 bg-red-100 text-red-700' :
                                      'border-yellow-500 bg-yellow-100 text-yellow-700'
                                    : 'border-gray-300'}
                                  `}
                                  onClick={() => handleEstadoChange(concepto.id, tipo)}
                                >
                                  {tipo}
                                </Button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <DialogFooter className="mt-8 flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="border-gray-300 hover:bg-gray-100 text-lg px-6 h-10"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveMensualidad}
                    className="bg-green-500 hover:bg-green-600 text-lg px-6 h-10"
                  >
                    Guardar Mensualidad
                  </Button>
                  <Button
                    onClick={openPrintWindow}
                    className="bg-blue-500 hover:bg-blue-600 text-lg px-6 h-10"
                  >
                    Imprimir lista
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MensualidadesSection;
