namespace sdv_backend.Data.Entities
{
    public class ClassStudent
    {
        public int Id { get; set; }
        
        public int ClassScheduleId { get; set; }
        public ClassSchedule ClassSchedule { get; set; } = null!;
        
        public int AlumnoId { get; set; }
        public Alumno Alumno { get; set; } = null!;
        
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    }
}

