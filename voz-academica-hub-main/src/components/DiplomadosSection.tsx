import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, GraduationCap } from 'lucide-react';

interface Diplomado {
  id: number;
  dia: string;
  curso: string;
  horario: string;
  aula: string;
  docente: string;
  cargo: string;
  nivel: number;
  duracion: string;
}

const DiplomadosSection = () => {
  const [selectedClase, setSelectedClase] = useState<Diplomado | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  const diplomados: Diplomado[] = [
    // Diplomado N4 - Expresión Oral
    {
      id: 1,
      dia: 'Lunes',
      curso: 'Diplomado N4 - Expresión Oral',
      horario: '3:00 - 5:00 PM',
      aula: 'B4',
      docente: 'Mtra. María González',
      cargo: 'Profesora',
      nivel: 4,
      duracion: '6 meses'
    },
    {
      id: 2,
      dia: 'Martes',
      curso: 'Diplomado N4 - Expresión Oral',
      horario: '3:00 - 5:00 PM',
      aula: 'B4',
      docente: 'Mtra. María González',
      cargo: 'Profesora',
      nivel: 4,
      duracion: '6 meses'
    },
    {
      id: 3,
      dia: 'Miércoles',
      curso: 'Diplomado N4 - Expresión Oral',
      horario: '3:00 - 5:00 PM',
      aula: 'B4',
      docente: 'Mtra. María González',
      cargo: 'Profesora',
      nivel: 4,
      duracion: '6 meses'
    },
    {
      id: 4,
      dia: 'Jueves',
      curso: 'Diplomado N4 - Expresión Oral',
      horario: '3:00 - 5:00 PM',
      aula: 'B4',
      docente: 'Mtra. María González',
      cargo: 'Profesora',
      nivel: 4,
      duracion: '6 meses'
    },
    {
      id: 5,
      dia: 'Viernes',
      curso: 'Diplomado N4 - Expresión Oral',
      horario: '3:00 - 5:00 PM',
      aula: 'B4',
      docente: 'Mtra. María González',
      cargo: 'Profesora',
      nivel: 4,
      duracion: '6 meses'
    },
    // Diplomado N5 - Doblaje
    {
      id: 6,
      dia: 'Lunes',
      curso: 'Diplomado N5 - Doblaje',
      horario: '4:00 - 6:00 PM',
      aula: 'B1',
      docente: 'Dir. Armando LeBlohic',
      cargo: 'Director',
      nivel: 5,
      duracion: '6 meses'
    },
    {
      id: 7,
      dia: 'Martes',
      curso: 'Diplomado N5 - Doblaje',
      horario: '4:00 - 6:00 PM',
      aula: 'B1',
      docente: 'Dir. Armando LeBlohic',
      cargo: 'Director',
      nivel: 5,
      duracion: '6 meses'
    },
    {
      id: 8,
      dia: 'Miércoles',
      curso: 'Diplomado N5 - Doblaje',
      horario: '4:00 - 6:00 PM',
      aula: 'B1',
      docente: 'Dir. Armando LeBlohic',
      cargo: 'Director',
      nivel: 5,
      duracion: '6 meses'
    },
    {
      id: 9,
      dia: 'Jueves',
      curso: 'Diplomado N5 - Doblaje',
      horario: '4:00 - 6:00 PM',
      aula: 'B1',
      docente: 'Dir. Armando LeBlohic',
      cargo: 'Director',
      nivel: 5,
      duracion: '6 meses'
    },
    {
      id: 10,
      dia: 'Viernes',
      curso: 'Diplomado N5 - Doblaje',
      horario: '4:00 - 6:00 PM',
      aula: 'B1',
      docente: 'Dir. Armando LeBlohic',
      cargo: 'Director',
      nivel: 5,
      duracion: '6 meses'
    },
    // Diplomado N6 - Locución
    {
      id: 11,
      dia: 'Lunes',
      curso: 'Diplomado N6 - Locución',
      horario: '6:00 - 8:00 PM',
      aula: 'B2',
      docente: 'Mtra. Ana Martínez',
      cargo: 'Coordinadora',
      nivel: 6,
      duracion: '6 meses'
    },
    {
      id: 12,
      dia: 'Martes',
      curso: 'Diplomado N6 - Locución',
      horario: '6:00 - 8:00 PM',
      aula: 'B2',
      docente: 'Mtra. Ana Martínez',
      cargo: 'Coordinadora',
      nivel: 6,
      duracion: '6 meses'
    },
    {
      id: 13,
      dia: 'Miércoles',
      curso: 'Diplomado N6 - Locución',
      horario: '6:00 - 8:00 PM',
      aula: 'B2',
      docente: 'Mtra. Ana Martínez',
      cargo: 'Coordinadora',
      nivel: 6,
      duracion: '6 meses'
    },
    {
      id: 14,
      dia: 'Jueves',
      curso: 'Diplomado N6 - Locución',
      horario: '6:00 - 8:00 PM',
      aula: 'B2',
      docente: 'Mtra. Ana Martínez',
      cargo: 'Coordinadora',
      nivel: 6,
      duracion: '6 meses'
    },
    {
      id: 15,
      dia: 'Viernes',
      curso: 'Diplomado N6 - Locución',
      horario: '6:00 - 8:00 PM',
      aula: 'B2',
      docente: 'Mtra. Ana Martínez',
      cargo: 'Coordinadora',
      nivel: 6,
      duracion: '6 meses'
    },
    // Diplomado N7 - Actuación
    {
      id: 16,
      dia: 'Lunes',
      curso: 'Diplomado N7 - Actuación',
      horario: '5:00 - 7:00 PM',
      aula: 'B3',
      docente: 'Dr. Carlos Rodríguez',
      cargo: 'Profesor',
      nivel: 7,
      duracion: '8 meses'
    },
    {
      id: 17,
      dia: 'Martes',
      curso: 'Diplomado N7 - Actuación',
      horario: '5:00 - 7:00 PM',
      aula: 'B3',
      docente: 'Dr. Carlos Rodríguez',
      cargo: 'Profesor',
      nivel: 7,
      duracion: '8 meses'
    },
    {
      id: 18,
      dia: 'Miércoles',
      curso: 'Diplomado N7 - Actuación',
      horario: '5:00 - 7:00 PM',
      aula: 'B3',
      docente: 'Dr. Carlos Rodríguez',
      cargo: 'Profesor',
      nivel: 7,
      duracion: '8 meses'
    },
    {
      id: 19,
      dia: 'Jueves',
      curso: 'Diplomado N7 - Actuación',
      horario: '5:00 - 7:00 PM',
      aula: 'B3',
      docente: 'Dr. Carlos Rodríguez',
      cargo: 'Profesor',
      nivel: 7,
      duracion: '8 meses'
    },
    {
      id: 20,
      dia: 'Viernes',
      curso: 'Diplomado N7 - Actuación',
      horario: '5:00 - 7:00 PM',
      aula: 'B3',
      docente: 'Dr. Carlos Rodríguez',
      cargo: 'Profesor',
      nivel: 7,
      duracion: '8 meses'
    }
  ];

  const handleClaseClick = (clase: Diplomado) => {
    setSelectedClase(clase);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 bg-[#f8fafc] min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Calendario de Diplomados</h2>
              <p className="text-base text-gray-600">Horarios semanales</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {diasSemana.map((dia) => (
            <Card key={dia} className="shadow-sm border border-[#e2e8f0] hover:shadow-md transition-shadow h-full">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-b border-blue-500 py-4">
                <CardTitle className="text-center text-base lg:text-xl font-medium">
                  {dia}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-5">
                <div className="space-y-3">
                  {diplomados
                    .filter(d => d.dia === dia)
                    .sort((a, b) => a.horario.localeCompare(b.horario))
                    .map((clase) => (
                      <div
                        key={clase.id}
                        onClick={() => handleClaseClick(clase)}
                        className="p-4 rounded-md hover:bg-blue-50 transition-colors cursor-pointer border border-[#e2e8f0]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm lg:text-base text-blue-600 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {clase.horario}
                          </span>
                          <span className="text-sm lg:text-base text-blue-600 flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Aula {clase.aula}
                          </span>
                        </div>
                        <h4 className="text-base lg:text-lg font-medium text-[#0f172a] mb-2 line-clamp-2">
                          {clase.curso}
                        </h4>
                        <div className="flex items-center text-sm lg:text-base text-[#475569]">
                          <User className="w-4 h-4 mr-2" />
                          <span className="line-clamp-1">{clase.docente}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de detalles de clase */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px] w-[95%]">
            <DialogHeader>
              <DialogTitle className="text-xl lg:text-2xl font-semibold text-[#0f172a]">
                Detalles del Diplomado
              </DialogTitle>
            </DialogHeader>
            {selectedClase && (
              <div className="mt-4 space-y-4">
                <div className="p-6 bg-blue-50 rounded-md">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base lg:text-lg font-medium text-blue-700">{selectedClase.dia}</span>
                    <span className="text-base lg:text-lg text-blue-600 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      {selectedClase.horario}
                    </span>
                  </div>
                  <h4 className="text-lg lg:text-xl font-medium text-[#0f172a] mb-4">
                    {selectedClase.curso}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-base lg:text-lg">
                      <span className="text-blue-600 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Docente
                      </span>
                      <span className="text-[#0f172a]">{selectedClase.docente}</span>
                    </div>
                    <div className="flex items-center justify-between text-base lg:text-lg">
                      <span className="text-blue-600 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Aula
                      </span>
                      <span className="text-[#0f172a]">{selectedClase.aula}</span>
                    </div>
                    <div className="flex items-center justify-between text-base lg:text-lg">
                      <span className="text-blue-600 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Nivel
                      </span>
                      <span className="text-[#0f172a]">N{selectedClase.nivel}</span>
                    </div>
                    <div className="flex items-center justify-between text-base lg:text-lg">
                      <span className="text-blue-600 flex items-center">
                        Duración
                      </span>
                      <span className="text-[#0f172a]">{selectedClase.duracion}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DiplomadosSection; 