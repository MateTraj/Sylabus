using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.Models;
using ReactApp1.Server.Services;

namespace ReactApp1.Server.Controllers
{
    /// <summary>
    /// Kontroler do autentykacji (logowanie, rejestracja).
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly JwtService _jwtService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            JwtService jwtService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtService = jwtService;
        }

        // === POST: api/auth/register ===
        /// <summary>
        /// Rejestracja nowego użytkownika.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // 1. Walidacja danych wejściowych
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 2. Sprawdź czy email już istnieje
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
                return BadRequest(new { message = "Użytkownik z tym emailem już istnieje" });

            // 3. Utwórz nowego użytkownika
            var user = new ApplicationUser
            {
                UserName = request.Email,  // Używamy email jako username
                Email = request.Email,
                FullName = request.FullName,
                CreatedAt = DateTime.UtcNow
            };

            // 4. Zapisz użytkownika (hasło zostanie automatycznie zahashowane)
            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                return BadRequest(new { 
                    message = "Błąd tworzenia użytkownika", 
                    errors = result.Errors.Select(e => e.Description) 
                });
            }

            // 5. Przypisz domyślną rolę "Reader"
            await _userManager.AddToRoleAsync(user, AppRoles.Reader);

            // 6. Wygeneruj token JWT
            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtService.GenerateToken(user, roles);

            // 7. Zwróć odpowiedź
            return Ok(new LoginResponse
            {
                Token = token,
                Email = user.Email!,
                FullName = user.FullName ?? "",
                Roles = roles.ToList()
            });
        }

        // === POST: api/auth/login ===
        /// <summary>
        /// Logowanie użytkownika.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // 1. Walidacja
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 2. Znajdź użytkownika po emailu
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return Unauthorized(new { message = "Nieprawidłowy email lub hasło" });

            // 3. Sprawdź hasło
            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);

            if (!result.Succeeded)
                return Unauthorized(new { message = "Nieprawidłowy email lub hasło" });

            // 4. Wygeneruj token
            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtService.GenerateToken(user, roles);

            // 5. Zwróć token i dane użytkownika
            return Ok(new LoginResponse
            {
                Token = token,
                Email = user.Email!,
                FullName = user.FullName ?? "",
                Roles = roles.ToList()
            });
        }

        // === GET: api/auth/me ===
        /// <summary>
        /// Pobierz informacje o zalogowanym użytkowniku (wymaga tokenu).
        /// </summary>
        [HttpGet("me")]
        [Microsoft.AspNetCore.Authorization.Authorize] // 🔒 Wymaga tokenu JWT
        public async Task<IActionResult> GetCurrentUser()
        {
            // User.Identity.Name zawiera email z tokenu
            var user = await _userManager.FindByNameAsync(User.Identity!.Name!);

            if (user == null)
                return NotFound();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                email = user.Email,
                fullName = user.FullName,
                roles = roles
            });
        }
    }

    // === MODELE DTO (Data Transfer Objects) ===

    public class RegisterRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string? FullName { get; set; }
    }

    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class LoginResponse
    {
        public required string Token { get; set; }
        public required string Email { get; set; }
        public required string FullName { get; set; }
        public required List<string> Roles { get; set; }
    }
}