using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.Models
{
    /// <summary>
    /// Wersja przedmiotu - historia zmian w sylabusie przedmiotu
    /// </summary>
    public class SubjectVersion : IValidatableObject
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid SubjectId { get; set; }
        public Subject? Subject { get; set; }

        // Numer wersji (kolejny) - USTAWIANY AUTOMATYCZNIE przez kontroler
        public int VersionNumber { get; set; }

        [Required, StringLength(256)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        // Cele kształcenia / efekty uczenia się
        public string? LearningOutcomes { get; set; }

        // Wymagania wstępne
        public string? Prerequisites { get; set; }

        // Literatura
        public string? Literature { get; set; }

        // Metody oceniania
        public string? AssessmentMethods { get; set; }

        // Godziny
        public int TotalHours { get; set; }
        public int TheoryHours { get; set; }
        public int LabHours { get; set; }
        public int OtherHours { get; set; }

        // Nota zmian
        public string? ChangeNote { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // ✅ Walidacja godzin - TO ZOSTAJE
            if (TotalHours != TheoryHours + LabHours + OtherHours)
            {
                yield return new ValidationResult(
                    "Suma godzin teorii, laboratorium i innych musi równać się godzinom całkowitym.",
                    new[] { nameof(TotalHours), nameof(TheoryHours), nameof(LabHours), nameof(OtherHours) });
            }

            // ❌ USUNIĘTO walidację VersionNumber - backend ustawia to automatycznie
            // if (VersionNumber <= 0) { ... }
        }
    }
}