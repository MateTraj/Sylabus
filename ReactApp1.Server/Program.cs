using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;
using ReactApp1.Server.Services;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// === 1. BAZA DANYCH ===
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=syllabus.db"));

// === 2. IDENTITY (system użytkowników) ===
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// === 3. JWT AUTHENTICATION ===
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Brak klucza JWT");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// === 4. AUTHORIZATION ===
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("EditorOnly", policy => policy.RequireRole(AppRoles.Editor, AppRoles.Admin));
    options.AddPolicy("ReaderOrAbove", policy => policy.RequireRole(AppRoles.Reader, AppRoles.Editor, AppRoles.Admin));
});

// === 5. CORS ===
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// === 6. SERWISY ===
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<SyllabusPdfService>(); 

// === 7. KONTROLERY ===
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// === 8. INICJALIZACJA BAZY DANYCH ===
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    try 
    {
        // Zastosuj migracje (tworzy/aktualizuje bazę BEZ kasowania danych)
        logger.LogInformation("Stosowanie migracji bazy danych...");
        context.Database.Migrate();
        
        logger.LogInformation("Baza danych zaktualizowana!");
        logger.LogInformation($"   Przedmioty: {context.Subjects.Count()}");
        logger.LogInformation($"   Siatki: {context.Curriculums.Count()}");
        logger.LogInformation($"   Użytkownicy: {context.Users.Count()}");
        
        // Jeśli baza jest pusta, dane seed z AppDbContext zostaną automatycznie dodane
        if (!context.Users.Any())
        {
            logger.LogInformation("Baza pusta - dane testowe zostały dodane przez OnModelCreating");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Błąd podczas inicjalizacji bazy danych");
    }
}

// === 9. MIDDLEWARE PIPELINE ===
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
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

if (!app.Environment.IsDevelopment())
{
    app.MapFallbackToFile("/index.html");
}

app.Run();
