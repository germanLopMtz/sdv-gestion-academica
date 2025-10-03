using Microsoft.EntityFrameworkCore;
using sdv_backend.Data.Entities;


namespace sdv_backend.Data.DataDB
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions<AppDBContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Alumno> Alumnos => Set<Alumno>();


    }
}
