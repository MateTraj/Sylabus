using Microsoft.AspNetCore.Identity;

namespace ReactApp1.Server.Models
{
    /// <summary>
    /// U¿ytkownik systemu - dziedziczy po IdentityUser (gotowa klasa Microsoftu).
    /// IdentityUser ju¿ ma: Id, UserName, Email, PasswordHash, itp.
    /// </summary>
    public class ApplicationUser : IdentityUser
    {
        // Mo¿emy dodaæ w³asne pola, np.:
        public string? FullName { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Opcjonalnie: po³¹czenie z tabel¹ Center (wydzia³ u¿ytkownika)
        public Guid? CenterId { get; set; }
        public Center? Center { get; set; }
    }

    /// <summary>
    /// Role w systemie - dwie podstawowe:
    /// </summary>
    public static class AppRoles
    {
        public const string Reader = "Reader";   // U¿ytkownik tylko do odczytu
        public const string Editor = "Editor";   // U¿ytkownik z pe³nymi prawami
        public const string Admin = "Admin";     // Administrator (opcjonalnie)
    }
}