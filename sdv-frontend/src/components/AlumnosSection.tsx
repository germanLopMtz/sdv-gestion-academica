import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { alumnosApi } from '@/services/api';

// Mapas para traducir enums del backend a etiquetas legibles
const cursoTypeToLabel: Record<number, string> = {
  1: 'Seminario',
  2: 'Diplomado',
};

const modalidadToLabel: Record<number, string> = {
  1: 'presencial',
  2: 'virtual',
};

const AlumnosSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    curso?: string;
    modalidad?: string;
    procedencia?: string;
  }>({});
  const [filterValues, setFilterValues] = useState({
    curso: '',
    modalidad: '',
    procedencia: ''
  });
  const [newStudent, setNewStudent] = useState({
    nombre: '',
    tipoCurso: '',
    numeroDiplomado: '',
    curso: '',
    fechaNac: '',
    telefono: '',
    email: '',
    procedencia: '',
    modalidad: 'presencial'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTipoCursoChange = (value: string) => {
    setNewStudent(prev => ({
      ...prev,
      tipoCurso: value,
      curso: value === 'Diplomado' ? `Diplomado N${prev.numeroDiplomado}` : 'Seminario',
      numeroDiplomado: value === 'Diplomado' ? prev.numeroDiplomado : ''
    }));
  };

  const handleNumeroDiplomadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewStudent(prev => ({
      ...prev,
      numeroDiplomado: value,
      curso: `Diplomado N${value}`
    }));
  };

  const handleModalidadChange = (value: string) => {
    setNewStudent(prev => ({
      ...prev,
      modalidad: value
    }));
  };

  const handleStudentSelect = (id: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedStudents(prev => [...prev, id]);
      if (selectedStudents.length === 0) {
        // Si es el primer alumno seleccionado, cargar sus datos para edición
        const baseList: any[] = (alumnos.length ? alumnos : alumnosMock);
        const student = baseList.find(a => (a.id ?? a.Id) === id);
        if (student) {
          const cursoStr = student.curso ?? (student.TipoDeCurso === 2 ? 'Diplomado' : (student.TipoDeCurso === 1 ? 'Seminario' : ''));
          const tipoCurso = cursoStr.includes('Diplomado') ? 'Diplomado' : 'Seminario';
          const numeroDiplomado = cursoStr.includes('Diplomado') 
            ? (cursoStr.split('N')[1] ?? '') 
            : '';
          
          const fechaNacStr = student.fechaNac ?? student.FechaNacimiento ?? '';
          let fechaNac = '';
          if (typeof fechaNacStr === 'string' && fechaNacStr.includes('-') && fechaNacStr.length >= 8) {
            const parts = fechaNacStr.includes('T') ? fechaNacStr.split('T')[0].split('-') : fechaNacStr.split('-');
            if (parts.length === 3) {
              const [y, m, d] = parts;
              fechaNac = `${y}-${m}-${d}`;
            }
          }
          const modalidadLabel = typeof student.Modalidad === 'number'
            ? (modalidadToLabel[Number(student.Modalidad)] ?? 'presencial')
            : (student.modalidad ?? 'presencial');
          
          setNewStudent({
            nombre: student.nombre ?? student.NombreCompleto ?? '',
            tipoCurso,
            numeroDiplomado,
            curso: cursoStr,
            fechaNac: fechaNac,
            telefono: student.telefono ?? student.Telefono ?? '',
            email: student.email ?? student.CorreoElectronico ?? '',
            procedencia: student.procedencia ?? student.Procedencia ?? '',
            modalidad: modalidadLabel
          });
        }
      }
    } else {
      setSelectedStudents(prev => prev.filter(studentId => studentId !== id));
      if (selectedStudents.length === 1) {
        // Si era el único alumno seleccionado, limpiar los datos de edición
        setNewStudent({
          nombre: '',
          tipoCurso: '',
          numeroDiplomado: '',
          curso: '',
          fechaNac: '',
          telefono: '',
          email: '',
          procedencia: '',
          modalidad: 'presencial'
        });
      }
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedStudents(filteredAlumnos.map(alumno => alumno.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSubmit = async () => {
    if (isEditing && selectedStudents.length > 0) {
      // Mapear al DTO del backend
      const [year, month, day] = newStudent.fechaNac.split('-');
      const payload = {
        NombreCompleto: newStudent.nombre,
        FechaNacimiento: new Date(`${year}-${month}-${day}`).toISOString(),
        Telefono: newStudent.telefono,
        CorreoElectronico: newStudent.email,
        Procedencia: newStudent.procedencia,
        TipoDeCurso: newStudent.tipoCurso === 'Diplomado' ? 2 : 1,
        Modalidad: newStudent.modalidad === 'virtual' ? 2 : 1,
      };
      try {
        // Suponemos editar el primero seleccionado
        const id = selectedStudents[0];
        await alumnosApi.update(id, payload);
        const res = await alumnosApi.getAll<any[]>();
        setAlumnos(res.data);
      } catch (e) {
        console.error('Error al actualizar', e);
      }
    } else {
      // Convertir la fecha al formato DD-MM-YYYY para guardar
      const [year, month, day] = newStudent.fechaNac.split('-');
      const fechaNacFormateada = `${day}-${month}-${year}`;
      
      const payload = {
        NombreCompleto: newStudent.nombre,
        FechaNacimiento: new Date(`${year}-${month}-${day}`).toISOString(),
        Telefono: newStudent.telefono,
        CorreoElectronico: newStudent.email,
        Procedencia: newStudent.procedencia,
        TipoDeCurso: newStudent.tipoCurso === 'Diplomado' ? 2 : 1,
        Modalidad: newStudent.modalidad === 'virtual' ? 2 : 1,
      };
      try {
        await alumnosApi.create(payload);
        const res = await alumnosApi.getAll<any[]>();
        setAlumnos(res.data);
      } catch (e) {
        console.error('Error al crear alumno', e);
      }
    }
    
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedStudents([]);
    // Resetear el formulario
    setNewStudent({
      nombre: '',
      tipoCurso: '',
      numeroDiplomado: '',
      curso: '',
      fechaNac: '',
      telefono: '',
      email: '',
      procedencia: '',
      modalidad: 'presencial'
    });
  };

  const handleEdit = () => {
    if (selectedStudents.length > 0) {
      const id = selectedStudents[0];
      
      // Buscar en la lista de alumnos del backend o en mock
      const list = (alumnos.length ? alumnos : alumnosMock);
      const student = list.find((a: any) => (a.id ?? a.Id) === id);
      
      if (student) {
        // Obtener tipo de curso
        const tipoDeCursoNum = Number(student.TipoDeCurso ?? student.tipoDeCurso ?? 0);
        const esDiplomado = tipoDeCursoNum === 2;
        const tipoCurso = esDiplomado ? 'Diplomado' : 'Seminario';
        
        // Obtener curso completo
        const cursoStr = student.curso ?? (esDiplomado ? 'Diplomado' : 'Seminario');
        const numeroDiplomado = esDiplomado && cursoStr.includes('N')
          ? (cursoStr.match(/N(\d+)/)?.[1] ?? '')
          : '';
        
        // Manejar fecha - convertir a formato YYYY-MM-DD para input date
        let fechaNac = '';
        const fechaRaw = student.fechaNac ?? student.FechaNacimiento ?? student.fechaNacimiento ?? '';
        if (fechaRaw) {
          try {
            // Si es string ISO, parsearlo
            if (typeof fechaRaw === 'string' && fechaRaw.includes('T')) {
              const date = new Date(fechaRaw);
              const yyyy = String(date.getFullYear());
              const mm = String(date.getMonth() + 1).padStart(2, '0');
              const dd = String(date.getDate()).padStart(2, '0');
              fechaNac = `${yyyy}-${mm}-${dd}`;
            } else if (typeof fechaRaw === 'string' && fechaRaw.includes('-')) {
              // Si viene en formato DD-MM-YYYY o YYYY-MM-DD
              const partes = fechaRaw.split('-');
              if (partes.length === 3) {
                // Detectar formato: si el primer elemento tiene 4 dígitos es YYYY-MM-DD
                if (partes[0].length === 4) {
                  fechaNac = fechaRaw.split('T')[0]; // Ya está en formato correcto
                } else {
                  // Es DD-MM-YYYY, convertir a YYYY-MM-DD
                  const [dd, mm, yyyy] = partes;
                  fechaNac = `${yyyy}-${mm}-${dd}`;
                }
              }
            } else {
              // Intentar parsear como fecha
              const date = new Date(fechaRaw);
              if (!isNaN(date.getTime())) {
                const yyyy = String(date.getFullYear());
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                fechaNac = `${yyyy}-${mm}-${dd}`;
              }
            }
          } catch {
            fechaNac = '';
          }
        }
        
        // Obtener modalidad
        const modalidadNum = Number(student.Modalidad ?? student.modalidad ?? 1);
        const modalidadLabel = typeof student.Modalidad === 'number' || typeof student.modalidad === 'number'
          ? (modalidadToLabel[modalidadNum] ?? 'presencial')
          : (student.modalidad ?? 'presencial');
        
        setNewStudent({
          nombre: student.nombre ?? student.NombreCompleto ?? '',
          tipoCurso,
          numeroDiplomado,
          curso: cursoStr,
          fechaNac: fechaNac,
          telefono: student.telefono ?? student.Telefono ?? '',
          email: student.email ?? student.CorreoElectronico ?? '',
          procedencia: student.procedencia ?? student.Procedencia ?? '',
          modalidad: modalidadLabel
        });
      }
      setIsEditing(true);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async () => {
    try {
      await Promise.all(selectedStudents.map(id => alumnosApi.remove(id)));
      const res = await alumnosApi.getAll<any[]>();
      setAlumnos(res.data);
    } catch (e) {
      console.error('Error al eliminar alumnos', e);
    } finally {
      setSelectedStudents([]);
      setIsDeleteModalOpen(false);
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
      curso: '',
      modalidad: '',
      procedencia: ''
    });
  };
  
  const [alumnos, setAlumnos] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await alumnosApi.getAll<any[]>();
        setAlumnos(res.data);
      } catch (e) {
        console.error('Error al cargar alumnos', e);
      }
    })();
  }, []);

  const alumnosMock = [
    {
      id: 1,
      nombre: 'Sarah Alicia Gutiérrez Hernández',
      curso: 'Diplomado N6',
      fechaNac: '20-08-2024',
      telefono: '52 6647443607',
      email: 'sarahly2008@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 2,
      nombre: 'Ian Karim Villalba Romero',
      curso: 'Seminario',
      fechaNac: '27-07-2004',
      telefono: '52 6622335646',
      email: 'iankarimromero@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 3,
      nombre: 'Cristian Jair Alcantar Cienfuegos',
      curso: 'Seminario',
      fechaNac: '07-07-2004',
      telefono: '52 6624622545',
      email: 'cristron2014@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'virtual'
    },
    {
      id: 4,
      nombre: 'Emmanuel Mizques Martínez',
      curso: 'Diplomado N5',
      fechaNac: '12-05-2007',
      telefono: '52 6625458796',
      email: 'emmanuelmizq@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 5,
      nombre: 'Aaron Jesús Ramos García',
      curso: 'Diplomado N5',
      fechaNac: '24-12-2002',
      telefono: '52 6425487965',
      email: 'aaronplayer2@gmail.com',
      procedencia: 'Navojoa, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 6,
      nombre: 'María Fernanda López Torres',
      curso: 'Diplomado N6',
      fechaNac: '15-03-2003',
      telefono: '52 6621234567',
      email: 'maria.lopez@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'virtual'
    },
    {
      id: 7,
      nombre: 'Carlos Eduardo Mendoza Ruiz',
      curso: 'Seminario',
      fechaNac: '08-09-2005',
      telefono: '52 6629876543',
      email: 'carlos.mendoza@gmail.com',
      procedencia: 'Guaymas, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 8,
      nombre: 'Ana Sofía Valenzuela Díaz',
      curso: 'Diplomado N5',
      fechaNac: '22-11-2004',
      telefono: '52 6624567890',
      email: 'ana.valenzuela@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'virtual'
    },
    {
      id: 9,
      nombre: 'Diego Alejandro Soto Vega',
      curso: 'Seminario',
      fechaNac: '30-01-2006',
      telefono: '52 6623456789',
      email: 'diego.soto@gmail.com',
      procedencia: 'Ciudad Obregón, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 10,
      nombre: 'Valeria Guadalupe Morales',
      curso: 'Diplomado N6',
      fechaNac: '14-07-2003',
      telefono: '52 6622345678',
      email: 'valeria.morales@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 11,
      nombre: 'José Manuel Ríos Ortega',
      curso: 'Diplomado N5',
      fechaNac: '05-04-2005',
      telefono: '52 6623456789',
      email: 'jose.rios@gmail.com',
      procedencia: 'Navojoa, Son. MX',
      modalidad: 'virtual'
    },
    {
      id: 12,
      nombre: 'Laura Patricia Castro Luna',
      curso: 'Seminario',
      fechaNac: '18-12-2004',
      telefono: '52 6624567890',
      email: 'laura.castro@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 13,
      nombre: 'Roberto Carlos Navarro',
      curso: 'Diplomado N6',
      fechaNac: '25-06-2003',
      telefono: '52 6625678901',
      email: 'roberto.navarro@gmail.com',
      procedencia: 'Guaymas, Son. MX',
      modalidad: 'virtual'
    },
    {
      id: 14,
      nombre: 'Gabriela Alejandra Torres',
      curso: 'Seminario',
      fechaNac: '09-02-2005',
      telefono: '52 6626789012',
      email: 'gabriela.torres@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 15,
      nombre: 'Miguel Ángel Flores',
      curso: 'Diplomado N5',
      fechaNac: '12-08-2004',
      telefono: '52 6627890123',
      email: 'miguel.flores@gmail.com',
      procedencia: 'Ciudad Obregón, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 16,
      nombre: 'Isabella Martínez Ríos',
      curso: 'Diplomado N6',
      fechaNac: '03-05-2003',
      telefono: '52 6628901234',
      email: 'isabella.martinez@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'virtual'
    },
    {
      id: 17,
      nombre: 'Fernando Daniel Herrera',
      curso: 'Seminario',
      fechaNac: '28-10-2005',
      telefono: '52 6629012345',
      email: 'fernando.herrera@gmail.com',
      procedencia: 'Navojoa, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 18,
      nombre: 'Camila Sofía Ramírez',
      curso: 'Diplomado N5',
      fechaNac: '17-01-2004',
      telefono: '52 6620123456',
      email: 'camila.ramirez@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'virtual'
    },
    {
      id: 19,
      nombre: 'Juan Pablo Sánchez',
      curso: 'Seminario',
      fechaNac: '21-03-2006',
      telefono: '52 6621234567',
      email: 'juan.sanchez@gmail.com',
      procedencia: 'Guaymas, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 20,
      nombre: 'Daniela Alejandra Luna',
      curso: 'Diplomado N6',
      fechaNac: '07-09-2003',
      telefono: '52 6622345678',
      email: 'daniela.luna@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 21,
      nombre: 'Luis Enrique Vega',
      curso: 'Diplomado N5',
      fechaNac: '15-11-2004',
      telefono: '52 6623456789',
      email: 'luis.vega@gmail.com',
      procedencia: 'Ciudad Obregón, Son. MX',
      modalidad: 'virtual'
    },
    {
      id: 22,
      nombre: 'Mariana Guadalupe Ortega',
      curso: 'Seminario',
      fechaNac: '29-07-2005',
      telefono: '52 6624567890',
      email: 'mariana.ortega@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 23,
      nombre: 'Ricardo Antonio Díaz',
      curso: 'Diplomado N6',
      fechaNac: '11-04-2003',
      telefono: '52 6625678901',
      email: 'ricardo.diaz@gmail.com',
      procedencia: 'Navojoa, Son. MX',
      modalidad: 'virtual'
    },
    {
      id: 24,
      nombre: 'Sofía Valentina Ruiz',
      curso: 'Seminario',
      fechaNac: '24-12-2004',
      telefono: '52 6626789012',
      email: 'sofia.ruiz@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 25,
      nombre: 'Alejandro José Torres',
      curso: 'Diplomado N5',
      fechaNac: '06-02-2005',
      telefono: '52 6627890123',
      email: 'alejandro.torres@gmail.com',
      procedencia: 'Guaymas, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 26,
      nombre: 'Valentina Isabella Morales',
      curso: 'Diplomado N6',
      fechaNac: '19-08-2003',
      telefono: '52 6628901234',
      email: 'valentina.morales@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'virtual'
    },
    {
      id: 27,
      nombre: 'Emilio José Ríos',
      curso: 'Seminario',
      fechaNac: '02-05-2004',
      telefono: '52 6629012345',
      email: 'emilio.rios@gmail.com',
      procedencia: 'Ciudad Obregón, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 28,
      nombre: 'Renata Sofía Castro',
      curso: 'Diplomado N5',
      fechaNac: '13-10-2005',
      telefono: '52 6620123456',
      email: 'renata.castro@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'virtual'
    },
    {
      id: 29,
      nombre: 'Sebastián Alejandro Navarro',
      curso: 'Seminario',
      fechaNac: '26-01-2004',
      telefono: '52 6621234567',
      email: 'sebastian.navarro@gmail.com',
      procedencia: 'Navojoa, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 30,
      nombre: 'Regina María Flores',
      curso: 'Diplomado N6',
      fechaNac: '09-03-2006',
      telefono: '52 6622345678',
      email: 'regina.flores@gmail.com',
      procedencia: 'Hermosillo, Son. MX',
      modalidad: 'presencial'
    },
    {
      id: 31,
      nombre: 'Adrián José Martínez',
      curso: 'Diplomado N5',
      fechaNac: '22-09-2003',
      telefono: '52 6623456789',
      email: 'adrian.martinez@gmail.com',
      procedencia: 'Guaymas, Son. MX',
      modalidad: 'virtual'
    },
    
  ];

  const list = (alumnos.length ? alumnos : alumnosMock);
  const normalized = list.map((alumno: any) => {
    const id = alumno.id ?? alumno.Id ?? alumno.alumnoId ?? alumno.AlumnoId;
    const tipoDeCursoNum = Number(alumno.TipoDeCurso ?? alumno.tipoDeCurso ?? alumno.cursoTipo ?? alumno.curso_type);
    const modalidadNum = Number(alumno.Modalidad ?? alumno.modalidad);
    const nombre = alumno.nombre ?? alumno.NombreCompleto ?? alumno.nombreCompleto ?? '';
    const curso = alumno.curso ?? (cursoTypeToLabel[tipoDeCursoNum] ?? '');
    const fechaNacIso = alumno.fechaNac ?? alumno.FechaNacimiento ?? alumno.fechaNacimiento ?? '';
    let fechaNac = '';
    if (fechaNacIso) {
      try {
        const date = new Date(fechaNacIso);
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        fechaNac = `${dd}-${mm}-${yyyy}`;
      } catch {
        fechaNac = String(fechaNacIso);
      }
    }
    const telefono = alumno.telefono ?? alumno.Telefono ?? '';
    const email = alumno.email ?? alumno.CorreoElectronico ?? alumno.correoElectronico ?? '';
    const procedencia = alumno.procedencia ?? alumno.Procedencia ?? alumno.procedencia ?? '';
    const modalidad = typeof alumno.modalidad === 'number'
      ? (modalidadToLabel[modalidadNum] ?? String(alumno.modalidad))
      : (alumno.modalidad ?? (modalidadToLabel[modalidadNum] ?? ''));
    return { id, nombre, curso, fechaNac, telefono, email, procedencia, modalidad };
  });

  const filteredAlumnos = normalized.filter(alumno => {
    const matchesSearch = searchTerm === '' || 
      (alumno.nombre ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alumno.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alumno.curso ?? '').toLowerCase().includes(searchTerm.toLowerCase());

    // Si no hay filtros activos, solo aplicar búsqueda
    if (Object.keys(activeFilters).length === 0) {
      return matchesSearch;
    }

    // Aplicar filtros y búsqueda
    const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
      switch (key) {
        case 'curso':
          return alumno.curso === value;
        case 'modalidad':
          return alumno.modalidad === value;
        case 'procedencia':
          return alumno.procedencia === value;
        default:
          return true;
      }
    });

    return matchesSearch && matchesFilters;
  });

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Lizzy Hernández</h2>
              <p className="text-gray-600 mt-1">Coordinadora</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="text-center sm:text-right">
                <p className="text-sm text-gray-500">Total de Alumnos</p>
                <p className="text-2xl font-bold text-blue-600">{alumnos.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg p-3 sm:p-6">
            <CardTitle className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex items-center space-x-3 justify-center lg:justify-start">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-lg sm:text-xl">Gestión de Alumnos</span>
              </div>
              
              <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
                <div className="text-center lg:text-right">
                  <span className="text-xs sm:text-sm text-white/80">
                    {filteredAlumnos.length} {filteredAlumnos.length === 1 ? 'alumno' : 'alumnos'} mostrados
                  </span>
      </div>

                {/* Botones reorganizados para móvil */}
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 lg:flex-row">
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[40px] touch-target"
                      onClick={() => {
                        setIsEditing(false);
                        setIsModalOpen(true);
                      }}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                      <span className="hidden sm:inline">AGREGAR</span>
                      <span className="sm:hidden">AGREGAR</span>
              </Button>
                    
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="bg-white/20 hover:bg-white/30 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[40px] touch-target"
                      onClick={handleEdit}
                      disabled={selectedStudents.length !== 1}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                      <span className="hidden sm:inline">EDITAR</span>
                      <span className="sm:hidden">EDITAR</span>
              </Button>
                    
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[40px] touch-target"
                      onClick={() => setIsDeleteModalOpen(true)}
                      disabled={selectedStudents.length === 0}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                      <span className="hidden sm:inline">ELIMINAR</span>
                      <span className="sm:hidden">ELIMINAR</span>
              </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-white/20 hover:bg-white/30 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[40px] touch-target"
                      onClick={() => setIsFilterModalOpen(true)}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                      <span className="hidden sm:inline">FILTRAR</span>
                      <span className="sm:hidden">FILTRAR</span>
              </Button>
                  </div>
                </div>
            </div>
          </CardTitle>
        </CardHeader>
          
        <CardContent className="p-0">
            <div className="p-3 sm:p-6 bg-gray-50 border-b">
              <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-full sm:max-w-sm">
              <Input
                placeholder="Buscar alumno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
          </div>
          
                {/* Filtros activos */}
                {Object.keys(activeFilters).length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-600">Filtros activos:</span>
                    {Object.entries(activeFilters).map(([key, value]) => (
                      <Badge 
                        key={key}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        <span className="capitalize">{key}: {value}</span>
                        <button
                          onClick={() => handleFilterChange(key, '')}
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
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Limpiar todos
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative">
          <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <div className="max-h-[600px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedStudents.length === filteredAlumnos.length && filteredAlumnos.length > 0}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                              />
                  </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Nombre completo</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Curso</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Fecha nac.</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Teléfono</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Correo</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Procedencia</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Modalidad</th>
                </tr>
              </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {filteredAlumnos.map((alumno) => (
                            <tr key={alumno.id} className="hover:bg-blue-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={selectedStudents.includes(alumno.id)}
                                  onChange={(e) => handleStudentSelect(alumno.id, e.target.checked)}
                                />
                    </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <span className="text-sm font-medium text-blue-600">
                                      {alumno.nombre.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{alumno.nombre}</span>
                                </div>
                    </td>
                              <td className="px-6 py-4">
                                <Badge 
                                  variant={alumno.curso.includes('Diplomado') ? 'default' : 'secondary'}
                                  className="px-3 py-1 rounded-full"
                                >
                        {alumno.curso}
                      </Badge>
                    </td>
                              <td className="px-6 py-4 text-sm text-gray-700">{alumno.fechaNac}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{alumno.telefono}</td>
                              <td className="px-6 py-4">
                                <a 
                                  href={`mailto:${alumno.email}`}
                                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                >
                                  {alumno.email}
                                </a>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">{alumno.procedencia}</td>
                              <td className="px-6 py-4">
                                <Badge 
                                  variant={alumno.modalidad === 'presencial' ? 'default' : 'outline'}
                                  className="px-3 py-1 rounded-full capitalize"
                                >
                                  {alumno.modalidad}
                                </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </CardContent>
      </Card>

        {/* Modal de confirmación de eliminación */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">Confirmar Eliminación</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                ¿Está seguro que desea eliminar {selectedStudents.length} {selectedStudents.length === 1 ? 'alumno' : 'alumnos'} seleccionado{selectedStudents.length === 1 ? '' : 's'}?
                Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal para agregar/editar alumno */}
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            // Limpiar formulario al cerrar
            setIsEditing(false);
            setSelectedStudents([]);
            setNewStudent({
              nombre: '',
              tipoCurso: '',
              numeroDiplomado: '',
              curso: '',
              fechaNac: '',
              telefono: '',
              email: '',
              procedencia: '',
              modalidad: 'presencial'
            });
          }
        }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">
                {isEditing ? 'Editar Alumno' : 'Agregar Nuevo Alumno'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={newStudent.nombre}
                    onChange={handleInputChange}
                    placeholder="Ingrese el nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoCurso">Tipo de Curso</Label>
                  <Select
                    value={newStudent.tipoCurso}
                    onValueChange={handleTipoCursoChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo de curso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Seminario">Seminario</SelectItem>
                      <SelectItem value="Diplomado">Diplomado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newStudent.tipoCurso === 'Diplomado' && (
                <div className="space-y-2">
                  <Label htmlFor="numeroDiplomado">Número de Diplomado</Label>
                  <Input
                    id="numeroDiplomado"
                    name="numeroDiplomado"
                    value={newStudent.numeroDiplomado}
                    onChange={handleNumeroDiplomadoChange}
                    placeholder="Ingrese el número del diplomado"
                    type="number"
                    min="1"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaNac">Fecha de nacimiento</Label>
                  <Input
                    id="fechaNac"
                    name="fechaNac"
                    type="date"
                    value={newStudent.fechaNac}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={newStudent.telefono}
                    onChange={handleInputChange}
                    placeholder="52 6621234567"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newStudent.email}
                    onChange={handleInputChange}
                    placeholder="ejemplo@correo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="procedencia">Procedencia</Label>
                  <Input
                    id="procedencia"
                    name="procedencia"
                    value={newStudent.procedencia}
                    onChange={handleInputChange}
                    placeholder="Ciudad, Estado"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Modalidad del curso</Label>
                <RadioGroup
                  value={newStudent.modalidad}
                  onValueChange={handleModalidadChange}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="presencial" id="presencial" />
                    <Label htmlFor="presencial">Presencial</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="virtual" id="virtual" />
                    <Label htmlFor="virtual">Virtual</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                  setSelectedStudents([]);
                  setNewStudent({
                    nombre: '',
                    tipoCurso: '',
                    numeroDiplomado: '',
                    curso: '',
                    fechaNac: '',
                    telefono: '',
                    email: '',
                    procedencia: '',
                    modalidad: 'presencial'
                  });
                }}
                className="border-gray-300 hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setSelectedStudents([]);
                    setNewStudent({
                      nombre: '',
                      tipoCurso: '',
                      numeroDiplomado: '',
                      curso: '',
                      fechaNac: '',
                      telefono: '',
                      email: '',
                      procedencia: '',
                      modalidad: 'presencial'
                    });
                  }}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isEditing ? 'Guardar Cambios' : 'Agregar'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de filtros */}
        <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">Filtrar Alumnos</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Seleccione los criterios de filtrado para los alumnos
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="curso">Tipo de Curso</Label>
                  <Select
                    value={filterValues.curso}
                    onValueChange={(value) => handleFilterChange('curso', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el curso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Seminario">Seminario</SelectItem>
                      <SelectItem value="Diplomado N5">Diplomado N5</SelectItem>
                      <SelectItem value="Diplomado N6">Diplomado N6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modalidad">Modalidad</Label>
                  <Select
                    value={filterValues.modalidad}
                    onValueChange={(value) => handleFilterChange('modalidad', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="procedencia">Procedencia</Label>
                <Select
                  value={filterValues.procedencia}
                  onValueChange={(value) => handleFilterChange('procedencia', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione la ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hermosillo, Son. MX">Hermosillo</SelectItem>
                    <SelectItem value="Navojoa, Son. MX">Navojoa</SelectItem>
                    <SelectItem value="Guaymas, Son. MX">Guaymas</SelectItem>
                    <SelectItem value="Ciudad Obregón, Son. MX">Ciudad Obregón</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
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
      </div>
    </div>
  );
};

export default AlumnosSection;
