using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum;
using sdv_backend.Domain.OutPutDTO;

namespace sdv_backend.Infraestructure.API_Service_Interfaces
{
    public interface IMensualidadService
    {
        Task<MensualidadOutPutDTO> CreateAsync(MensualidadDTO dto);
        Task<MensualidadOutPutDTO?> GetByIdAsync(int id);
        Task<List<MensualidadOutPutDTO>> GetAllAsync();
        Task<List<MensualidadResumenDTO>> GetResumenAsync(int? año = null);
        Task<List<MensualidadOutPutDTO>> GetByAlumnoAsync(int alumnoId, int? año = null);
        Task<List<MensualidadOutPutDTO>> GetByMesAsync(Mes mes, int año);
        Task<List<MensualidadOutPutDTO>> GetByEstadoAsync(EstadoPago estado, int? año = null);
        Task<MensualidadOutPutDTO?> UpdateAsync(int id, MensualidadDTO dto);
        Task<bool> DeleteAsync(int id);
        Task<List<MensualidadOutPutDTO>> BuscarAsync(string searchTerm);
    }
}

