using sdv_backend.Data;
using sdv_backend.Data.DataDB;
using sdv_backend.Data.Entities;
using sdv_backend.Domain.DTOs;
using sdv_backend.Domain.OutPutDTO;
using Microsoft.EntityFrameworkCore;
using sdv_backend.Infraestructure.API_Service_Interfaces;


namespace sdv_backend.Infraestructure.API_Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly AppDBContext _context;

        public UsuarioService(AppDBContext context)
        {
            _context = context;
        }

        public async Task<UsuarioOutPutDTO> CreateAsync(UsuarioDTO dto)
        {
            var entity = new Usuario
            {
                NombreCompleto = dto.NombreCompleto,
                CorreoElectronico = dto.CorreoElectronico,
                Contrasena = dto.Contrasena,
                Direccion = dto.Direccion,
                Telefono = dto.Telefono,
                Tipo = dto.Tipo
            };

            _context.Usuarios.Add(entity);
            await _context.SaveChangesAsync();

            return new UsuarioOutPutDTO
            {
                Id = entity.Id,
                NombreCompleto = entity.NombreCompleto,
                CorreoElectronico = entity.CorreoElectronico,
                Direccion = entity.Direccion,
                Telefono = entity.Telefono,
                Tipo = entity.Tipo
            };
        }

        public async Task<UsuarioOutPutDTO?> GetByIdAsync(int id)
        {
            var entity = await _context.Usuarios.FindAsync(id);
            if (entity == null) return null;

            return new UsuarioOutPutDTO
            {
                Id = entity.Id,
                NombreCompleto = entity.NombreCompleto,
                CorreoElectronico = entity.CorreoElectronico,
                Direccion = entity.Direccion,
                Telefono = entity.Telefono,
                Tipo = entity.Tipo
            };
        }

        public async Task<List<UsuarioOutPutDTO>> GetAllAsync()
        {
            var usuarios = await _context.Usuarios.ToListAsync();

            return usuarios.Select(u => new UsuarioOutPutDTO
            {
                Id = u.Id,
                NombreCompleto = u.NombreCompleto,
                CorreoElectronico = u.CorreoElectronico,
                Direccion = u.Direccion,
                Telefono = u.Telefono,
                Tipo = u.Tipo
            }).ToList();
        }

        public async Task<UsuarioOutPutDTO?> UpdateAsync(int id, UsuarioDTO dto)
        {
            var entity = await _context.Usuarios.FindAsync(id);
            if (entity == null) return null;

            entity.NombreCompleto = dto.NombreCompleto;
            entity.CorreoElectronico = dto.CorreoElectronico;
            entity.Contrasena = dto.Contrasena;
            entity.Direccion = dto.Direccion;
            entity.Telefono = dto.Telefono;
            entity.Tipo = dto.Tipo;

            await _context.SaveChangesAsync();

            return new UsuarioOutPutDTO
            {
                Id = entity.Id,
                NombreCompleto = entity.NombreCompleto,
                CorreoElectronico = entity.CorreoElectronico,
                Direccion = entity.Direccion,
                Telefono = entity.Telefono,
                Tipo = entity.Tipo
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Usuarios.FindAsync(id);
            if (entity == null) return false;

            _context.Usuarios.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<UsuarioOutPutDTO?> LoginAsync(LoginDTO dto)
        {
            // Normalizar el correo electrónico (trim y lowercase)
            var correoNormalizado = dto.CorreoElectronico?.Trim().ToLower() ?? string.Empty;
            
            // Buscar usuario por correo electrónico
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.CorreoElectronico.ToLower() == correoNormalizado);

            if (usuario == null) return null;

            // Comparar contraseña exacta (sin trim, case-sensitive)
            if (usuario.Contrasena != dto.Contrasena) return null;

            return new UsuarioOutPutDTO
            {
                Id = usuario.Id,
                NombreCompleto = usuario.NombreCompleto,
                CorreoElectronico = usuario.CorreoElectronico,
                Direccion = usuario.Direccion,
                Telefono = usuario.Telefono,
                Tipo = usuario.Tipo
            };
        }

    }
}
