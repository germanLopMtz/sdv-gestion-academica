using sdv_backend.Domain.Enum;

namespace sdv_backend.Data.Entities
{
    public class Mensualidad
    {
        public int Id { get; set; }
        public int AlumnoId { get; set; }
        public Alumno Alumno { get; set; } = null!;
        public Mes Mes { get; set; }
        public int Año { get; set; }
        public decimal Monto { get; set; }
        public EstadoPago Estado { get; set; } = EstadoPago.Pendiente;
        public DateTime? FechaPago { get; set; }
        public ConceptoPago Concepto { get; set; } = ConceptoPago.Mensualidad;
        public MetodoPago MetodoPago { get; set; } = MetodoPago.Efectivo;
        public string? Observaciones { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaActualizacion { get; set; }
    }
}

