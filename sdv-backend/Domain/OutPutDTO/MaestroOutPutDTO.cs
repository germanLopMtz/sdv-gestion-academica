using sdv_backend.Domain.Enum;

namespace sdv_backend.Domain.OutPutDTO
{
    public class MaestroOutPutDTO
    {
        public int Id { get; set; }

        // Datos generales
        public string NombreCompleto { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
     public string Telefono { get; set; } = string.Empty;
        public string CorreoElectronico { get; set; } = string.Empty;
        public string Procedencia { get; set; } = string.Empty; // Ciudad, Estado

        // Datos académicos
    public CursoType TipoDeCurso { get; set; } = CursoType.None;
        
        // Datos adicionales específicos para maestros
        public string Direccion { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}