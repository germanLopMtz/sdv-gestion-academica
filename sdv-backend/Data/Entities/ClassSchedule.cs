using sdv_backend.Domain.Enum;

namespace sdv_backend.Data.Entities
{
    public class ClassSchedule
    {
        public int Id { get; set; }
        
        // Relaciones con entidades existentes
        public int RoomId { get; set; }
        public Room Room { get; set; } = null!;
        
        public int TimeSlotId { get; set; }
        public TimeSlot TimeSlot { get; set; } = null!;
        
        public int MaestroId { get; set; } // FK a Usuario con Tipo = Maestro
        public Usuario Maestro { get; set; } = null!;
        
        // Datos de la clase
        public Dias DayOfWeek { get; set; }
        public ModalidadCurso Modalidad { get; set; }
        public CursoType TipoDeCurso { get; set; }
        
        // Relación con alumnos
        public ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

