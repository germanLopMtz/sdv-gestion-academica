using sdv_backend.Domain.Enum;

namespace sdv_backend.Domain.DTOs
{
    public class AvisoDTO
    {
        public string Titulo { get; set; } = string.Empty;
   public string Mensaje { get; set; } = string.Empty;
        public DateTime FechaEnvio { get; set; }
        public List<int> MaestroIds { get; set; } = new List<int>(); // IDs de los maestros destinatarios
    }
}