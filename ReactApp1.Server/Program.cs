using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Data;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=syllabus.db"));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Ignoruj cykliczne referencje
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        // CamelCase dla właściwości JSON
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply migrations and seed database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // Usuń starą bazę i utwórz nową z danymi seed z AppDbContext
    db.Database.EnsureDeleted();
    db.Database.EnsureCreated();
    
    Console.WriteLine("✅ Baza danych utworzona pomyślnie!");
    Console.WriteLine($"   - {db.Centers.Count()} centrów");
    Console.WriteLine($"   - {db.Curriculums.Count()} siatek przedmiotów");
    Console.WriteLine($"   - {db.Subjects.Count()} przedmiotów");
    Console.WriteLine($"   - {db.SubjectVersions.Count()} wersji przedmiotów");
}

if (!app.Environment.IsDevelopment())
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

if (!app.Environment.IsDevelopment())
{
    app.MapFallbackToFile("/index.html");
}

app.Run();
