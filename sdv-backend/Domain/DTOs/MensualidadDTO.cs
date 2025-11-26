using sdv_backend.Domain.Enum;

namespace sdv_backend.Domain.DTOs
{
    public class MensualidadDTO
    {
        public int AlumnoId { get; set; }
        public Mes Mes { get; set; }
        public int Año { get; set; }
        public decimal Monto { get; set; }
        public EstadoPago Estado { get; set; } = EstadoPago.Pendiente;
        public DateTime? FechaPago { get; set; }
        public ConceptoPago Concepto { get; set; } = ConceptoPago.Mensualidad;
        public MetodoPago MetodoPago { get; set; } = MetodoPago.Efectivo;
        public string? Observaciones { get; set; }
    }
}

