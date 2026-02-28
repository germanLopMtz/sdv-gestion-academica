using sdv_backend.Domain.Enum;

namespace sdv_backend.Domain.DTOs
{
    public class MaestroDTO
    {
        // Datos generales
        public string NombreCompleto { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
        public string Telefono { get; set; } = string.Empty;
        public string CorreoElectronico { get; set; } = string.Empty;
        public string Procedencia { get; set; } = string.Empty; // Ciudad, Estado

 // Datos acad�micos
        public CursoType TipoDeCurso { get; set; } = CursoType.None;
     
        // Datos adicionales espec�ficos para maestros (que necesitan para ser usuarios del sistema)
        public string Contrasena { get; set; } = string.Empty;
   public string Direccion { get; set; } = string.Empty;
    }
}