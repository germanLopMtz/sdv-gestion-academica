namespace sdv_backend.Data.Entities
{
    public class AvisoDestinatario
   {
        public int Id { get; set; }
        public int AvisoId { get; set; }
        public int MaestroId { get; set; }
   public bool Leido { get; set; } = false;
        public DateTime? FechaLectura { get; set; }
        
      // Navegación
  public Aviso Aviso { get; set; } = null!;
  public Usuario Maestro { get; set; } = null!;
    }
}