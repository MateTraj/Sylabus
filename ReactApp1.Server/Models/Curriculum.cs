using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.Models
{
    /// <summary>
    /// Siatka przedmiotów dla konkretnego programu studiów
    /// </summary>
    public class Curriculum
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, StringLength(128)]
        public string Name { get; set; } = string.Empty; // np. "Informatyka I stopieñ 2025/2026"

        [StringLength(64)]
        public string Code { get; set; } = string.Empty; // np. "INF-I-2025"

        public string? Description { get; set; }

        // Link do oœrodka/wydzia³u
        public Guid? CenterId { get; set; }
        public Center? Center { get; set; }

        // Rok akademicki rozpoczêcia
        public int AcademicYear { get; set; } // np. 2025

        // Poziom kszta³cenia: I stopieñ, II stopieñ, jednolite magisterskie
        [StringLength(32)]
        public string? Level { get; set; }

        // Forma studiów: stacjonarne, niestacjonarne
        [StringLength(32)]
        public string? StudyMode { get; set; }

        // Przedmioty w tej siatce
        public ICollection<Subject> Subjects { get; set; } = new List<Subject>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
    }
}