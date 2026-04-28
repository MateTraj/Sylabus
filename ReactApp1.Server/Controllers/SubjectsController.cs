using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Controllers
{
    /// <summary>
    /// Kontroler do zarządzania przedmiotami (Subjects).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // 🔒 Wszystkie endpointy wymagają zalogowania
    public class SubjectsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public SubjectsController(AppDbContext db)
        {
            _db = db;
        }

        // === GET: api/subjects?curriculumId=...&semester=...&search=... ===
        /// <summary>
        /// Pobierz listę przedmiotów (dostępne dla wszystkich zalogowanych użytkowników).
        /// </summary>
        [HttpGet]
        [AllowAnonymous] // 🔓 Wyjątek: pozwalamy czytać bez logowania (opcjonalne)
        public async Task<IActionResult> GetAll(
            [FromQuery] Guid? curriculumId, 
            [FromQuery] int? semester, 
            [FromQuery] string? search)
        {
            var query = _db.Subjects
                .Include(s => s.Curriculum)
                .Include(s => s.Versions.OrderByDescending(v => v.VersionNumber))
                .AsQueryable();

            // Filtry
            if (curriculumId.HasValue) 
                query = query.Where(s => s.CurriculumId == curriculumId.Value);
            
            if (semester.HasValue) 
                query = query.Where(s => s.Semester == semester.Value);
            
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(s => 
                    s.Name.ToLower().Contains(searchLower) || 
                    s.Code.ToLower().Contains(searchLower));
            }

            var list = await query.ToListAsync();
            return Ok(list);
        }

        // === GET: api/subjects/{id} ===
        /// <summary>
        /// Pobierz szczegóły przedmiotu (dostępne dla wszystkich).
        /// </summary>
        [HttpGet("{id:guid}")]
        [AllowAnonymous] // 🔓 Czytanie bez logowania
        public async Task<IActionResult> GetById(Guid id)
        {
            var subject = await _db.Subjects
                .Include(s => s.Versions.OrderByDescending(v => v.VersionNumber))
                .Include(s => s.Curriculum)
                    .ThenInclude(c => c!.Center)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subject == null) return NotFound();
            return Ok(subject);
        }

        // === POST: api/subjects ===
        /// <summary>
        /// Utwórz nowy przedmiot (TYLKO DLA EDITORÓW).
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Editor,Admin")] // 🔒 Tylko Editor lub Admin
        public async Task<IActionResult> Create([FromBody] Subject subject)
        {
            if (subject == null) return BadRequest("Dane przedmiotu są wymagane");

            // Walidacja
            if (string.IsNullOrWhiteSpace(subject.Code))
                return BadRequest("Kod przedmiotu jest wymagany");

            if (string.IsNullOrWhiteSpace(subject.Name))
                return BadRequest("Nazwa przedmiotu jest wymagana");

            // Sprawdź czy curriculum istnieje
            var curriculumExists = await _db.Curriculums.AnyAsync(c => c.Id == subject.CurriculumId);
            if (!curriculumExists)
                return BadRequest("Siatka przedmiotów nie istnieje");

            // Dodaj autora (z tokenu JWT)
            subject.CreatedBy = User.Identity?.Name ?? "Unknown";
            subject.CreatedAt = DateTime.UtcNow;

            // Ustaw początkową wersję jeśli jest
            if (subject.Versions != null && subject.Versions.Any())
            {
                foreach (var v in subject.Versions)
                {
                    if (v.VersionNumber <= 0) v.VersionNumber = 1;
                    v.CreatedBy = subject.CreatedBy;
                    v.CreatedAt = DateTime.UtcNow;
                }
            }

            _db.Subjects.Add(subject);
            await _db.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetById), new { id = subject.Id }, subject);
        }

        // === PUT: api/subjects/{id} ===
        /// <summary>
        /// Zaktualizuj przedmiot (TYLKO DLA EDITORÓW).
        /// </summary>
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Editor,Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Subject updatedSubject)
        {
            var subject = await _db.Subjects.FindAsync(id);
            if (subject == null) return NotFound();

            // Aktualizuj pola
            subject.Code = updatedSubject.Code;
            subject.Name = updatedSubject.Name;
            subject.Description = updatedSubject.Description;
            subject.Semester = updatedSubject.Semester;
            subject.SubjectType = updatedSubject.SubjectType;
            subject.EctsPoints = updatedSubject.EctsPoints;

            await _db.SaveChangesAsync();
            return Ok(subject);
        }

        // === DELETE: api/subjects/{id} ===
        /// <summary>
        /// Usuń przedmiot (TYLKO DLA ADMINÓW).
        /// </summary>
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")] // 🔒 Tylko Admin może usuwać
        public async Task<IActionResult> Delete(Guid id)
        {
            var subject = await _db.Subjects.FindAsync(id);
            if (subject == null) return NotFound();

            _db.Subjects.Remove(subject);
            await _db.SaveChangesAsync();
            
            return NoContent();
        }

        // === POST: api/subjects/{id}/versions ===
        /// <summary>
        /// Dodaj nową wersję sylabusa (TYLKO DLA EDITORÓW).
        /// </summary>
        [HttpPost("{id:guid}/versions")]
        [Authorize(Roles = "Editor,Admin")]
        public async Task<IActionResult> AddVersion(Guid id, [FromBody] SubjectVersion version)
        {
            var subject = await _db.Subjects
                .Include(s => s.Versions)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subject == null) return NotFound("Przedmiot nie istnieje");

            // Walidacja godzin
            if (version.TotalHours != version.TheoryHours + version.LabHours + version.OtherHours)
            {
                return BadRequest("Suma godzin (wykład + lab + inne) musi równać się całkowitej liczbie godzin");
            }

            // Automatyczne wersjonowanie
            var maxVersion = subject.Versions.Any() 
                ? subject.Versions.Max(v => v.VersionNumber) 
                : 0;
            
            version.SubjectId = id;
            version.VersionNumber = maxVersion + 1;
            version.CreatedBy = User.Identity?.Name ?? "Unknown";
            version.CreatedAt = DateTime.UtcNow;

            _db.SubjectVersions.Add(version);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = id }, version);
        }

        // === GET: api/subjects/{id}/versions ===
        /// <summary>
        /// Pobierz historię wersji przedmiotu (dostępne dla wszystkich).
        /// </summary>
        [HttpGet("{id:guid}/versions")]
        [AllowAnonymous]
        public async Task<IActionResult> GetVersions(Guid id)
        {
            var versions = await _db.SubjectVersions
                .Where(v => v.SubjectId == id)
                .OrderByDescending(v => v.VersionNumber)
                .ToListAsync();

            return Ok(versions);
        }
    }
}