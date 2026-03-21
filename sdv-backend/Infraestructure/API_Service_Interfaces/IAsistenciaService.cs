using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.OutPutDTO;

namespace sdv_backend.Infraestructure.API_Service_Interfaces
{
    public interface IAsistenciaService
    {
        Task<AsistenciaOutPutDTO> RegistrarAsistenciaAsync(AsistenciaDTO dto);
        Task<AsistenciaOutPutDTO?> GetByClaseYFechaAsync(int classScheduleId, DateTime fecha);
        Task<List<AsistenciaOutPutDTO>> GetByClaseAsync(int classScheduleId);
        Task<List<StudentAttendanceDTO>> GetAlumnosByClaseAsync(int classScheduleId);
        Task<List<HistorialAsistenciaDTO>> GetHistorialByClaseAsync(int classScheduleId);
    }
}
