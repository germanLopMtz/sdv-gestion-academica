using System.Text.Json.Serialization;
using sdv_backend.Domain.Enum;

namespace sdv_backend.Domain.DTOs
{
    public class ClassScheduleDTO
    {
        [JsonRequired]
        public int RoomId { get; set; }
        [JsonRequired]
        public int TimeSlotId { get; set; }
        [JsonRequired]
        public int MaestroId { get; set; }
        [JsonRequired]
        public Dias DayOfWeek { get; set; }
        [JsonRequired]
        public ModalidadCurso Modalidad { get; set; }
        [JsonRequired]
        public CursoType TipoDeCurso { get; set; }
        public List<int> AlumnoIds { get; set; } = new List<int>();
    }
}

