using Microsoft.SqlServer.Server;
using sdv_backend.Domain.Enum;

namespace sdv_backend.Data.Entities
{
    public class Usuario
    {
        public int Id { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string CorreoElectronico { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public UserType Tipo { get; set; } = UserType.None;
    }
}
