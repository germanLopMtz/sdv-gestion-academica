namespace sdv_backend.Data.Entities
{
    /// <summary>
    /// Representa un pago de mensualidad realizado por un alumno
  /// </summary>
    public class Mensualidad
{
        public int Id { get; set; }
        
        /// <summary>
        /// ID del alumno que realiza el pago
        /// </summary>
  public int AlumnoId { get; set; }
        public Alumno Alumno { get; set; } = null!;
        
        /// <summary>
        /// Fecha en que se realizó el pago
  /// </summary>
 public DateTime FechaPago { get; set; }
        
  /// <summary>
    /// Monto del pago en pesos
        /// </summary>
        public decimal Monto { get; set; }
      
        /// <summary>
        /// Concepto del pago (Inscripción, Mensualidad, Material, Otro)
    /// </summary>
        public string Concepto { get; set; } = string.Empty;
        
        /// <summary>
        /// Mes al que corresponde el pago (AGO, SEP, OCT, NOV, DIC, ENE, FEB)
   /// </summary>
      public string Mes { get; set; } = string.Empty;
        
        /// <summary>
        /// Método de pago (Efectivo, Transferencia, Tarjeta, Otro)
        /// </summary>
   public string MetodoPago { get; set; } = string.Empty;
      
        /// <summary>
        /// Estado del pago (PAGADO, PENDIENTE)
        /// </summary>
        public string EstadoPago { get; set; } = "PENDIENTE";
        
  /// <summary>
    /// Observaciones adicionales sobre el pago
        /// </summary>
        public string? Observaciones { get; set; }
     
        /// <summary>
        /// Fecha de creación del registro
        /// </summary>
   public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// Fecha de última modificación
        /// </summary>
        public DateTime? UpdatedAt { get; set; }
    }
}
