using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.Models
{
    public class SyllabusVersion : IValidatableObject
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid SyllabusId { get; set; }
        public Syllabus? Syllabus { get; set; }

        // Sequential version number
        public int VersionNumber { get; set; }

        [Required, StringLength(256)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        // Learning outcomes as text (can be migrated to structured collection later)
        public string? LearningOutcomes { get; set; }

        public string? Prerequisites { get; set; }

        public string? Literature { get; set; }

        public string? AssessmentMethods { get; set; }

        // Hours breakdown
        public int TotalHours { get; set; }
        public int TheoryHours { get; set; }
        public int LabHours { get; set; }
        public int OtherHours { get; set; }

        public string? ChangeNote { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (TotalHours != TheoryHours + LabHours + OtherHours)
            {
                yield return new ValidationResult(
                    "TotalHours must equal TheoryHours + LabHours + OtherHours.",
                    new[] { nameof(TotalHours), nameof(TheoryHours), nameof(LabHours), nameof(OtherHours) });
            }

            if (VersionNumber <= 0)
            {
                yield return new ValidationResult("VersionNumber must be greater than 0.", new[] { nameof(VersionNumber) });
            }
        }
    }
}