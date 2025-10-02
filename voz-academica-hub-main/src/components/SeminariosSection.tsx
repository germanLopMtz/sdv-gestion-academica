import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User } from 'lucide-react';

interface Seminario {
  id: number;
  dia: string;
  curso: string;
  horario: string;
  aula: string;
  docente: string;
  cargo: string;
}

const SeminariosSection = () => {
  const [selectedClase, setSelectedClase] = useState<Seminario | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  const seminarios: Seminario[] = [
    // Horarios de Dir. Armando LeBlohic
    {
      id: 1,
      dia: 'Lunes',
      curso: 'Seminario de Doblaje',
      horario: '3:00 - 5:00 PM',
      aula: 'A3',
      docente: 'Dir. Armando LeBlohic',
      cargo: 'Director'
    },
    {
      id: 2,
      dia: 'Martes',
      curso: 'Seminario de Doblaje',
      horario: '3:00 - 5:00 PM',
      aula: 'A3',
      docente: 'Dir. Armando LeBlohic',
      cargo: 'Director'
    },
    {
      id: 3,
      dia: 'Miércoles',
      curso: 'Seminario de Doblaje',
      horario: '3:00 - 5:00 PM',
      aula: 'A3',
      docente: 'Dir. Armando LeBlohic',
      cargo: 'Director'
    },
    {
      id: 4,
      dia: 'Jueves',
      curso: 'Seminario de Doblaje',
      horario: '3:00 - 5:00 PM',
      aula: 'A3',
      docente: 'Dir. Armando LeBlohic',
      cargo: 'Director'
            },
            {
      id: 5,
      dia: 'Viernes',
      curso: 'Seminario de Doblaje',
      horario: '3:00 - 5:00 PM',
      aula: 'A3',
      docente: 'Dir. Armando LeBlohic',
      cargo: 'Director'
    },
    // Horarios de Mtra. Ana Martínez
    {
      id: 6,
      dia: 'Lunes',
      curso: 'Seminario de Locución',
      horario: '5:30 - 7:30 PM',
      aula: 'A2',
      docente: 'Mtra. Ana Martínez',
      cargo: 'Coordinadora'
        },
        {
      id: 7,
      dia: 'Martes',
      curso: 'Seminario de Locución',
      horario: '5:30 - 7:30 PM',
      aula: 'A2',
      docente: 'Mtra. Ana Martínez',
      cargo: 'Coordinadora'
    },
    {
      id: 8,
      dia: 'Miércoles',
      curso: 'Seminario de Locución',
      horario: '5:30 - 7:30 PM',
      aula: 'A2',
      docente: 'Mtra. Ana Martínez',
      cargo: 'Coordinadora'
    },
    {
      id: 9,
      dia: 'Jueves',
      curso: 'Seminario de Locución',
      horario: '5:30 - 7:30 PM',
      aula: 'A2',
      docente: 'Mtra. Ana Martínez',
      cargo: 'Coordinadora'
    },
    {
      id: 10,
      dia: 'Viernes',
      curso: 'Seminario de Locución',
      horario: '5:30 - 7:30 PM',
      aula: 'A2',
      docente: 'Mtra. Ana Martínez',
      cargo: 'Coordinadora'
    },
    // Horarios de Dr. Carlos Rodríguez
    {
      id: 11,
      dia: 'Lunes',
      curso: 'Seminario de Actuación',
      horario: '4:00 - 6:00 PM',
      aula: 'A1',
      docente: 'Dr. Carlos Rodríguez',
      cargo: 'Profesor'
    },
    {
      id: 12,
      dia: 'Martes',
      curso: 'Seminario de Actuación',
      horario: '4:00 - 6:00 PM',
      aula: 'A1',
      docente: 'Dr. Carlos Rodríguez',
      cargo: 'Profesor'
    },
    {
      id: 13,
      dia: 'Miércoles',
      curso: 'Seminario de Actuación',
      horario: '4:00 - 6:00 PM',
      aula: 'A1',
      docente: 'Dr. Carlos Rodríguez',
      cargo: 'Profesor'
    },
    {
      id: 14,
      dia: 'Jueves',
      curso: 'Seminario de Actuación',
      horario: '4:00 - 6:00 PM',
      aula: 'A1',
      docente: 'Dr. Carlos Rodríguez',
      cargo: 'Profesor'
        },
        {
      id: 15,
      dia: 'Viernes',
      curso: 'Seminario de Actuación',
      horario: '4:00 - 6:00 PM',
      aula: 'A1',
      docente: 'Dr. Carlos Rodríguez',
      cargo: 'Profesor'
    },
    // Horarios de Mtra. Laura Sánchez
    {
      id: 16,
      dia: 'Lunes',
      curso: 'Seminario de Técnica Vocal',
      horario: '6:00 - 8:00 PM',
      aula: 'A4',
      docente: 'Mtra. Laura Sánchez',
      cargo: 'Profesora'
            },
            {
      id: 17,
      dia: 'Martes',
      curso: 'Seminario de Técnica Vocal',
      horario: '6:00 - 8:00 PM',
      aula: 'A4',
      docente: 'Mtra. Laura Sánchez',
      cargo: 'Profesora'
    },
    {
      id: 18,
      dia: 'Miércoles',
      curso: 'Seminario de Técnica Vocal',
      horario: '6:00 - 8:00 PM',
      aula: 'A4',
      docente: 'Mtra. Laura Sánchez',
      cargo: 'Profesora'
    },
    {
      id: 19,
      dia: 'Jueves',
      curso: 'Seminario de Técnica Vocal',
      horario: '6:00 - 8:00 PM',
      aula: 'A4',
      docente: 'Mtra. Laura Sánchez',
      cargo: 'Profesora'
    },
    {
      id: 20,
      dia: 'Viernes',
      curso: 'Seminario de Técnica Vocal',
      horario: '6:00 - 8:00 PM',
      aula: 'A4',
      docente: 'Mtra. Laura Sánchez',
      cargo: 'Profesora'
    },
    // Horarios de Mtro. Juan Pérez
    {
      id: 21,
      dia: 'Lunes',
      curso: 'Seminario de Improvisación',
      horario: '7:00 - 9:00 PM',
      aula: 'A5',
      docente: 'Mtro. Juan Pérez',
      cargo: 'Profesor'
    },
    {
      id: 22,
      dia: 'Martes',
      curso: 'Seminario de Improvisación',
      horario: '7:00 - 9:00 PM',
      aula: 'A5',
      docente: 'Mtro. Juan Pérez',
      cargo: 'Profesor'
        },
        {
      id: 23,
      dia: 'Miércoles',
      curso: 'Seminario de Improvisación',
      horario: '7:00 - 9:00 PM',
      aula: 'A5',
      docente: 'Mtro. Juan Pérez',
      cargo: 'Profesor'
    },
    {
      id: 24,
      dia: 'Jueves',
      curso: 'Seminario de Improvisación',
      horario: '7:00 - 9:00 PM',
      aula: 'A5',
      docente: 'Mtro. Juan Pérez',
      cargo: 'Profesor'
    },
    {
      id: 25,
      dia: 'Viernes',
      curso: 'Seminario de Improvisación',
      horario: '7:00 - 9:00 PM',
      aula: 'A5',
      docente: 'Mtro. Juan Pérez',
      cargo: 'Profesor'
            }
  ];

  const handleClaseClick = (clase: Seminario) => {
    setSelectedClase(clase);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 bg-[#f8fafc] min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Calendario de Seminarios</h2>
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
                  {seminarios
                    .filter(s => s.dia === dia)
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
                Detalles de la Clase
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

export default SeminariosSection;
