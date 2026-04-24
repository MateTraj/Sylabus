using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Center> Centers { get; set; }
        public DbSet<Curriculum> Curriculums { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<SubjectVersion> SubjectVersions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Curriculum -> Subjects (1:many)
            modelBuilder.Entity<Curriculum>()
                .HasMany(c => c.Subjects)
                .WithOne(s => s.Curriculum)
                .HasForeignKey(s => s.CurriculumId)
                .OnDelete(DeleteBehavior.Cascade);

            // Subject -> Versions (1:many)
            modelBuilder.Entity<Subject>()
                .HasMany(s => s.Versions)
                .WithOne(v => v.Subject)
                .HasForeignKey(v => v.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Center -> Curriculums (1:many)
            modelBuilder.Entity<Center>()
                .HasMany<Curriculum>()
                .WithOne(c => c.Center)
                .HasForeignKey(c => c.CenterId)
                .OnDelete(DeleteBehavior.SetNull);

            // Unique constraint na kod centrum
            modelBuilder.Entity<Center>()
                .HasIndex(c => c.Code)
                .IsUnique();

            // Seed data
            SeedData(modelBuilder);

            base.OnModelCreating(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Centers
            var centerInformatyka = new Center 
            { 
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), 
                Name = "Wydzia³ Informatyki", 
                Code = "WI" 
            };
            
            var centerMatematyka = new Center 
            { 
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), 
                Name = "Wydzia³ Matematyki", 
                Code = "WM" 
            };
            
            modelBuilder.Entity<Center>().HasData(centerInformatyka, centerMatematyka);

            // Curriculums (Siatki przedmiotów)
            var curriculumInf2025 = new Curriculum
            {
                Id = Guid.Parse("c1111111-1111-1111-1111-111111111111"),
                Name = "Informatyka I stopieñ 2025/2026",
                Code = "INF-I-2025",
                Description = "Program studiów pierwszego stopnia na kierunku Informatyka, rok akademicki 2025/2026",
                CenterId = centerInformatyka.Id,
                AcademicYear = 2025,
                Level = "I stopieñ",
                StudyMode = "Stacjonarne",
                CreatedAt = new DateTime(2025, 1, 1, 10, 0, 0, DateTimeKind.Utc),
                CreatedBy = "System"
            };

            var curriculumMat2025 = new Curriculum
            {
                Id = Guid.Parse("c2222222-2222-2222-2222-222222222222"),
                Name = "Matematyka I stopieñ 2025/2026",
                Code = "MAT-I-2025",
                Description = "Program studiów pierwszego stopnia na kierunku Matematyka",
                CenterId = centerMatematyka.Id,
                AcademicYear = 2025,
                Level = "I stopieñ",
                StudyMode = "Stacjonarne",
                CreatedAt = new DateTime(2025, 1, 1, 10, 0, 0, DateTimeKind.Utc),
                CreatedBy = "System"
            };

            modelBuilder.Entity<Curriculum>().HasData(curriculumInf2025, curriculumMat2025);

            // Subjects (Przedmioty)
            var subjectPO = new Subject
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                Code = "INF-PO-001",
                Name = "Programowanie Obiektowe",
                Description = "Kurs zaawansowanego programowania obiektowego w C# i .NET",
                CurriculumId = curriculumInf2025.Id,
                Semester = 3,
                SubjectType = "Obowi¹zkowy",
                EctsPoints = 6,
                CreatedAt = new DateTime(2025, 1, 15, 10, 0, 0, DateTimeKind.Utc),
                CreatedBy = "System"
            };

            var subjectBD = new Subject
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                Code = "INF-BD-002",
                Name = "Bazy Danych",
                Description = "Projektowanie i administracja relacyjnych baz danych",
                CurriculumId = curriculumInf2025.Id,
                Semester = 4,
                SubjectType = "Obowi¹zkowy",
                EctsPoints = 5,
                CreatedAt = new DateTime(2025, 2, 1, 10, 0, 0, DateTimeKind.Utc),
                CreatedBy = "System"
            };

            var subjectAL = new Subject
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                Code = "MAT-AL-001",
                Name = "Algebra Liniowa",
                Description = "Podstawy algebry liniowej",
                CurriculumId = curriculumMat2025.Id,
                Semester = 1,
                SubjectType = "Obowi¹zkowy",
                EctsPoints = 4,
                CreatedAt = new DateTime(2025, 1, 10, 10, 0, 0, DateTimeKind.Utc),
                CreatedBy = "System"
            };

            modelBuilder.Entity<Subject>().HasData(subjectPO, subjectBD, subjectAL);

            // Subject Versions
            var versionPO = new SubjectVersion
            {
                Id = Guid.Parse("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                SubjectId = subjectPO.Id,
                VersionNumber = 1,
                Title = "Programowanie Obiektowe",
                Description = "Podstawy OOP, dziedziczenie, polimorfizm, wzorce projektowe",
                LearningOutcomes = "Student zna zasady SOLID, umie stosowaæ wzorce projektowe",
                Prerequisites = "Podstawy programowania",
                Literature = "Clean Code - Robert Martin, Design Patterns - Gang of Four",
                AssessmentMethods = "Projekt koñcowy (60%), Kolokwium (40%)",
                TotalHours = 60,
                TheoryHours = 30,
                LabHours = 30,
                OtherHours = 0,
                CreatedAt = new DateTime(2025, 1, 15, 12, 0, 0, DateTimeKind.Utc),
                CreatedBy = "dr Jan Kowalski"
            };

            var versionBD = new SubjectVersion
            {
                Id = Guid.Parse("22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                SubjectId = subjectBD.Id,
                VersionNumber = 1,
                Title = "Bazy Danych",
                Description = "SQL, normalizacja, indeksy, transakcje",
                LearningOutcomes = "Student umie projektowaæ schematy baz danych, pisaæ zaawansowane zapytania SQL",
                Prerequisites = "Podstawy informatyki",
                Literature = "Database System Concepts - Silberschatz",
                AssessmentMethods = "Egzamin pisemny (50%), Projekt (50%)",
                TotalHours = 75,
                TheoryHours = 30,
                LabHours = 45,
                OtherHours = 0,
                CreatedAt = new DateTime(2025, 2, 1, 14, 0, 0, DateTimeKind.Utc),
                CreatedBy = "dr Anna Nowak"
            };

            var versionAL = new SubjectVersion
            {
                Id = Guid.Parse("33333333-cccc-cccc-cccc-cccccccccccc"),
                SubjectId = subjectAL.Id,
                VersionNumber = 1,
                Title = "Algebra Liniowa",
                Description = "Przestrzenie wektorowe, macierze",
                LearningOutcomes = "Student rozumie podstawowe struktury algebry liniowej",
                Prerequisites = "Matematyka szkolna",
                Literature = "Algebra liniowa - G. Banaszak",
                AssessmentMethods = "Egzamin (70%), Kolokwia (30%)",
                TotalHours = 45,
                TheoryHours = 30,
                LabHours = 15,
                OtherHours = 0,
                CreatedAt = new DateTime(2025, 1, 10, 12, 0, 0, DateTimeKind.Utc),
                CreatedBy = "prof. Marek Wiœniewski"
            };

            modelBuilder.Entity<SubjectVersion>().HasData(versionPO, versionBD, versionAL);
        }
    }
}