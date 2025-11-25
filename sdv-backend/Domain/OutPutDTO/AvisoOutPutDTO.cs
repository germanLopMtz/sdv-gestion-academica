using sdv_backend.Domain.Enum;

namespace sdv_backend.Domain.OutPutDTO
{
   public class AvisoOutPutDTO
    {
   public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
      public string Mensaje { get; set; } = string.Empty;
   public DateTime FechaCreacion { get; set; }
        public DateTime FechaEnvio { get; set; }
  public EstadoAviso Estado { get; set; }
   public string EstadoDisplay { get; set; } = string.Empty;
        public int UsuarioCreadorId { get; set; }
   public string UsuarioCreadorNombre { get; set; } = string.Empty;
    public List<AvisoDestinatarioOutPutDTO> Destinatarios { get; set; } = new List<AvisoDestinatarioOutPutDTO>();
    }
    
    public class AvisoDestinatarioOutPutDTO
    {
     public int Id { get; set; }
 public int MaestroId { get; set; }
   public string MaestroNombre { get; set; } = string.Empty;
  public bool Leido { get; set; }
        public DateTime? FechaLectura { get; set; }
    }
}