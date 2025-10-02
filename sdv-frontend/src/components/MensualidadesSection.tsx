import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Calendar, Users, MapPin, Clock } from 'lucide-react';

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
  const [selectedMensualidad, setSelectedMensualidad] = useState(null);
  const [fecha, setFecha] = useState('');
  
  const mensualidades = [
    {
      id: 1,
      nombre: 'Sarah Alicia Gutiérrez Hernández',
      curso: 'Diplomado N6',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 1',
      cargo: 'Estudiante',
      conceptos: [
        { id: 1, nombre: 'Inscripción', estado: 'S' },
        { id: 2, nombre: 'Mensualidad', estado: 'S' },
        { id: 3, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 2,
      nombre: 'Ian Karim Villalba Romero',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$1000',
      aula: 'Aula 2',
      cargo: 'Estudiante',
      conceptos: [
        { id: 4, nombre: 'Inscripción', estado: 'S' },
        { id: 5, nombre: 'Mensualidad', estado: 'S' },
        { id: 6, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 3,
      nombre: 'Cristian Jair Alcantar Cienfuegos',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PENDIENTE',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$0',
      aula: 'Aula 3',
      cargo: 'Estudiante',
      conceptos: [
        { id: 7, nombre: 'Inscripción', estado: 'N' },
        { id: 8, nombre: 'Mensualidad', estado: 'N' },
        { id: 9, nombre: 'Material', estado: 'N' }
      ]
    },
    {
      id: 4,
      nombre: 'Emmanuel Mizques Martínez',
      curso: 'Diplomado N5',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: null,
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$0',
      aula: 'Aula 4',
      cargo: 'Estudiante',
      conceptos: [
        { id: 10, nombre: 'Inscripción', estado: 'N' },
        { id: 11, nombre: 'Mensualidad', estado: 'N' },
        { id: 12, nombre: 'Material', estado: 'N' }
      ]
    },
    {
      id: 5,
      nombre: 'Aaron Jesús Ramos García',
      curso: 'Diplomado N5',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 5',
      cargo: 'Estudiante',
      conceptos: [
        { id: 13, nombre: 'Inscripción', estado: 'S' },
        { id: 14, nombre: 'Mensualidad', estado: 'S' },
        { id: 15, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 6,
      nombre: 'María Fernanda López Torres',
      curso: 'Diplomado N6',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PENDIENTE',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$0',
      aula: 'Aula 6',
      cargo: 'Estudiante',
      conceptos: [
        { id: 16, nombre: 'Inscripción', estado: 'N' },
        { id: 17, nombre: 'Mensualidad', estado: 'N' },
        { id: 18, nombre: 'Material', estado: 'N' }
      ]
    },
    {
      id: 7,
      nombre: 'Carlos Eduardo Mendoza Ruiz',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$1000',
      aula: 'Aula 7',
      cargo: 'Estudiante',
      conceptos: [
        { id: 19, nombre: 'Inscripción', estado: 'S' },
        { id: 20, nombre: 'Mensualidad', estado: 'S' },
        { id: 21, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 8,
      nombre: 'Ana Sofía Valenzuela Díaz',
      curso: 'Diplomado N5',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 8',
      cargo: 'Estudiante',
      conceptos: [
        { id: 22, nombre: 'Inscripción', estado: 'S' },
        { id: 23, nombre: 'Mensualidad', estado: 'S' },
        { id: 24, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 9,
      nombre: 'Diego Alejandro Soto Vega',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PENDIENTE',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$0',
      aula: 'Aula 9',
      cargo: 'Estudiante',
      conceptos: [
        { id: 25, nombre: 'Inscripción', estado: 'N' },
        { id: 26, nombre: 'Mensualidad', estado: 'N' },
        { id: 27, nombre: 'Material', estado: 'N' }
      ]
    },
    {
      id: 10,
      nombre: 'Valeria Guadalupe Morales',
      curso: 'Diplomado N6',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 10',
      cargo: 'Estudiante',
      conceptos: [
        { id: 28, nombre: 'Inscripción', estado: 'S' },
        { id: 29, nombre: 'Mensualidad', estado: 'S' },
        { id: 30, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 11,
      nombre: 'José Manuel Ríos Ortega',
      curso: 'Diplomado N5',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 11',
      cargo: 'Estudiante',
      conceptos: [
        { id: 31, nombre: 'Inscripción', estado: 'S' },
        { id: 32, nombre: 'Mensualidad', estado: 'S' },
        { id: 33, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 12,
      nombre: 'Laura Patricia Castro Luna',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PENDIENTE',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$0',
      aula: 'Aula 12',
      cargo: 'Estudiante',
      conceptos: [
        { id: 34, nombre: 'Inscripción', estado: 'N' },
        { id: 35, nombre: 'Mensualidad', estado: 'N' },
        { id: 36, nombre: 'Material', estado: 'N' }
      ]
    },
    {
      id: 13,
      nombre: 'Roberto Carlos Navarro',
      curso: 'Diplomado N6',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 13',
      cargo: 'Estudiante',
      conceptos: [
        { id: 37, nombre: 'Inscripción', estado: 'S' },
        { id: 38, nombre: 'Mensualidad', estado: 'S' },
        { id: 39, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 14,
      nombre: 'Gabriela Alejandra Torres',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$1000',
      aula: 'Aula 14',
      cargo: 'Estudiante',
      conceptos: [
        { id: 40, nombre: 'Inscripción', estado: 'S' },
        { id: 41, nombre: 'Mensualidad', estado: 'S' },
        { id: 42, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 15,
      nombre: 'Miguel Ángel Flores',
      curso: 'Diplomado N5',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PENDIENTE',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$0',
      aula: 'Aula 15',
      cargo: 'Estudiante',
      conceptos: [
        { id: 43, nombre: 'Inscripción', estado: 'N' },
        { id: 44, nombre: 'Mensualidad', estado: 'N' },
        { id: 45, nombre: 'Material', estado: 'N' }
      ]
    },
    {
      id: 16,
      nombre: 'Isabella Martínez Ríos',
      curso: 'Diplomado N6',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 16',
      cargo: 'Estudiante',
      conceptos: [
        { id: 46, nombre: 'Inscripción', estado: 'S' },
        { id: 47, nombre: 'Mensualidad', estado: 'S' },
        { id: 48, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 17,
      nombre: 'Fernando Daniel Herrera',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$1000',
      aula: 'Aula 17',
      cargo: 'Estudiante',
      conceptos: [
        { id: 49, nombre: 'Inscripción', estado: 'S' },
        { id: 50, nombre: 'Mensualidad', estado: 'S' },
        { id: 51, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 18,
      nombre: 'Camila Sofía Ramírez',
      curso: 'Diplomado N5',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PENDIENTE',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$0',
      aula: 'Aula 18',
      cargo: 'Estudiante',
      conceptos: [
        { id: 52, nombre: 'Inscripción', estado: 'N' },
        { id: 53, nombre: 'Mensualidad', estado: 'N' },
        { id: 54, nombre: 'Material', estado: 'N' }
      ]
    },
    {
      id: 19,
      nombre: 'Juan Pablo Sánchez',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$1000',
      aula: 'Aula 19',
      cargo: 'Estudiante',
      conceptos: [
        { id: 55, nombre: 'Inscripción', estado: 'S' },
        { id: 56, nombre: 'Mensualidad', estado: 'S' },
        { id: 57, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 20,
      nombre: 'Daniela Alejandra Luna',
      curso: 'Diplomado N6',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 20',
      cargo: 'Estudiante',
      conceptos: [
        { id: 58, nombre: 'Inscripción', estado: 'S' },
        { id: 59, nombre: 'Mensualidad', estado: 'S' },
        { id: 60, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 21,
      nombre: 'Luis Enrique Vega',
      curso: 'Diplomado N5',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PENDIENTE',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$0',
      aula: 'Aula 21',
      cargo: 'Estudiante',
      conceptos: [
        { id: 61, nombre: 'Inscripción', estado: 'N' },
        { id: 62, nombre: 'Mensualidad', estado: 'N' },
        { id: 63, nombre: 'Material', estado: 'N' }
      ]
    },
    {
      id: 22,
      nombre: 'Mariana Guadalupe Ortega',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$1000',
      aula: 'Aula 22',
      cargo: 'Estudiante',
      conceptos: [
        { id: 64, nombre: 'Inscripción', estado: 'S' },
        { id: 65, nombre: 'Mensualidad', estado: 'S' },
        { id: 66, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 23,
      nombre: 'Ricardo Antonio Díaz',
      curso: 'Diplomado N6',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 23',
      cargo: 'Estudiante',
      conceptos: [
        { id: 67, nombre: 'Inscripción', estado: 'S' },
        { id: 68, nombre: 'Mensualidad', estado: 'S' },
        { id: 69, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 24,
      nombre: 'Sofía Valentina Ruiz',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PENDIENTE',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$0',
      aula: 'Aula 24',
      cargo: 'Estudiante',
      conceptos: [
        { id: 70, nombre: 'Inscripción', estado: 'N' },
        { id: 71, nombre: 'Mensualidad', estado: 'N' },
        { id: 72, nombre: 'Material', estado: 'N' }
      ]
    },
    {
      id: 25,
      nombre: 'Alejandro José Torres',
      curso: 'Diplomado N5',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 25',
      cargo: 'Estudiante',
      conceptos: [
        { id: 73, nombre: 'Inscripción', estado: 'S' },
        { id: 74, nombre: 'Mensualidad', estado: 'S' },
        { id: 75, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 26,
      nombre: 'Valentina Isabella Morales',
      curso: 'Diplomado N6',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PENDIENTE',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$0',
      aula: 'Aula 26',
      cargo: 'Estudiante',
      conceptos: [
        { id: 76, nombre: 'Inscripción', estado: 'N' },
        { id: 77, nombre: 'Mensualidad', estado: 'N' },
        { id: 78, nombre: 'Material', estado: 'N' }
      ]
    },
    {
      id: 27,
      nombre: 'Emilio José Ríos',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$1000',
      aula: 'Aula 27',
      cargo: 'Estudiante',
      conceptos: [
        { id: 79, nombre: 'Inscripción', estado: 'S' },
        { id: 80, nombre: 'Mensualidad', estado: 'S' },
        { id: 81, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 28,
      nombre: 'Renata Sofía Castro',
      curso: 'Diplomado N5',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 28',
      cargo: 'Estudiante',
      conceptos: [
        { id: 82, nombre: 'Inscripción', estado: 'S' },
        { id: 83, nombre: 'Mensualidad', estado: 'S' },
        { id: 84, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 29,
      nombre: 'Sebastián Alejandro Navarro',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PENDIENTE',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$0',
      aula: 'Aula 29',
      cargo: 'Estudiante',
      conceptos: [
        { id: 85, nombre: 'Inscripción', estado: 'N' },
        { id: 86, nombre: 'Mensualidad', estado: 'N' },
        { id: 87, nombre: 'Material', estado: 'N' }
      ]
    },
    {
      id: 30,
      nombre: 'Regina María Flores',
      curso: 'Diplomado N6',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 30',
      cargo: 'Estudiante',
      conceptos: [
        { id: 88, nombre: 'Inscripción', estado: 'S' },
        { id: 89, nombre: 'Mensualidad', estado: 'S' },
        { id: 90, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 31,
      nombre: 'Adrián José Martínez',
      curso: 'Diplomado N5',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PENDIENTE',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$0',
      aula: 'Aula 31',
      cargo: 'Estudiante',
      conceptos: [
        { id: 91, nombre: 'Inscripción', estado: 'N' },
        { id: 92, nombre: 'Mensualidad', estado: 'N' },
        { id: 93, nombre: 'Material', estado: 'N' }
      ]
    },
    {
      id: 32,
      nombre: 'Natalia Guadalupe Herrera',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$1000',
      aula: 'Aula 32',
      cargo: 'Estudiante',
      conceptos: [
        { id: 94, nombre: 'Inscripción', estado: 'S' },
        { id: 95, nombre: 'Mensualidad', estado: 'S' },
        { id: 96, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 33,
      nombre: 'Diego Antonio Ramírez',
      curso: 'Diplomado N6',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 33',
      cargo: 'Estudiante',
      conceptos: [
        { id: 97, nombre: 'Inscripción', estado: 'S' },
        { id: 98, nombre: 'Mensualidad', estado: 'S' },
        { id: 99, nombre: 'Material', estado: 'S' }
      ]
    },
    {
      id: 34,
      nombre: 'María José Sánchez',
      curso: 'Seminario',
      mensualidad: '$1000',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PENDIENTE',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$0',
      aula: 'Aula 34',
      cargo: 'Estudiante',
      conceptos: [
        { id: 100, nombre: 'Inscripción', estado: 'N' },
        { id: 101, nombre: 'Mensualidad', estado: 'N' },
        { id: 102, nombre: 'Material', estado: 'N' }
      ]
    },
    {
      id: 35,
      nombre: 'Carlos Eduardo Luna',
      curso: 'Diplomado N5',
      mensualidad: '$900',
      pagos: {
        AGO: 'PAGADO',
        SEP: 'PAGADO', 
        OCT: 'PAGADO',
        NOV: 'PAGADO',
        DIC: null,
        ENE: null,
        FEB: null
      },
      fecha: '15/08/2024',
      totalPagado: '$900',
      aula: 'Aula 35',
      cargo: 'Estudiante',
      conceptos: [
        { id: 103, nombre: 'Inscripción', estado: 'S' },
        { id: 104, nombre: 'Mensualidad', estado: 'S' },
        { id: 105, nombre: 'Material', estado: 'S' }
      ]
    }
  ];

  const meses = ['AGO', 'SEP', 'OCT', 'NOV', 'DIC', 'ENE', 'FEB'];

  // Lista de alumnos para el selector
  const alumnos = [
    { id: 1, nombre: 'Sarah Alicia Gutiérrez Hernández' },
    { id: 2, nombre: 'Ian Karim Villalba Romero' },
    { id: 3, nombre: 'Cristian Jair Alcantar Cienfuegos' },
    // ... más alumnos
  ];

  const handleStudentSelect = (id: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedStudents(prev => [...prev, id]);
    } else {
      setSelectedStudents(prev => prev.filter(studentId => studentId !== id));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedStudents(mensualidades.map(mensualidad => mensualidad.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleRegisterPayment = () => {
    if (selectedStudents.length === 1) {
      const selectedStudent = mensualidades.find(m => m.id === selectedStudents[0]);
      if (selectedStudent) {
        // Encontrar el primer mes pendiente
        const primerMesPendiente = meses.find(mes => selectedStudent.pagos[mes] === null);
        
        setPaymentData(prev => ({
          ...prev,
          alumno: selectedStudent.id.toString(),
          monto: selectedStudent.mensualidad.replace('$', ''),
          mes: primerMesPendiente || ''
        }));
        setIsPaymentModalOpen(true);
      }
    }
  };

  const handleEdit = () => {
    if (selectedStudents.length === 1) {
      const selectedStudent = mensualidades.find(m => m.id === selectedStudents[0]);
      if (selectedStudent) {
        // Encontrar el primer mes pagado para editar
        const primerMesPagado = meses.find(mes => selectedStudent.pagos[mes] === 'PAGADO');
        
        setPaymentData(prev => ({
          ...prev,
          alumno: selectedStudent.id.toString(),
          monto: selectedStudent.mensualidad.replace('$', ''),
          mes: primerMesPagado || '',
          concepto: 'Mensualidad',
          metodoPago: 'Efectivo' // Valor por defecto
        }));
        setIsEditing(true);
        setIsPaymentModalOpen(true);
      }
    }
  };

  const handleSavePayment = () => {
    // Aquí iría la lógica para guardar el pago
    console.log('Guardando pago:', paymentData);
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
    // Si no hay filtros activos, mostrar todos los alumnos
    if (Object.keys(activeFilters).length === 0) {
      return true;
    }

    // Aplicar filtros
    return Object.entries(activeFilters).every(([key, value]) => {
      switch (key) {
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

  const handleMensualidadClick = (mensualidad) => {
    setSelectedMensualidad(mensualidad);
    setIsModalOpen(true);
  };

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
                  className="bg-green-700 hover:bg-green-800 text-sm"
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
                            <Badge variant={item.curso.includes('Diplomado') ? 'default' : 'secondary'} className="text-sm">
                        {item.curso}
                      </Badge>
                    </td>
                          <td className="px-3 py-2 text-sm font-semibold text-gray-900">{item.mensualidad}</td>
                    {meses.map(mes => (
                            <td key={mes} className="px-2 py-2 text-center">
                        {item.pagos[mes] === 'PAGADO' && (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white text-sm">
                            PAGADO
                          </Badge>
                        )}
                        {item.pagos[mes] === 'PENDIENTE' && (
                          <Badge variant="destructive" className="text-sm">
                            PENDIENTE
                          </Badge>
                        )}
                        {item.pagos[mes] === null && (
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
