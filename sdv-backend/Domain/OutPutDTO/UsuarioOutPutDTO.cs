namespace sdv_backend.Domain.OutPutDTO
{
    public class UsuarioOutPutDTO
    {

        public int Id { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string CorreoElectronico { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;


    }
}
