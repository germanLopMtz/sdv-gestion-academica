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

            // Índice único para prevenir choques de maestro/aula en mismo horario y día
            modelBuilder.Entity<ClassSchedule>()
                .HasIndex(cs => new { cs.MaestroId, cs.DayOfWeek, cs.TimeSlotId })
                .IsUnique();

            modelBuilder.Entity<ClassSchedule>()
                .HasIndex(cs => new { cs.RoomId, cs.DayOfWeek, cs.TimeSlotId })
                .IsUnique();
        }
    }
}
