using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public SubjectsController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/subjects?curriculumId=...&semester=...
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? curriculumId, [FromQuery] int? semester, [FromQuery] string? search)
        {
            var query = _db.Subjects
                .Include(s => s.Curriculum)
                .Include(s => s.Versions.OrderByDescending(v => v.VersionNumber))
                .AsQueryable();

            if (curriculumId.HasValue) query = query.Where(s => s.CurriculumId == curriculumId.Value);
            if (semester.HasValue) query = query.Where(s => s.Semester == semester.Value);
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(s => s.Name.Contains(search) || s.Code.Contains(search));
            }

            var list = await query.ToListAsync();
            return Ok(list);
        }

        // GET: api/subjects/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var subject = await _db.Subjects
                .Include(s => s.Versions.OrderByDescending(v => v.VersionNumber))
                .Include(s => s.Curriculum)
                    .ThenInclude(c => c.Center)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subject == null) return NotFound();
            return Ok(subject);
        }

        // POST: api/subjects
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Subject subject)
        {
            if (subject == null) return BadRequest();

            // Ustaw pocz¹tkow¹ wersjê jeœli jest
            if (subject.Versions != null && subject.Versions.Any())
            {
                foreach (var v in subject.Versions)
                {
                    if (v.VersionNumber <= 0) v.VersionNumber = 1;
                }
            }

            _db.Subjects.Add(subject);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = subject.Id }, subject);
        }

        // POST: api/subjects/{id}/versions
        [HttpPost("{id:guid}/versions")]
        public async Task<IActionResult> AddVersion(Guid id, [FromBody] SubjectVersion version)
        {
            var subject = await _db.Subjects
                .Include(s => s.Versions)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (subject == null) return NotFound();

            var maxVersion = subject.Versions.Any() ? subject.Versions.Max(v => v.VersionNumber) : 0;
            version.SubjectId = id;
            if (version.VersionNumber <= 0) version.VersionNumber = maxVersion + 1;

            _db.SubjectVersions.Add(version);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = id }, version);
        }

        // GET: api/subjects/{id}/versions
        [HttpGet("{id:guid}/versions")]
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