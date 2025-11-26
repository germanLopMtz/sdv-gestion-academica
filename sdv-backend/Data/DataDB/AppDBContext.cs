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
        public DbSet<Room> Rooms => Set<Room>();
        public DbSet<TimeSlot> TimeSlots => Set<TimeSlot>();
        public DbSet<ClassSchedule> ClassSchedules => Set<ClassSchedule>();
        public DbSet<ClassStudent> ClassStudents => Set<ClassStudent>();
    
        // Nuevas entidades para Avisos
        public DbSet<Aviso> Avisos => Set<Aviso>();
        public DbSet<AvisoDestinatario> AvisoDestinatarios => Set<AvisoDestinatario>();
        
        // Entidad para Mensualidades
        public DbSet<Mensualidad> Mensualidades => Set<Mensualidad>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de relaciones
            modelBuilder.Entity<ClassSchedule>()
                .HasOne(cs => cs.Room)
                .WithMany(r => r.ClassSchedules)
                .HasForeignKey(cs => cs.RoomId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ClassSchedule>()
                .HasOne(cs => cs.TimeSlot)
                .WithMany(ts => ts.ClassSchedules)
                .HasForeignKey(cs => cs.TimeSlotId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ClassSchedule>()
                .HasOne(cs => cs.Maestro)
                .WithMany()
                .HasForeignKey(cs => cs.MaestroId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ClassStudent>()
                .HasOne(cs => cs.ClassSchedule)
                .WithMany(cs => cs.ClassStudents)
                .HasForeignKey(cs => cs.ClassScheduleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ClassStudent>()
                .HasOne(cs => cs.Alumno)
                .WithMany()
                .HasForeignKey(cs => cs.AlumnoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuración de relaciones para Avisos
            modelBuilder.Entity<Aviso>()
                .HasOne(a => a.UsuarioCreador)
                .WithMany()
                .HasForeignKey(a => a.UsuarioCreadorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AvisoDestinatario>()
                .HasOne(ad => ad.Aviso)
                .WithMany(a => a.Destinatarios)
                .HasForeignKey(ad => ad.AvisoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AvisoDestinatario>()
                .HasOne(ad => ad.Maestro)
                .WithMany()
                .HasForeignKey(ad => ad.MaestroId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuración de relaciones para Mensualidades
            modelBuilder.Entity<Mensualidad>()
                .HasOne(m => m.Alumno)
                .WithMany()
                .HasForeignKey(m => m.AlumnoId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices únicos existentes
            modelBuilder.Entity<ClassSchedule>()
                .HasIndex(cs => new { cs.MaestroId, cs.DayOfWeek, cs.TimeSlotId })
                .IsUnique();

            modelBuilder.Entity<ClassSchedule>()
                .HasIndex(cs => new { cs.RoomId, cs.DayOfWeek, cs.TimeSlotId })
                .IsUnique();

            // Índice único para evitar destinatarios duplicados
            modelBuilder.Entity<AvisoDestinatario>()
                .HasIndex(ad => new { ad.AvisoId, ad.MaestroId })
                .IsUnique();

            // Índice único para evitar mensualidades duplicadas
            modelBuilder.Entity<Mensualidad>()
                .HasIndex(m => new { m.AlumnoId, m.Mes, m.Año, m.Concepto })
                .IsUnique();
        }
    }
}
