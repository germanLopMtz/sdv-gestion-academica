using sdv_backend.Domain.Enum;

namespace sdv_backend.Domain.OutPutDTO
{
    public class ClassScheduleOutPutDTO
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public int TimeSlotId { get; set; }
        public string TimeSlotDisplay { get; set; } = string.Empty;
        public int MaestroId { get; set; }
        public string MaestroName { get; set; } = string.Empty;
        public Dias DayOfWeek { get; set; }
        public string DayOfWeekDisplay { get; set; } = string.Empty;
        public ModalidadCurso Modalidad { get; set; }
        public string ModalidadDisplay { get; set; } = string.Empty;
        public CursoType TipoDeCurso { get; set; }
        public string TipoDeCursoDisplay { get; set; } = string.Empty;
        public List<ClassStudentOutPutDTO> Alumnos { get; set; } = new List<ClassStudentOutPutDTO>();
        public int CurrentCapacity { get; set; }
        public int MaxCapacity { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
    public class ClassStudentOutPutDTO
    {
        public int Id { get; set; }
        public int AlumnoId { get; set; }
        public string AlumnoName { get; set; } = string.Empty;
        public DateTime EnrolledAt { get; set; }
    }
}

