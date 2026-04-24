using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.Models
{
    /// <summary>
    /// Przedmiot (kurs) w siatce przedmiotów
    /// </summary>
    public class Subject
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, StringLength(64)]
        public string Code { get; set; } = string.Empty; // np. "INF-PO-001"

        [Required, StringLength(256)]
        public string Name { get; set; } = string.Empty; // np. "Programowanie Obiektowe"

        public string? Description { get; set; }

        // Link do siatki przedmiotów
        public Guid CurriculumId { get; set; }
        public Curriculum? Curriculum { get; set; }

        // Semestr, w którym przedmiot jest realizowany
        public int Semester { get; set; }

        // Typ przedmiotu: obowi¹zkowy, fakultatywny, do wyboru
        [StringLength(32)]
        public string? SubjectType { get; set; }

        // ECTS
        public int EctsPoints { get; set; }

        // Wersje przedmiotu (historia zmian)
        public ICollection<SubjectVersion> Versions { get; set; } = new List<SubjectVersion>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
    }
}