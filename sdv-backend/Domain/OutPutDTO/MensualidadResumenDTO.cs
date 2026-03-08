namespace sdv_backend.Domain.OutPutDTO
{
/// <summary>
    /// DTO con resumen de pagos mensuales por alumno
    /// </summary>
    public class MensualidadResumenDTO
    {
        public int AlumnoId { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string Curso { get; set; } = string.Empty;
        public decimal Mensualidad { get; set; }
        
        /// <summary>
        /// Diccionario de pagos por mes: Clave=Mes (AGO,SEP,etc), Valor=Estado (PAGADO, PENDIENTE, null)
        /// </summary>
        public Dictionary<string, string?> Pagos { get; set; } = new();

        /// <summary>
        /// Diccionario con el ID del registro de mensualidad por mes (para edición)
        /// </summary>
        public Dictionary<string, int> RegistrosPorMes { get; set; } = new();
        
      public decimal TotalPagado { get; set; }
  public string? Aula { get; set; }
    }
}
