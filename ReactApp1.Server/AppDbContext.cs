using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Syllabus> Syllabuses { get; set; }
        public DbSet<SyllabusVersion> SyllabusVersions { get; set; }
        public DbSet<CurriculumGridEntry> CurriculumGridEntries { get; set; }
        public DbSet<Center> Centers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Syllabus>()
                .HasMany(s => s.Versions)
                .WithOne(v => v.Syllabus)
                .HasForeignKey(v => v.SyllabusId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Syllabus>()
                .HasMany(s => s.CurriculumEntries)
                .WithOne(e => e.Syllabus)
                .HasForeignKey(e => e.SyllabusId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Center>()
                .HasIndex(c => c.Code)
                .IsUnique();

            base.OnModelCreating(modelBuilder);
        }
    }
}