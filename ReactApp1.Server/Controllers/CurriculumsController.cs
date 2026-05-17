using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Controllers
{
    /// <summary>
    /// Kontroler do zarządzania siatkami przedmiotów (Curriculums).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CurriculumsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CurriculumsController(AppDbContext db)
        {
            _db = db;
        }

        // === GET: api/curriculums ===
        /// <summary>
        /// Pobierz listę siatek przedmiotów.
        /// </summary>
        [HttpGet]
        [AllowAnonymous] // Czytanie bez logowania
        public async Task<IActionResult> GetAll(
            [FromQuery] int? year, 
            [FromQuery] string? level,
            [FromQuery] string? studyMode)
        {
            var query = _db.Curriculums
                .Include(c => c.Center)
                .Include(c => c.Subjects)
                .AsQueryable();

            // Filtry
            if (year.HasValue) 
                query = query.Where(c => c.AcademicYear == year.Value);
            
            if (!string.IsNullOrEmpty(level)) 
                query = query.Where(c => c.Level == level);

            if (!string.IsNullOrEmpty(studyMode))
                query = query.Where(c => c.StudyMode == studyMode);

            var list = await query.ToListAsync();
            return Ok(list);
        }

        // === GET: api/curriculums/{id} ===
        /// <summary>
        /// Pobierz szczegóły siatki przedmiotów.
        /// </summary>
        [HttpGet("{id:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var curriculum = await _db.Curriculums
                .Include(c => c.Center)
                .Include(c => c.Subjects)
                    .ThenInclude(s => s.Versions.OrderByDescending(v => v.VersionNumber))
                .FirstOrDefaultAsync(c => c.Id == id);

            if (curriculum == null) return NotFound();
            return Ok(curriculum);
        }

        // === POST: api/curriculums ===
        /// <summary>
        /// Utwórz nową siatkę przedmiotów (TYLKO DLA EDITORÓW).
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Editor,Admin")]
        public async Task<IActionResult> Create([FromBody] Curriculum curriculum)
        {
            if (curriculum == null) return BadRequest("Dane siatki są wymagane");

            // Walidacja
            if (string.IsNullOrWhiteSpace(curriculum.Code))
                return BadRequest("Kod siatki jest wymagany");

            if (string.IsNullOrWhiteSpace(curriculum.Name))
                return BadRequest("Nazwa siatki jest wymagana");

            // Sprawdź czy kod już istnieje
            var exists = await _db.Curriculums.AnyAsync(c => c.Code == curriculum.Code);
            if (exists)
                return BadRequest($"Sylabus o kodzie '{curriculum.Code}' już istnieje");

            // Dodaj autora
            curriculum.CreatedBy = User.Identity?.Name ?? "Unknown";
            curriculum.CreatedAt = DateTime.UtcNow;

            _db.Curriculums.Add(curriculum);
            await _db.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetById), new { id = curriculum.Id }, curriculum);
        }

        // === PUT: api/curriculums/{id} ===
        /// <summary>
        /// Zaktualizuj sylabus (TYLKO DLA EDITORÓW).
        /// </summary>
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Editor,Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Curriculum updatedCurriculum)
        {
            if (updatedCurriculum == null) 
                return BadRequest("Dane siatki są wymagane");

            var curriculum = await _db.Curriculums.FindAsync(id);
            if (curriculum == null) 
                return NotFound("Sylabus nie istnieje");

            // Walidacja
            if (string.IsNullOrWhiteSpace(updatedCurriculum.Code))
                return BadRequest("Kod siatki jest wymagany");

            if (string.IsNullOrWhiteSpace(updatedCurriculum.Name))
                return BadRequest("Nazwa siatki jest wymagana");

            // Sprawdź czy nowy kod nie koliduje z innym sylabusem
            if (updatedCurriculum.Code != curriculum.Code)
            {
                var codeExists = await _db.Curriculums.AnyAsync(c => 
                    c.Code == updatedCurriculum.Code && c.Id != id);
                if (codeExists)
                    return BadRequest($"Sylabus o kodzie '{updatedCurriculum.Code}' już istnieje");
            }

            // Aktualizuj pola
            curriculum.Name = updatedCurriculum.Name;
            curriculum.Code = updatedCurriculum.Code;
            curriculum.Description = updatedCurriculum.Description;
            curriculum.AcademicYear = updatedCurriculum.AcademicYear;
            curriculum.Level = updatedCurriculum.Level;
            curriculum.StudyMode = updatedCurriculum.StudyMode;
            curriculum.CenterId = updatedCurriculum.CenterId;

            await _db.SaveChangesAsync();
            return Ok(curriculum);
        }

        // === DELETE: api/curriculums/{id} ===
        /// <summary>
        /// Usuń sylabus (TYLKO DLA ADMINÓW).
        /// Uwaga: usunie również wszystkie przypisane przedmioty!
        /// </summary>
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var curriculum = await _db.Curriculums
                .Include(c => c.Subjects)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (curriculum == null) 
                return NotFound("Sylabus nie istnieje");

            // Sprawdź czy ma przypisane przedmioty
            if (curriculum.Subjects != null && curriculum.Subjects.Any())
            {
                return BadRequest($"Nie można usunąć sylabusa zawierającego {curriculum.Subjects.Count} przedmiotów. Najpierw usuń przedmioty.");
            }

            _db.Curriculums.Remove(curriculum);
            await _db.SaveChangesAsync();
            
            return NoContent();
        }
    }
}