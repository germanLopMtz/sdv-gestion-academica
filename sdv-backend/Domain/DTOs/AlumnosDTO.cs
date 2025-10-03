using sdv_backend.Domain.Enum;

namespace sdv_backend.Domain.DTOs
{
    public class AlumnosDTO
    {
        // Datos generales
        public string NombreCompleto { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
        public string Telefono { get; set; } = string.Empty;
        public string CorreoElectronico { get; set; } = string.Empty;
        public string Procedencia { get; set; } = string.Empty; // Ciudad, Estado

        // Datos académicos
        public CursoType TipoDeCurso { get; set; } = CursoType.None;
        public ModalidadCurso Modalidad { get; set; } = ModalidadCurso.None;
    }
}
