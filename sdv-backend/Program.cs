using sdv_backend.Data.DataDB;
using Microsoft.EntityFrameworkCore;
using sdv_backend.Infraestructure;
using sdv_backend.Infraestructure.API_Service_Interfaces;
using sdv_backend.Infraestructure.API_Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddDbContext<AppDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IAlumnoService, AlumnoService>();
builder.Services.AddScoped<IMaestroService, MaestroService>(); // Nuevo servicio de maestros
builder.Services.AddScoped<IScheduleService, ScheduleService>();
builder.Services.AddScoped<IAvisoService, AvisoService>(); // Nuevo servicio de avisos

// CORS para permitir el frontend (Vite y otros dev servers)
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://localhost:5173",
                "https://127.0.0.1:5173",
                "http://localhost:8080",
                "http://127.0.0.1:8080",
                "https://localhost:8080",
                "https://127.0.0.1:8080"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("FrontendPolicy");

app.UseAuthorization();

app.MapControllers();

// Seeding de Aulas y Horarios PM si no existen
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<AppDBContext>();
    // Aulas fijas
    if (!ctx.Rooms.Any())
    {
        ctx.Rooms.AddRange(new sdv_backend.Data.Entities.Room { Name = "Control Room 1" },
                           new sdv_backend.Data.Entities.Room { Name = "Control Room 2" },
                           new sdv_backend.Data.Entities.Room { Name = "Control Room 3" },
                           new sdv_backend.Data.Entities.Room { Name = "Maxiplaza" });
        ctx.SaveChanges();
    }

    // Horarios PM fijos
    if (!ctx.TimeSlots.Any())
    {
        ctx.TimeSlots.AddRange(new sdv_backend.Data.Entities.TimeSlot { StartTime = "15:00", EndTime = "17:00", DisplayName = "3:00-5:00 PM" },
                               new sdv_backend.Data.Entities.TimeSlot { StartTime = "17:30", EndTime = "19:30", DisplayName = "5:30-7:30 PM" },
                               new sdv_backend.Data.Entities.TimeSlot { StartTime = "20:00", EndTime = "22:00", DisplayName = "8:00-10:00 PM" });
        ctx.SaveChanges();
    }
}

app.Run();
