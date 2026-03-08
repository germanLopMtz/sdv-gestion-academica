using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.OutPutDTO;

namespace sdv_backend.Infraestructure.API_Service_Interfaces
{
  /// <summary>
    /// Interface para el servicio de mensualidades
    /// </summary>
    public interface IMensualidadService
    {
        /// <summary>
        /// Registra un nuevo pago de mensualidad
/// </summary>
        Task<MensualidadOutPutDTO> CreateAsync(MensualidadDTO dto);
     
     /// <summary>
        /// Obtiene una mensualidad por su ID
 /// </summary>
      Task<MensualidadOutPutDTO?> GetByIdAsync(int id);
   
        /// <summary>
     /// Obtiene todas las mensualidades registradas
        /// </summary>
        Task<List<MensualidadOutPutDTO>> GetAllAsync();
     
        /// <summary>
    /// Actualiza un pago de mensualidad existente
        /// </summary>
        Task<MensualidadOutPutDTO?> UpdateAsync(int id, MensualidadDTO dto);
 
        /// <summary>
        /// Elimina un registro de mensualidad
        /// </summary>
        Task<bool> DeleteAsync(int id);
  
        /// <summary>
  /// Obtiene las mensualidades de un alumno específico
        /// </summary>
        Task<List<MensualidadOutPutDTO>> GetByAlumnoIdAsync(int alumnoId);
      
     /// <summary>
     /// Obtiene un resumen de mensualidades por alumno (para la vista principal)
      /// </summary>
        Task<List<MensualidadResumenDTO>> GetResumenMensualidadesAsync();
        
        /// <summary>
        /// Obtiene las mensualidades filtradas por mes
     /// </summary>
     Task<List<MensualidadOutPutDTO>> GetByMesAsync(string mes);
        
/// <summary>
        /// Obtiene las mensualidades filtradas por estado (PAGADO, PENDIENTE)
        /// </summary>
        Task<List<MensualidadOutPutDTO>> GetByEstadoAsync(string estado);
    }
}
