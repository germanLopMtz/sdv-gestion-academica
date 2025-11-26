import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Calendar, Users, MapPin, Clock } from 'lucide-react';
import { mensualidadesApi, type MensualidadResumenDTO, type MensualidadDTO } from '@/services/mensualidadesService';
import { alumnosApi } from '@/services/api';

const MensualidadesSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    estadoPago?: string;
    mes?: string;
  }>({});
  const [filterValues, setFilterValues] = useState({
    estadoPago: '',
    mes: ''
  });
  const [paymentData, setPaymentData] = useState({
    fecha: '',
    monto: '',
    concepto: '',
    metodoPago: '',
    observaciones: '',
    alumno: '',
    mes: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMensualidad, setSelectedMensualidad] = useState<any>(null);
  const [fecha, setFecha] = useState('');
  const [mensualidades, setMensualidades] = useState<MensualidadResumenDTO[]>([]);
  const [alumnos, setAlumnos] = useState<Array<{ id: number; nombre: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMensualidadId, setCurrentMensualidadId] = useState<number | null>(null);
  
  // Mapeo de meses
  const meses = ['AGO', 'SEP', 'OCT', 'NOV', 'DIC', 'ENE', 'FEB'];
  const mesToNumber: Record<string, number> = {
    'AGO': 1, 'SEP': 2, 'OCT': 3, 'NOV': 4, 'DIC': 5, 'ENE': 6, 'FEB': 7
  };
  const numberToMes: Record<number, string> = {
    1: 'AGO', 2: 'SEP', 3: 'OCT', 4: 'NOV', 5: 'DIC', 6: 'ENE', 7: 'FEB'
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    setFecha(formattedDate);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const añoActual = new Date().getFullYear();
      
      // Cargar resumen de mensualidades
      const resumenResponse = await mensualidadesApi.getResumen(añoActual);
      setMensualidades(resumenResponse.data);

      // Cargar alumnos para el selector
      const alumnosResponse = await alumnosApi.getAll();
      const alumnosData = (alumnosResponse.data as any[]).map((alumno: any) => ({
        id: alumno.id,
        nombre: alumno.nombreCompleto
      }));
      setAlumnos(alumnosData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los datos');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Datos mock eliminados - ahora se cargan del backend

  const handleStudentSelect = (id: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedStudents(prev => [...prev, id]);
    } else {
      setSelectedStudents(prev => prev.filter(studentId => studentId !== id));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedStudents(filteredMensualidades.map(mensualidad => mensualidad.alumnoId));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleRegisterPayment = () => {
    if (selectedStudents.length === 1) {
      const selectedStudent = mensualidades.find(m => m.alumnoId === selectedStudents[0]);
      if (selectedStudent) {
        // Encontrar el primer mes pendiente
        const primerMesPendiente = meses.find(mes => selectedStudent.pagosPorMes[mes] === null);
        
        setPaymentData(prev => ({
          ...prev,
          alumno: selectedStudent.alumnoId.toString(),
          monto: selectedStudent.montoMensualidad.toString(),
          mes: primerMesPendiente || ''
        }));
        setIsPaymentModalOpen(true);
      }
    }
  };

  const handleEdit = async () => {
    if (selectedStudents.length === 1) {
      const selectedStudent = mensualidades.find(m => m.alumnoId === selectedStudents[0]);
      if (selectedStudent) {
        // Buscar la primera mensualidad pagada del alumno
        const añoActual = new Date().getFullYear();
        try {
          const mensualidadesAlumno = await mensualidadesApi.getByAlumno(selectedStudent.alumnoId, añoActual);
          const mensualidadPagada = mensualidadesAlumno.data.find((m: any) => m.estado === 1);
          
          if (mensualidadPagada) {
            setCurrentMensualidadId(mensualidadPagada.id);
            setPaymentData(prev => ({
              ...prev,
              alumno: selectedStudent.alumnoId.toString(),
              monto: mensualidadPagada.monto.toString(),
              mes: numberToMes[mensualidadPagada.mes] || '',
              concepto: mensualidadPagada.concepto === 1 ? 'Inscripción' : 
                       mensualidadPagada.concepto === 2 ? 'Mensualidad' :
                       mensualidadPagada.concepto === 3 ? 'Material' : 'Otro',
              metodoPago: mensualidadPagada.metodoPago === 1 ? 'Efectivo' :
                         mensualidadPagada.metodoPago === 2 ? 'Transferencia' :
                         mensualidadPagada.metodoPago === 3 ? 'Tarjeta' : 'Otro',
              fecha: mensualidadPagada.fechaPago ? mensualidadPagada.fechaPago.split('T')[0] : '',
              observaciones: mensualidadPagada.observaciones || ''
            }));
            setIsEditing(true);
            setIsPaymentModalOpen(true);
          }
        } catch (err) {
          console.error('Error loading payment data:', err);
        }
      }
    }
  };

  const handleSavePayment = async () => {
    try {
      const añoActual = new Date().getFullYear();
      const mesNumber = mesToNumber[paymentData.mes];
      
      if (!mesNumber) {
        alert('Por favor seleccione un mes válido');
        return;
      }

      const conceptoMap: Record<string, number> = {
        'Inscripción': 1,
        'Mensualidad': 2,
        'Material': 3,
        'Otro': 4
      };

      const metodoPagoMap: Record<string, number> = {
        'Efectivo': 1,
        'Transferencia': 2,
        'Tarjeta': 3,
        'Otro': 4
      };

      const dto: MensualidadDTO = {
        alumnoId: parseInt(paymentData.alumno),
        mes: mesNumber,
        año: añoActual,
        monto: parseFloat(paymentData.monto),
        estado: 1, // Pagado
        fechaPago: paymentData.fecha || new Date().toISOString().split('T')[0],
        concepto: conceptoMap[paymentData.concepto] || 2,
        metodoPago: metodoPagoMap[paymentData.metodoPago] || 1,
        observaciones: paymentData.observaciones || undefined
      };

      if (isEditing && currentMensualidadId) {
        await mensualidadesApi.update(currentMensualidadId, dto);
      } else {
        await mensualidadesApi.create(dto);
      }

      // Recargar datos
      await loadData();
      
      setIsPaymentModalOpen(false);
      setPaymentData({
        fecha: '',
        monto: '',
        concepto: '',
        metodoPago: '',
        observaciones: '',
        alumno: '',
        mes: ''
      });
      setSelectedStudents([]);
      setIsEditing(false);
      setCurrentMensualidadId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar el pago');
      console.error('Error saving payment:', err);
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
      mes: ''
    });
  };

  const filteredMensualidades = mensualidades.filter(mensualidad => {
    // Filtro por búsqueda
    if (searchTerm && !mensualidad.alumnoNombre.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Si no hay filtros activos, mostrar todos los alumnos
    if (Object.keys(activeFilters).length === 0) {
      return true;
    }

    // Aplicar filtros
    return Object.entries(activeFilters).every(([key, value]) => {
      switch (key) {
        case 'estadoPago':
          if (value === 'PAGADO') {
            return Object.values(mensualidad.pagosPorMes).some(pago => pago === 'PAGADO');
          } else if (value === 'PENDIENTE') {
            return Object.values(mensualidad.pagosPorMes).some(pago => pago === 'PENDIENTE');
          }
          return true;
        case 'mes':
          return mensualidad.pagosPorMes[value] !== undefined;
        default:
          return true;
      }
    });
  });

  const handleMensualidadClick = (mensualidad: MensualidadResumenDTO) => {
    setSelectedMensualidad(mensualidad);
    setIsModalOpen(true);
  };

  const handleSaveMensualidad = async () => {
    // Esta función puede ser usada para guardar conceptos adicionales si es necesario
    // Por ahora solo cerramos el modal
    setIsModalOpen(false);
    setSelectedMensualidad(null);
  };

  const openPrintWindow = () => {
    // Aquí iría la lógica para abrir la ventana de impresión
    console.log('Imprimiendo lista de mensualidades');
  };

  const handleEstadoChange = (conceptoId: number, estado: string) => {
    // Esta función puede ser usada para cambiar el estado de conceptos si es necesario
    console.log(`Concepto ${conceptoId} estado cambiado a ${estado}`);
  };

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
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
                  className="bg-green-700 hover:bg-green-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleRegisterPayment}
                  disabled={selectedStudents.length !== 1}
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
                <span className="text-sm font-medium">Salir</span>
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
                          {key === 'estadoPago' ? 'Estado: ' : 'Mes: '}
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
                            checked={filteredMensualidades.length > 0 && filteredMensualidades.every(m => selectedStudents.includes(m.alumnoId))}
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
                      {loading ? (
                        <tr>
                          <td colSpan={10} className="px-3 py-8 text-center text-gray-500">
                            Cargando datos...
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={10} className="px-3 py-8 text-center text-red-500">
                            {error}
                          </td>
                        </tr>
                      ) : filteredMensualidades.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-3 py-8 text-center text-gray-500">
                            No se encontraron mensualidades
                          </td>
                        </tr>
                      ) : (
                        filteredMensualidades.map((item) => (
                  <tr key={item.alumnoId} className="hover:bg-blue-50 transition-colors">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={selectedStudents.includes(item.alumnoId)}
                              onChange={(e) => handleStudentSelect(item.alumnoId, e.target.checked)}
                            />
                    </td>
                          <td className="px-3 py-2 text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                {getInitials(item.alumnoNombre)}
                              </div>
                              {item.alumnoNombre}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-700">
                            <Badge variant={item.curso.includes('Diplomado') ? 'default' : 'secondary'} className="text-sm">
                        {item.curso}
                      </Badge>
                    </td>
                          <td className="px-3 py-2 text-sm font-semibold text-gray-900">${item.montoMensualidad.toFixed(2)}</td>
                    {meses.map(mes => (
                            <td key={mes} className="px-2 py-2 text-center">
                        {item.pagosPorMes[mes] === 'PAGADO' && (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white text-sm">
                            PAGADO
                          </Badge>
                        )}
                        {item.pagosPorMes[mes] === 'PENDIENTE' && (
                          <Badge variant="destructive" className="text-sm">
                            PENDIENTE
                          </Badge>
                        )}
                        {item.pagosPorMes[mes] === null && (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
                      )}
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
                    value={paymentData.concepto}
                    onValueChange={(value) => setPaymentData(prev => ({ ...prev, concepto: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el concepto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inscripción">Inscripción</SelectItem>
                      <SelectItem value="Mensualidad">Mensualidad</SelectItem>
                      <SelectItem value="Material">Material</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mes">Mes a pagar</Label>
                  <Select
                    value={paymentData.mes}
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
                  value={paymentData.metodoPago}
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
                    mes: ''
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
                <Label htmlFor="estadoPago">Estado del Pago</Label>
                <Select
                  value={filterValues.estadoPago}
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
                  value={filterValues.mes}
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
                      {fecha}
                    </Badge>
                  </div>
                  <div className="text-base text-blue-700">
                    <p>Alumno: {selectedMensualidad.alumnoNombre}</p>
                    <p>Total Pagado: ${selectedMensualidad.totalPagado.toFixed(2)}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-base">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-3 text-left">Mes</th>
                        <th className="border p-3 text-center">Estado</th>
                        <th className="border p-3 text-center">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meses.map((mes) => {
                        const estado = selectedMensualidad.pagosPorMes[mes];
                        return (
                          <tr key={mes} className="hover:bg-gray-50">
                            <td className="border p-3">{mes}</td>
                            <td className="border p-3 text-center">
                              {estado === 'PAGADO' ? (
                                <Badge className="bg-green-500 text-white">PAGADO</Badge>
                              ) : estado === 'PENDIENTE' ? (
                                <Badge variant="destructive">PENDIENTE</Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="border p-3 text-center">
                              ${selectedMensualidad.montoMensualidad.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
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
