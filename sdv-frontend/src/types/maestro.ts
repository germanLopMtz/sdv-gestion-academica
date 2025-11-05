// types/maestro.ts
export interface MaestroDTO {
  nombreCompleto: string;
  fechaNacimiento: string; // ISO date string
  telefono: string;
  correoElectronico: string;
  procedencia: string;
  tipoDeCurso: CursoType;
  modalidad: ModalidadCurso;
  numeroDiplomado?: number;
  contrasena: string;
  direccion: string;
  especialidad: string;
}

export interface MaestroOutPutDTO {
  id: number;
  nombreCompleto: string;
  fechaNacimiento: string; // ISO date string
  telefono: string;
  correoElectronico: string;
  procedencia: string;
  tipoDeCurso: CursoType;
  modalidad: ModalidadCurso;
  numeroDiplomado?: number;
  direccion: string;
  especialidad: string;
  contrasena: string;
}

// Display interface for backward compatibility
export interface Maestro {
  id: number;
  nombre: string;
  curso: string;
  fechaNac: string;
  telefono: string;
  email: string;
  procedencia: string;
  modalidad: string;
}

// Utility functions for mapping between API and display formats
export const mapMaestroToDisplay = (maestro: MaestroOutPutDTO): Maestro => {
  const getCursoName = (tipo: CursoType, numeroDiplomado?: number): string => {
    switch (tipo) {
      case CursoType.Seminario:
        return 'Seminario de Actuación';
      case CursoType.Diplomado:
        return `Diplomado N${numeroDiplomado || ''} - ${maestro.especialidad}`;
      default:
        return 'Sin curso asignado';
    }
  };

  const getModalidadName = (modalidad: ModalidadCurso): string => {
    switch (modalidad) {
      case ModalidadCurso.Presencial:
        return 'presencial';
      case ModalidadCurso.Virtual:
        return 'virtual';
      default:
        return 'sin modalidad';
    }
  };

  return {
    id: maestro.id,
    nombre: maestro.nombreCompleto,
    curso: getCursoName(maestro.tipoDeCurso, maestro.numeroDiplomado),
    fechaNac: maestro.fechaNacimiento,
    telefono: maestro.telefono,
    email: maestro.correoElectronico,
    procedencia: maestro.procedencia,
    modalidad: getModalidadName(maestro.modalidad)
  };
};

// Función para mapear datos originales al formulario de edición
export const mapMaestroToForm = (maestro: MaestroOutPutDTO): any => {
  const getCursoDisplayForForm = (tipo: CursoType, numeroDiplomado?: number): string => {
    switch (tipo) {
      case CursoType.Seminario:
        return 'Seminario de Actuación';
      case CursoType.Diplomado:
        return `Diplomado N${numeroDiplomado || ''} - ${maestro.especialidad}`;
      default:
        return '';
    }
  };

  const getModalidadDisplayForForm = (modalidad: ModalidadCurso): string => {
    switch (modalidad) {
      case ModalidadCurso.Presencial:
        return 'presencial';
      case ModalidadCurso.Virtual:
        return 'virtual';
      default:
        return '';
    }
  };

  // Convertir fecha ISO a formato de input date (YYYY-MM-DD)
  let fechaFormateada = '';
  if (maestro.fechaNacimiento) {
    try {
      const fecha = new Date(maestro.fechaNacimiento);
      fechaFormateada = fecha.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      fechaFormateada = '';
    }
  }

  return {
    nombre: maestro.nombreCompleto || '',
    curso: getCursoDisplayForForm(maestro.tipoDeCurso, maestro.numeroDiplomado),
    fechaNac: fechaFormateada,
    telefono: maestro.telefono || '',
    email: maestro.correoElectronico || '',
    procedencia: maestro.procedencia || '',
    modalidad: getModalidadDisplayForForm(maestro.modalidad),
    direccion: maestro.direccion || '',
    especialidad: maestro.especialidad || '',
    contrasena: maestro.contrasena || '' // Incluir la contraseña del backend
  };
};

export enum CursoType {
  None = 0,
  Seminario = 1,
  Diplomado = 2
}

export enum ModalidadCurso {
  None = 0,
  Presencial = 1,
  Virtual = 2
}