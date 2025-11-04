namespace sdv_backend.Data.Entities
{
    public class TimeSlot
    {
        public int Id { get; set; }
        public string StartTime { get; set; } = string.Empty; // Formato "HH:mm" (ej: "15:00")
        public string EndTime { get; set; } = string.Empty;   // Formato "HH:mm" (ej: "17:00")
        public string DisplayName { get; set; } = string.Empty; // Ej: "3:00-5:00 PM"
        
        // Relación con horarios de clase
        public ICollection<ClassSchedule> ClassSchedules { get; set; } = new List<ClassSchedule>();
    }
}

