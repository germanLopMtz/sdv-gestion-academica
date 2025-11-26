using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.Enum;
using sdv_backend.Domain.OutPutDTO;

namespace sdv_backend.Infraestructure.API_Service_Interfaces
{
    public interface IAvisoService
    {
        Task<AvisoOutPutDTO> CreateAsync(AvisoDTO dto, int usuarioCreadorId);
  Task<AvisoOutPutDTO?> GetByIdAsync(int id);
    Task<List<AvisoOutPutDTO>> GetAllAsync();
   Task<List<AvisoOutPutDTO>> GetByEstadoAsync(EstadoAviso estado);
        Task<List<AvisoOutPutDTO>> GetByMaestroAsync(int maestroId);
   Task<AvisoOutPutDTO?> UpdateAsync(int id, AvisoDTO dto);
        Task<bool> DeleteAsync(int id);
    Task<bool> EnviarAvisoAsync(int avisoId, int usuarioId);
Task<bool> CancelarAvisoAsync(int avisoId);
        Task<bool> MarcarComoLeidoAsync(int avisoId, int maestroId);
        Task<List<AvisoOutPutDTO>> SearchAsync(string searchTerm);
    }
}