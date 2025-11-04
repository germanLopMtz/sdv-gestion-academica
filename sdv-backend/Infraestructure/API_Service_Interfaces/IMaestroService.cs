using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.OutPutDTO;
using sdv_backend.Domain.Enum;

namespace sdv_backend.Infraestructure.API_Service_Interfaces
{
    public interface IMaestroService
    {
        Task<MaestroOutPutDTO> CreateAsync(MaestroDTO dto);
        Task<MaestroOutPutDTO?> GetByIdAsync(int id);
        Task<List<MaestroOutPutDTO>> GetAllAsync();
   Task<MaestroOutPutDTO?> UpdateAsync(int id, MaestroDTO dto);
    Task<bool> DeleteAsync(int id);
        Task<List<MaestroOutPutDTO>> GetAvailableMaestrosAsync();
        Task<List<MaestroOutPutDTO>> GetMaestrosByTipoAsync(CursoType tipo);
    }
}