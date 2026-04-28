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
    // Opcje haseł (wymagania bezpieczeństwa)
    options.Password.RequireDigit = true;           // Wymaga cyfry
    options.Password.RequiredLength = 6;            // Minimum 6 znaków
    options.Password.RequireNonAlphanumeric = false; // NIE wymaga znaków specjalnych
    options.Password.RequireUppercase = true;       // Wymaga wielkiej litery
    options.Password.RequireLowercase = true;       // Wymaga małej litery

    // Opcje użytkownika
    options.User.RequireUniqueEmail = true;         // Email musi być unikalny
})
.AddEntityFrameworkStores<AppDbContext>()           // Użyj naszej bazy danych
.AddDefaultTokenProviders();                        // Tokeny do resetowania hasła, itp.

// === 3. JWT AUTHENTICATION ===
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Brak klucza JWT");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    // Domyślna metoda autentykacji to JWT
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,              // Sprawdź czy token nie wygasł
        ValidateIssuerSigningKey = true,      // Sprawdź podpis
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// === 4. AUTHORIZATION (uprawnienia) ===
builder.Services.AddAuthorization(options =>
{
    // Polityki dostępu - możemy definiować własne reguły
    options.AddPolicy("EditorOnly", policy => policy.RequireRole(AppRoles.Editor, AppRoles.Admin));
    options.AddPolicy("ReaderOrAbove", policy => policy.RequireRole(AppRoles.Reader, AppRoles.Editor, AppRoles.Admin));
});

// === 5. CORS (dostęp z frontendu) ===
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")  // Vite dev server
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// === 6. REJESTRACJA SERWISÓW ===
builder.Services.AddScoped<JwtService>();  // Nasz serwis do generowania tokenów

// === 7. KONTROLERY ===
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ============================
var app = builder.Build();
// ============================

// === 8. INICJALIZACJA BAZY DANYCH ===
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    
    // Usuń starą bazę i utwórz nową
    context.Database.EnsureDeleted();
    context.Database.EnsureCreated();
    
    Console.WriteLine("✅ Baza danych utworzona!");
    Console.WriteLine($"   - Użytkownicy: editor@uczelnia.pl (hasło: Editor123!)");
    Console.WriteLine($"   - Użytkownicy: reader@uczelnia.pl (hasło: Reader123!)");
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

app.UseCors("AllowReactApp");  // ⚠️ MUSI być przed Authentication

app.UseAuthentication();       // 🔐 Sprawdź token JWT
app.UseAuthorization();         // 🔐 Sprawdź uprawnienia (role)

app.MapControllers();

if (!app.Environment.IsDevelopment())
{
    app.MapFallbackToFile("/index.html");
}

app.Run();
