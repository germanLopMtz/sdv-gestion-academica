using sdv_backend.Domain.Enum;

namespace sdv_backend.Data.Entities
{
    public class Aviso
    {
   public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime FechaEnvio { get; set; }
        public EstadoAviso Estado { get; set; } = EstadoAviso.Programado;
        public int UsuarioCreadorId { get; set; } // Usuario que creó el aviso
        
  // Navegación
        public Usuario UsuarioCreador { get; set; } = null!;
        public List<AvisoDestinatario> Destinatarios { get; set; } = new List<AvisoDestinatario>();
    }
}