using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Data;
using System.Text.Json;

namespace ReactApp1.Server.Controllers
{
    /// <summary>
    /// Kontroler do porównywania wersji sylabusów (proxy do Clojure)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DiffController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<DiffController> _logger;

        public DiffController(
            AppDbContext db, 
            IHttpClientFactory httpClientFactory,
            ILogger<DiffController> logger)
        {
            _db = db;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        // === POST: api/diff/compare-versions/{subjectId} ===
        /// <summary>
        /// Porównaj dwie wersje sylabusa
        /// </summary>
        [HttpPost("compare-versions/{subjectId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> CompareVersions(
            Guid subjectId, 
            [FromQuery] int version1, 
            [FromQuery] int version2)
        {
            _logger.LogInformation($"=== CompareVersions: subjectId={subjectId}, v1={version1}, v2={version2}");
            
            var subject = await _db.Subjects
                .Include(s => s.Versions)
                .FirstOrDefaultAsync(s => s.Id == subjectId);

            if (subject == null) 
                return NotFound("Przedmiot nie istnieje");

            var v1 = subject.Versions.FirstOrDefault(v => v.VersionNumber == version1);
            var v2 = subject.Versions.FirstOrDefault(v => v.VersionNumber == version2);

            if (v1 == null || v2 == null)
                return NotFound("Jedna z wersji nie istnieje");

            try
            {
                var client = _httpClientFactory.CreateClient("ClojureDiff");
                
                // Wyślij tylko potrzebne pola (bez relacji Subject)
                var payload = new
                {
                    version1 = new
                    {
                        versionNumber = v1.VersionNumber,
                        title = v1.Title,
                        description = v1.Description,
                        learningOutcomes = v1.LearningOutcomes,
                        prerequisites = v1.Prerequisites,
                        literature = v1.Literature,
                        assessmentMethods = v1.AssessmentMethods,
                        totalHours = v1.TotalHours,
                        theoryHours = v1.TheoryHours,
                        labHours = v1.LabHours,
                        otherHours = v1.OtherHours
                    },
                    version2 = new
                    {
                        versionNumber = v2.VersionNumber,
                        title = v2.Title,
                        description = v2.Description,
                        learningOutcomes = v2.LearningOutcomes,
                        prerequisites = v2.Prerequisites,
                        literature = v2.Literature,
                        assessmentMethods = v2.AssessmentMethods,
                        totalHours = v2.TotalHours,
                        theoryHours = v2.TheoryHours,
                        labHours = v2.LabHours,
                        otherHours = v2.OtherHours
                    }
                };
                
                _logger.LogInformation("Payload prepared, calling Clojure...");
                
                var response = await client.PostAsJsonAsync("/api/diff/compare", payload);
                
                _logger.LogInformation($"Clojure response: {response.StatusCode}");
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Clojure error: {errorContent}");
                    return StatusCode(500, "Błąd serwisu porównywania");
                }

                var result = await response.Content.ReadFromJsonAsync<JsonElement>();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in CompareVersions");
                return StatusCode(500, $"Błąd: {ex.Message}");
            }
        }

        // === GET: api/diff/changelog/{subjectId} ===
        /// <summary>
        /// Pobierz pełny changelog przedmiotu
        /// </summary>
        [HttpGet("changelog/{subjectId:guid}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetChangelog(Guid subjectId)
        {
            var subject = await _db.Subjects
                .Include(s => s.Versions.OrderBy(v => v.VersionNumber))
                .FirstOrDefaultAsync(s => s.Id == subjectId);

            if (subject == null) 
                return NotFound("Przedmiot nie istnieje");

            if (!subject.Versions.Any())
                return Ok(new { changelog = new List<object>(), totalVersions = 0 });

            try
            {
                var client = _httpClientFactory.CreateClient("ClojureDiff");
                
                // Mapuj tylko potrzebne pola
                var versionsDto = subject.Versions.Select(v => new
                {
                    versionNumber = v.VersionNumber,
                    title = v.Title,
                    description = v.Description,
                    learningOutcomes = v.LearningOutcomes,
                    prerequisites = v.Prerequisites,
                    literature = v.Literature,
                    assessmentMethods = v.AssessmentMethods,
                    totalHours = v.TotalHours,
                    theoryHours = v.TheoryHours,
                    labHours = v.LabHours,
                    otherHours = v.OtherHours,
                    createdAt = v.CreatedAt,
                    createdBy = v.CreatedBy,
                    changeNote = v.ChangeNote
                }).ToList();
                
                var payload = new { versions = versionsDto };
                
                var response = await client.PostAsJsonAsync("/api/diff/changelog", payload);
                
                if (!response.IsSuccessStatusCode)
                    return StatusCode(500, "Błąd serwisu porównywania");

                var result = await response.Content.ReadFromJsonAsync<JsonElement>();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd generowania changelog");
                return StatusCode(500, "Błąd generowania historii zmian");
            }
        }
    }
}
