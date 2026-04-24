using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CurriculumsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CurriculumsController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/curriculums
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? year, [FromQuery] string? level)
        {
            var query = _db.Curriculums
                .Include(c => c.Center)
                .Include(c => c.Subjects)
                .AsQueryable();

            if (year.HasValue) query = query.Where(c => c.AcademicYear == year.Value);
            if (!string.IsNullOrEmpty(level)) query = query.Where(c => c.Level == level);

            var list = await query.ToListAsync();
            return Ok(list);
        }

        // GET: api/curriculums/{id}
        [HttpGet("{id:guid}")]
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

        // POST: api/curriculums
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Curriculum curriculum)
        {
            _db.Curriculums.Add(curriculum);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = curriculum.Id }, curriculum);
        }
    }
}