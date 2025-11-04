using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.OutPutDTO;

namespace sdv_backend.Infraestructure.API_Service_Interfaces
{
    public interface IScheduleService
    {
        Task<ClassScheduleOutPutDTO> CreateAsync(ClassScheduleDTO dto);
        Task<ClassScheduleOutPutDTO?> GetByIdAsync(int id);
        Task<List<ClassScheduleOutPutDTO>> GetAllAsync();
        Task<ClassScheduleOutPutDTO?> UpdateAsync(int id, ClassScheduleDTO dto);
        Task<bool> DeleteAsync(int id);
        Task<List<Room>> GetRoomsAsync();
        Task<List<TimeSlot>> GetTimeSlotsAsync();
    }
}

