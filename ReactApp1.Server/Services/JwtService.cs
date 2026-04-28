using Microsoft.IdentityModel.Tokens;
using ReactApp1.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ReactApp1.Server.Services
{
    /// <summary>
    /// Serwis do generowania tokenów JWT (JSON Web Token).
    /// Token JWT to zaszyfrowany "bilet", który zawiera informacje o u¿ytkowniku.
    /// </summary>
    public class JwtService
    {
        private readonly IConfiguration _config;

        public JwtService(IConfiguration config)
        {
            _config = config;
        }

        /// <summary>
        /// Tworzy token JWT dla u¿ytkownika.
        /// </summary>
        /// <param name="user">U¿ytkownik</param>
        /// <param name="roles">Lista ról u¿ytkownika</param>
        /// <returns>Token jako string</returns>
        public string GenerateToken(ApplicationUser user, IList<string> roles)
        {
            // === 1. CLAIMS (roszczenia) - informacje w tokenie ===
            // To jak "naklejki" na bilecie: imiê, email, rola
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? ""),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim("fullName", user.FullName ?? "")
            };

            // Dodaj wszystkie role jako osobne claims
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // === 2. KLUCZ SZYFRUJ¥CY ===
            // Sekretny klucz do podpisania tokenu (przechowujemy w appsettings.json)
            var keyString = _config["Jwt:Key"] ?? throw new InvalidOperationException("Brak klucza JWT w konfiguracji");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // === 3. TWORZENIE TOKENU ===
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],           // Kto wyda³ token (nasza aplikacja)
                audience: _config["Jwt:Audience"],       // Dla kogo jest token (nasz frontend)
                claims: claims,                          // Informacje o u¿ytkowniku
                expires: DateTime.UtcNow.AddHours(8),    // Token wa¿ny przez 8 godzin
                signingCredentials: creds                // Podpis cyfrowy
            );

            // === 4. ZWRÓÆ TOKEN JAKO STRING ===
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}