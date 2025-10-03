using Microsoft.EntityFrameworkCore;
using sdv_backend.Data.Entities;


namespace sdv_backend.Data.DataDB
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios => Set<Usuario>();


    }
}
