namespace sdv_backend.Domain.DTOs
{
    /// <summary>
    /// DTO para crear o actualizar una mensualidad
    /// </summary>
    public class MensualidadDTO
    {
        /// <summary>
        /// ID del alumno que realiza el pago
 /// </summary>
        public int AlumnoId { get; set; }
        
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
    }
}
