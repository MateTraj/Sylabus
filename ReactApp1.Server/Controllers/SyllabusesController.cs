using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SyllabusesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public SyllabusesController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/syllabuses?centerId=&year=&search=
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] Guid? centerId, [FromQuery] int? year, [FromQuery] string? search)
        {
            var q = _db.Syllabuses
                .Include(s => s.Center)
                .Include(s => s.Versions.OrderByDescending(v => v.VersionNumber))
                .AsQueryable();

            if (centerId.HasValue) q = q.Where(s => s.CenterId == centerId);
            if (year.HasValue) q = q.Where(s => s.YearIntroduced == year.Value);
            if (!string.IsNullOrWhiteSpace(search))
            {
                q = q.Where(s => s.Title.Contains(search) || s.Code.Contains(search));
            }

            var list = await q.ToListAsync();
            return Ok(list);
        }

        // GET: api/syllabuses/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var item = await _db.Syllabuses
                .Include(s => s.Versions.OrderByDescending(v => v.VersionNumber))
                .Include(s => s.CurriculumEntries)
                .Include(s => s.Center)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (item == null) return NotFound();
            return Ok(item);
        }

        // POST: api/syllabuses
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Syllabus syllabus)
        {
            if (syllabus == null) return BadRequest();

            // Ensure initial versions have version numbers set by caller or default to 1
            if (syllabus.Versions != null && syllabus.Versions.Any())
            {
                foreach (var v in syllabus.Versions)
                {
                    if (v.VersionNumber <= 0) v.VersionNumber = 1;
                }
            }

            _db.Syllabuses.Add(syllabus);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = syllabus.Id }, syllabus);
        }

        // POST: api/syllabuses/{id}/versions
        // Adds a new version to an existing syllabus (keeps history)
        [HttpPost("{id:guid}/versions")]
        public async Task<IActionResult> AddVersion(Guid id, [FromBody] SyllabusVersion version)
        {
            var syllabus = await _db.Syllabuses
                .Include(s => s.Versions)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (syllabus == null) return NotFound();

            var maxVersion = syllabus.Versions.Any() ? syllabus.Versions.Max(v => v.VersionNumber) : 0;
            version.SyllabusId = id;
            if (version.VersionNumber <= 0) version.VersionNumber = maxVersion + 1;

            _db.SyllabusVersions.Add(version);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = id }, version);
        }

        // GET: api/syllabuses/{id}/versions
        [HttpGet("{id:guid}/versions")]
        public async Task<IActionResult> GetVersions(Guid id)
        {
            var versions = await _db.SyllabusVersions
                .Where(v => v.SyllabusId == id)
                .OrderByDescending(v => v.VersionNumber)
                .ToListAsync();

            return Ok(versions);
        }

        // PUT: api/syllabuses/{id} - update syllabus metadata (not versions)
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Syllabus update)
        {
            if (id != update.Id) return BadRequest();

            var existing = await _db.Syllabuses.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Title = update.Title;
            existing.Description = update.Description;
            existing.Code = update.Code;
            existing.CenterId = update.CenterId;
            existing.YearIntroduced = update.YearIntroduced;

            _db.Syllabuses.Update(existing);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}