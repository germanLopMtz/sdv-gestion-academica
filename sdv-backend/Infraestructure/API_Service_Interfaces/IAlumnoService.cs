using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.OutPutDTO;
using sdv_backend.Domain.Enum;

namespace sdv_backend.Infraestructure.API_Service_Interfaces
{
    public interface IAlumnoService
    {
        Task<AlumnoOutPutDTO> CreateAsync(AlumnosDTO dto);
        Task<AlumnoOutPutDTO?> GetByIdAsync(int id);
        Task<List<AlumnoOutPutDTO>> GetAllAsync();
        Task<AlumnoOutPutDTO?> UpdateAsync(int id, AlumnosDTO dto);
        Task<bool> DeleteAsync(int id);
        Task<List<AlumnoOutPutDTO>> GetAvailableAlumnosAsync();
        Task<List<AlumnoOutPutDTO>> GetAlumnosByTipoAsync(CursoType tipo);
    }
}
