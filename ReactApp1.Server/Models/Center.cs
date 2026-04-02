using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.Models
{
    public class Center
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, StringLength(128)]
        public string Name { get; set; } = string.Empty;

        [Required, StringLength(32)]
        public string Code { get; set; } = string.Empty;
    }
}