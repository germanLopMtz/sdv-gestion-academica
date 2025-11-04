using Microsoft.SqlServer.Server;
using sdv_backend.Domain.Enum;

namespace sdv_backend.Data.Entities
{
    public class Usuario //Admin y Maestros
    {
        public int Id { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string CorreoElectronico { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public UserType Tipo { get; set; } = UserType.None;
    
        // Campos adicionales para maestros (nullable porque no aplican para admins)
        public DateTime? FechaNacimiento { get; set; }
        public string? Procedencia { get; set; } = string.Empty;
        public CursoType? TipoDeCurso { get; set; } = CursoType.None;
        public ModalidadCurso? Modalidad { get; set; } = ModalidadCurso.None;
        public int? NumeroDiplomado { get; set; }
        public string? Especialidad { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
