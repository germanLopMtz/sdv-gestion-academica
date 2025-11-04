namespace sdv_backend.Data.Entities
{
    public class Room
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        
        // Relación con horarios de clase
        public ICollection<ClassSchedule> ClassSchedules { get; set; } = new List<ClassSchedule>();
    }
}

