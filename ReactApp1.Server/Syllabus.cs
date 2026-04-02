using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.Models
{
    public class Syllabus
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, StringLength(64)]
        public string Code { get; set; } = string.Empty;

        [Required, StringLength(256)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        // Link to academic center/department
        public Guid? CenterId { get; set; }
        public Center? Center { get; set; }

        // Year when syllabus was first introduced (e.g., 2024)
        public int YearIntroduced { get; set; }

        // Versions (history)
        public ICollection<SyllabusVersion> Versions { get; set; } = new List<SyllabusVersion>();

        // Curriculum grid entries (semester placement)
        public ICollection<CurriculumGridEntry> CurriculumEntries { get; set; } = new List<CurriculumGridEntry>();
    }
}