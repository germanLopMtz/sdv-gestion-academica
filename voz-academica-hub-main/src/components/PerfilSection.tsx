
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PerfilSection = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Información del perfil */}
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center">
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border-4 border-blue-100">
              <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Lizzy Hernández</h3>
            <p className="text-gray-600 mb-4">Administradora y Coordinadora</p>
            <Badge className="bg-blue-100 text-blue-800 mb-4">
              Horario: 10:00 a.m. a 7:00 p.m.
            </Badge>
            
            <div className="text-left mt-6 space-y-3">
              <div className="border-b pb-2">
                <span className="text-sm text-gray-500">Email:</span>
                <p className="font-medium">lizzy.hernandez@sdv.mx</p>
              </div>
              <div className="border-b pb-2">
                <span className="text-sm text-gray-500">Teléfono:</span>
                <p className="font-medium">+52 662 123 4567</p>
              </div>
              <div className="border-b pb-2">
                <span className="text-sm text-gray-500">Departamento:</span>
                <p className="font-medium">Coordinación Académica</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos de estadísticas */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardTitle>Estadísticas del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            
            {/* Gráfico de barras simulado */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4">Categorías</h4>
              <div className="flex items-end justify-between h-32 border-b border-gray-200">
                {[
                  { name: 'Categoría 1', values: [15, 12, 8] },
                  { name: 'Categoría 2', values: [18, 15, 10] },
                  { name: 'Categoría 3', values: [12, 16, 14] },
                  { name: 'Categoría 4', values: [20, 18, 16] }
                ].map((cat, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex items-end space-x-1 mb-2">
                      {cat.values.map((value, i) => (
                        <div
                          key={i}
                          className={`w-4 ${
                            i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-orange-500' : 'bg-gray-400'
                          }`}
                          style={{ height: `${value * 4}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">{cat.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4 space-x-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Serie 1</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Serie 2</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 mr-2"></div>
                  <span className="text-sm text-gray-600">Serie 3</span>
                </div>
              </div>
            </div>

            {/* Gráfico de líneas simulado */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Asistencias</h4>
              <div className="relative h-32 border border-gray-200 rounded bg-gray-50">
                <svg className="w-full h-full p-4" viewBox="0 0 400 100">
                  {/* Líneas de las series */}
                  <polyline
                    points="0,80 100,60 200,50 300,45 400,40"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                  <polyline
                    points="0,70 100,65 200,68 300,62 400,58"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="2"
                  />
                  <polyline
                    points="0,60 100,75 200,70 300,65 400,60"
                    fill="none"
                    stroke="#6B7280"
                    strokeWidth="2"
                  />
                  
                  {/* Puntos en las líneas */}
                  {[0, 100, 200, 300, 400].map((x, i) => (
                    <g key={i}>
                      <circle cx={x} cy={80 - i * 10} r="3" fill="#3B82F6" />
                      <circle cx={x} cy={70 - Math.sin(i) * 5} r="3" fill="#F97316" />
                      <circle cx={x} cy={60 + Math.cos(i) * 8} r="3" fill="#6B7280" />
                    </g>
                  ))}
                </svg>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>Categoría 1</span>
                <span>Categoría 2</span>
                <span>Categoría 3</span>
                <span>Categoría 4</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      <footer className="mt-8 text-center text-gray-600 text-sm">
        <p>© 2023 Servicios de Voz. Todos los derechos reservados.</p>
        <p>Fecha: {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
};

export default PerfilSection;
