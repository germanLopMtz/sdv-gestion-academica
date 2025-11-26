using sdv_backend.Domain.Enum;

namespace sdv_backend.Domain.OutPutDTO
{
    public class MensualidadOutPutDTO
    {
        public int Id { get; set; }
        public int AlumnoId { get; set; }
        public string AlumnoNombre { get; set; } = string.Empty;
        public string Curso { get; set; } = string.Empty;
        public Mes Mes { get; set; }
        public int Año { get; set; }
        public decimal Monto { get; set; }
        public EstadoPago Estado { get; set; }
        public DateTime? FechaPago { get; set; }
        public ConceptoPago Concepto { get; set; }
        public MetodoPago MetodoPago { get; set; }
        public string? Observaciones { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
    }

    public class MensualidadResumenDTO
    {
        public int AlumnoId { get; set; }
        public string AlumnoNombre { get; set; } = string.Empty;
        public string Curso { get; set; } = string.Empty;
        public decimal MontoMensualidad { get; set; }
        public Dictionary<string, string?> PagosPorMes { get; set; } = new();
        public decimal TotalPagado { get; set; }
    }
}

