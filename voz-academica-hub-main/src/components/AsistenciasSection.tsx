import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Calendar, Users, CheckCircle2, XCircle, MapPin } from 'lucide-react';

interface Clase {
  id: number;
  dia: string;
  curso: string;
  horario: string;
  aula: string;
  docente: string;
  cargo: string;
  alumnos: {
    id: number;
    nombre: string;
    asistencia: 'S' | 'N' | 'J' | null;
  }[];
}

const AsistenciasSection = () => {
  const [selectedClase, setSelectedClase] = useState<Clase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [clasesDelDia, setClasesDelDia] = useState<Clase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener el día de la semana actual
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaActual = diasSemana[new Date().getDay()];

  // Datos de ejemplo de clases
  const todasLasClases: Clase[] = [
    // Seminarios
    {
      id: 1,
      dia: 'Lunes',
      curso: 'Seminario de Doblaje',
      horario: '3:00 - 5:00 PM',
      aula: 'A3',
      docente: 'Dir. Armando LeBlohic',
      cargo: 'Director',
      alumnos: [
        { id: 1, nombre: 'Sarah Alicia Gutiérrez Hernández', asistencia: null },
        { id: 2, nombre: 'Ian Karim Villalba Romero', asistencia: null },
        { id: 3, nombre: 'Cristian Jair Alcantar Cienfuegos', asistencia: null }
      ]
    },
    {
      id: 2,
      dia: 'Lunes',
      curso: 'Seminario de Locución',
      horario: '5:30 - 7:30 PM',
      aula: 'A2',
      docente: 'Mtra. Ana Martínez',
      cargo: 'Coordinadora',
      alumnos: [
        { id: 4, nombre: 'Emmanuel Mizques Martínez', asistencia: null },
        { id: 5, nombre: 'Aaron Jesús Ramos García', asistencia: null },
        { id: 6, nombre: 'María Fernanda López Torres', asistencia: null }
      ]
    },
    {
      id: 3,
      dia: 'Lunes',
      curso: 'Seminario de Actuación',
      horario: '4:00 - 6:00 PM',
      aula: 'A1',
      docente: 'Dr. Carlos Rodríguez',
      cargo: 'Profesor',
      alumnos: [
        { id: 7, nombre: 'Carlos Eduardo Mendoza Ruiz', asistencia: null },
        { id: 8, nombre: 'Ana Sofía Valenzuela Díaz', asistencia: null },
        { id: 9, nombre: 'Diego Alejandro Soto Vega', asistencia: null }
      ]
    },
    // Diplomados
    {
      id: 4,
      dia: 'Lunes',
      curso: 'Diplomado N4 - Expresión Oral',
      horario: '3:00 - 5:00 PM',
      aula: 'B4',
      docente: 'Mtra. María González',
      cargo: 'Profesora',
      alumnos: [
        { id: 10, nombre: 'Valeria Guadalupe Morales', asistencia: null },
        { id: 11, nombre: 'José Manuel Ríos Ortega', asistencia: null },
        { id: 12, nombre: 'Laura Patricia Castro Luna', asistencia: null }
      ]
    },
    {
      id: 5,
      dia: 'Lunes',
      curso: 'Diplomado N5 - Doblaje',
      horario: '4:00 - 6:00 PM',
      aula: 'B1',
      docente: 'Dir. Armando LeBlohic',
      cargo: 'Director',
      alumnos: [
        { id: 13, nombre: 'Roberto Carlos Navarro', asistencia: null },
        { id: 14, nombre: 'Gabriela Alejandra Torres', asistencia: null },
        { id: 15, nombre: 'Miguel Ángel Flores', asistencia: null }
      ]
    },
    {
      id: 6,
      dia: 'Lunes',
      curso: 'Diplomado N6 - Locución',
      horario: '6:00 - 8:00 PM',
      aula: 'B2',
      docente: 'Mtra. Ana Martínez',
      cargo: 'Coordinadora',
      alumnos: [
        { id: 16, nombre: 'Isabella Martínez Ríos', asistencia: null },
        { id: 17, nombre: 'Fernando Daniel Herrera', asistencia: null },
        { id: 18, nombre: 'Camila Sofía Ramírez', asistencia: null }
      ]
    },
    {
      id: 7,
      dia: 'Lunes',
      curso: 'Diplomado N7 - Actuación',
      horario: '5:00 - 7:00 PM',
      aula: 'B3',
      docente: 'Dr. Carlos Rodríguez',
      cargo: 'Profesor',
      alumnos: [
        { id: 19, nombre: 'Juan Pablo Sánchez', asistencia: null },
        { id: 20, nombre: 'Daniela Alejandra Luna', asistencia: null },
        { id: 21, nombre: 'Luis Enrique Vega', asistencia: null }
      ]
    },
    {
      id: 8,
      dia: 'Sábado',
      curso: 'Seminario de Expresión Oral',
      horario: '9:00 - 11:00 AM',
      aula: 'A1',
      docente: 'Mtra. María González',
      cargo: 'Profesora',
      alumnos: [
        { id: 22, nombre: 'Andrea López Martínez', asistencia: null },
        { id: 23, nombre: 'Luis Fernando Ruiz', asistencia: null },
        { id: 24, nombre: 'Paola Jiménez Torres', asistencia: null }
      ]
    },
    {
      id: 9,
      dia: 'Sábado',
      curso: 'Diplomado N5 - Doblaje',
      horario: '11:30 AM - 1:30 PM',
      aula: 'B1',
      docente: 'Dir. Armando LeBlohic',
      cargo: 'Director',
      alumnos: [
        { id: 25, nombre: 'Jorge Luis Mendoza', asistencia: null },
        { id: 26, nombre: 'Valeria Torres', asistencia: null },
        { id: 27, nombre: 'Sofía Ramírez', asistencia: null }
      ]
    },
    {
      id: 10,
      dia: 'Sábado',
      curso: 'Seminario de Locución',
      horario: '2:00 - 4:00 PM',
      aula: 'A2',
      docente: 'Mtra. Ana Martínez',
      cargo: 'Coordinadora',
      alumnos: [
        { id: 28, nombre: 'Carlos Alberto Díaz', asistencia: null },
        { id: 29, nombre: 'Fernanda Morales', asistencia: null },
        { id: 30, nombre: 'Miguel Ángel Torres', asistencia: null }
      ]
    }
  ];

  useEffect(() => {
    // Filtrar las clases del día actual
    const clasesHoy = todasLasClases.filter(clase => clase.dia === diaActual);
    setClasesDelDia(clasesHoy);
  }, [diaActual]);

  const handleClaseClick = (clase: Clase) => {
    setSelectedClase(clase);
    setIsModalOpen(true);
  };

  const handleAsistenciaChange = (alumnoId: number, asistencia: 'S' | 'N' | 'J') => {
    if (selectedClase) {
      setSelectedClase(prev => {
        if (!prev) return null;
        return {
          ...prev,
          alumnos: prev.alumnos.map(alumno =>
            alumno.id === alumnoId ? { ...alumno, asistencia } : alumno
          )
        };
      });
    }
  };

  const handleSaveAsistencias = () => {
    // Aquí iría la lógica para guardar las asistencias
    console.log('Guardando asistencias:', selectedClase);
    setIsModalOpen(false);
  };

  const filteredClases = clasesDelDia.filter(clase =>
    clase.curso.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clase.docente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openPrintWindow = () => {
    if (!selectedClase) return;
    const width = 800;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const printWindow = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top}`);
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lista de Asistencias</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { max-width: 150px; margin-bottom: 10px; }
          .details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .attendance { text-align: center; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          @media (max-width: 600px) {
            body { margin: 10px; }
            .logo { max-width: 100px; }
            h1 { font-size: 20px; }
            .details p { font-size: 14px; }
            th, td { padding: 5px; font-size: 14px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/path/to/logo.png" alt="Logo" class="logo">
          <h1>Lista de Asistencias</h1>
          <div class="details">
            <p><strong>Curso:</strong> ${selectedClase.curso}</p>
            <p><strong>Docente:</strong> ${selectedClase.docente}</p>
            <p><strong>Aula:</strong> ${selectedClase.aula}</p>
            <p><strong>Horario:</strong> ${selectedClase.horario}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nombre del Alumno</th>
              <th>Asistencia</th>
            </tr>
          </thead>
          <tbody>
            ${selectedClase.alumnos.map(alumno => `
              <tr>
                <td>${alumno.nombre}</td>
                <td class="attendance">${alumno.asistencia || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Impreso el ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="w-screen min-h-screen bg-[#f8fafc] p-6">
      <div className="mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Control de Asistencias</h2>
              <p className="text-base text-gray-600">Registro de asistencia diaria</p>
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
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg py-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Users className="w-6 h-6" />
                <span className="text-xl">Clases del día - {diaActual}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar clase o docente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs text-base bg-white/10 border-white/20 text-white placeholder:text-white/70"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {filteredClases.map((clase) => (
                <Card
                  key={clase.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow h-full"
                  onClick={() => handleClaseClick(clase)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="text-sm">
                        {clase.curso}
                      </Badge>
                      <span className="text-base text-gray-500 flex items-center">
                        <Clock className="w-5 h-5 mr-1" />
                        {clase.horario}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">{clase.docente}</h3>
                    <div className="flex items-center justify-between text-base text-gray-600 mb-2">
                      <span className="flex items-center">
                        <MapPin className="w-5 h-5 mr-1" />
                        {clase.aula}
                      </span>
                      <span>{clase.cargo}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-base">
                        <span className="text-gray-600">Total alumnos:</span>
                        <span className="font-semibold">{clase.alumnos.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal de asistencia */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">
                Registrar Asistencia
              </DialogTitle>
            </DialogHeader>
            {selectedClase && (
              <div className="mt-6">
                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-900 text-lg">{selectedClase.curso}</h3>
                    <Badge variant="secondary" className="text-sm">
                      {selectedClase.horario}
                    </Badge>
                  </div>
                  <div className="text-base text-blue-700">
                    <p>Docente: {selectedClase.docente}</p>
                    <p>Aula: {selectedClase.aula}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-base">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-3 text-left">Nombre del Alumno</th>
                        <th className="border p-3 text-center">Asistencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClase.alumnos.map((alumno) => (
                        <tr key={alumno.id} className="hover:bg-gray-50">
                          <td className="border p-3">{alumno.nombre}</td>
                          <td className="border p-3 text-center">
                            <div className="flex flex-wrap justify-center gap-3">
                              {(['S', 'N', 'J'] as const).map((tipo) => (
                                <Button
                                  key={tipo}
                                  size="lg"
                                  variant="outline"
                                  className={`h-10 px-6 text-lg font-bold border-2
                                    ${alumno.asistencia === tipo ?
                                      tipo === 'S' ? 'border-green-500 bg-green-100 text-green-700' :
                                      tipo === 'N' ? 'border-red-500 bg-red-100 text-red-700' :
                                      'border-yellow-500 bg-yellow-100 text-yellow-700'
                                    : 'border-gray-300'}
                                  `}
                                  onClick={() => handleAsistenciaChange(alumno.id, tipo)}
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
                    onClick={handleSaveAsistencias}
                    className="bg-green-500 hover:bg-green-600 text-lg px-6 h-10"
                  >
                    Guardar Asistencias
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

export default AsistenciasSection; 