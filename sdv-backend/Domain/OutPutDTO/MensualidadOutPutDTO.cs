namespace sdv_backend.Domain.OutPutDTO
{
    /// <summary>
    /// DTO de salida para mensualidades
    /// </summary>
    public class MensualidadOutPutDTO
    {
        public int Id { get; set; }
        public int AlumnoId { get; set; }
        public string AlumnoNombre { get; set; } = string.Empty;
     public string AlumnoCurso { get; set; } = string.Empty;
        public DateTime FechaPago { get; set; }
  public decimal Monto { get; set; }
    public string Concepto { get; set; } = string.Empty;
   public string Mes { get; set; } = string.Empty;
     public string MetodoPago { get; set; } = string.Empty;
        public string EstadoPago { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
