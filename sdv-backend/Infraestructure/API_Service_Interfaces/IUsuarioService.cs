using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.OutPutDTO;

namespace sdv_backend.Infraestructure.API_Service_Interfaces
{
    public interface IUsuarioService
    {
        Task<UsuarioOutPutDTO> CreateAsync(UsuarioDTO dto);
        Task<UsuarioOutPutDTO?> GetByIdAsync(int id);
        Task<List<UsuarioOutPutDTO>> GetAllAsync();
        Task<UsuarioOutPutDTO?> UpdateAsync(int id, UsuarioDTO dto);
        Task<bool> DeleteAsync(int id);
        Task<UsuarioOutPutDTO?> LoginAsync(LoginDTO dto);
    }
}
