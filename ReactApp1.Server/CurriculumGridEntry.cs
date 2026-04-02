using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.Models
{
    public class CurriculumGridEntry
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid SyllabusId { get; set; }
        public Syllabus? Syllabus { get; set; }

        // Semester (e.g., 1..10)
        public int Semester { get; set; }

        // Number of hours in that semester
        public int Hours { get; set; }

        // Optional: academic year when this placement starts
        public int? Year { get; set; }
    }
}