using sdv_backend.Data.DataDB;
using Microsoft.EntityFrameworkCore;
using sdv_backend.Infraestructure;
using sdv_backend.Infraestructure.API_Service_Interfaces;
using sdv_backend.Infraestructure.API_Services;
using Microsoft.OpenApi.Models;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SDV Backend API",
        Version = "v1",
        Description = "API para el Sistema de Gestión Académica SDV",
        Contact = new OpenApiContact
        {
            Name = "Equipo SDV",
            Url = new Uri("https://github.com/germanLopMtz/sdv-gestion-academica")
        }
    });

    // Incluir comentarios XML en Swagger
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});


builder.Services.AddDbContext<AppDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IAlumnoService, AlumnoService>();
builder.Services.AddScoped<IMaestroService, MaestroService>();
builder.Services.AddScoped<IScheduleService, ScheduleService>();
builder.Services.AddScoped<IMensualidadService, MensualidadService>();
builder.Services.AddScoped<IAsistenciaService, AsistenciaService>();


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

// Endpoint de acceso rápido a la documentación
app.MapGet("/docs", () => Results.Redirect("http://localhost:9090"))
    .WithName("OpenDocumentation");

// Endpoint para verificar si la documentación está disponible
app.MapGet("/docs/status", () => 
{
    var docPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "docfx_project", "_site", "index.html");
    var exists = File.Exists(docPath);
    return Results.Ok(new 
    { 
        documentationGenerated = exists,
        url = "http://localhost:9090",
        message = exists 
            ? "Documentación generada. Ejecuta 'docfx serve' para verla." 
            : "Documentación no generada. Ejecuta '.\\generate-docs.ps1' primero."
    });
})
.WithName("CheckDocumentation")
;

// Seeding de Aulas y Horarios PM si no existen
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<AppDBContext>();
    // Aulas fijas
    if (!await ctx.Rooms.AnyAsync())
    {
        ctx.Rooms.AddRange(new sdv_backend.Data.Entities.Room { Name = "Control Room 1" },
                           new sdv_backend.Data.Entities.Room { Name = "Control Room 2" },
                           new sdv_backend.Data.Entities.Room { Name = "Control Room 3" },
                           new sdv_backend.Data.Entities.Room { Name = "Maxiplaza" });
        await ctx.SaveChangesAsync();
    }

    // Horarios PM fijos
    if (!await ctx.TimeSlots.AnyAsync())
    {
        ctx.TimeSlots.AddRange(new sdv_backend.Data.Entities.TimeSlot { StartTime = "15:00", EndTime = "17:00", DisplayName = "3:00-5:00 PM" },
                               new sdv_backend.Data.Entities.TimeSlot { StartTime = "17:30", EndTime = "19:30", DisplayName = "5:30-7:30 PM" },
                               new sdv_backend.Data.Entities.TimeSlot { StartTime = "20:00", EndTime = "22:00", DisplayName = "8:00-10:00 PM" });
        await ctx.SaveChangesAsync();
    }
}

app.Run();
