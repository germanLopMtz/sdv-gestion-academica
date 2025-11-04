using sdv_backend.Domain.Enum;

namespace sdv_backend.Domain.DTOs
{
    public class ClassScheduleDTO
    {
        public int RoomId { get; set; }
        public int TimeSlotId { get; set; }
        public int MaestroId { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public ModalidadCurso Modalidad { get; set; }
        public CursoType TipoDeCurso { get; set; }
        public List<int> AlumnoIds { get; set; } = new List<int>();
    }
}

