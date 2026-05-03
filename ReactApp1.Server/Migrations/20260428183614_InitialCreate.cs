using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ReactApp1.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Centers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 128, nullable: false),
                    Code = table.Column<string>(type: "TEXT", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Centers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RoleId = table.Column<string>(type: "TEXT", nullable: false),
                    ClaimType = table.Column<string>(type: "TEXT", nullable: true),
                    ClaimValue = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    FullName = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CenterId = table.Column<Guid>(type: "TEXT", nullable: true),
                    UserName = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "INTEGER", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: true),
                    SecurityStamp = table.Column<string>(type: "TEXT", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "TEXT", nullable: true),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "INTEGER", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_Centers_CenterId",
                        column: x => x.CenterId,
                        principalTable: "Centers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Curriculums",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 128, nullable: false),
                    Code = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    CenterId = table.Column<Guid>(type: "TEXT", nullable: true),
                    AcademicYear = table.Column<int>(type: "INTEGER", nullable: false),
                    Level = table.Column<string>(type: "TEXT", maxLength: 32, nullable: true),
                    StudyMode = table.Column<string>(type: "TEXT", maxLength: 32, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Curriculums", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Curriculums_Centers_CenterId",
                        column: x => x.CenterId,
                        principalTable: "Centers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    ClaimType = table.Column<string>(type: "TEXT", nullable: true),
                    ClaimValue = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "TEXT", nullable: false),
                    ProviderKey = table.Column<string>(type: "TEXT", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "TEXT", nullable: true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    RoleId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    LoginProvider = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Value = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Subjects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Code = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    CurriculumId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Semester = table.Column<int>(type: "INTEGER", nullable: false),
                    SubjectType = table.Column<string>(type: "TEXT", maxLength: 32, nullable: true),
                    EctsPoints = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Subjects_Curriculums_CurriculumId",
                        column: x => x.CurriculumId,
                        principalTable: "Curriculums",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubjectVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SubjectId = table.Column<Guid>(type: "TEXT", nullable: false),
                    VersionNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    LearningOutcomes = table.Column<string>(type: "TEXT", nullable: true),
                    Prerequisites = table.Column<string>(type: "TEXT", nullable: true),
                    Literature = table.Column<string>(type: "TEXT", nullable: true),
                    AssessmentMethods = table.Column<string>(type: "TEXT", nullable: true),
                    TotalHours = table.Column<int>(type: "INTEGER", nullable: false),
                    TheoryHours = table.Column<int>(type: "INTEGER", nullable: false),
                    LabHours = table.Column<int>(type: "INTEGER", nullable: false),
                    OtherHours = table.Column<int>(type: "INTEGER", nullable: false),
                    ChangeNote = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedBy = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubjectVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubjectVersions_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Subjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "role-admin-guid", null, "Admin", "ADMIN" },
                    { "role-editor-guid", null, "Editor", "EDITOR" },
                    { "role-reader-guid", null, "Reader", "READER" }
                });

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "CenterId", "ConcurrencyStamp", "CreatedAt", "Email", "EmailConfirmed", "FullName", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UserName" },
                values: new object[,]
                {
                    { "user-editor-guid", 0, null, "38b9fb20-442b-4103-82b3-492058c02b63", new DateTime(2026, 4, 28, 18, 36, 14, 145, DateTimeKind.Utc).AddTicks(1540), "editor@uczelnia.pl", true, "Jan Kowalski (Edytor)", false, null, "EDITOR@UCZELNIA.PL", "EDITOR@UCZELNIA.PL", "AQAAAAIAAYagAAAAEMD14hKZRD6hC5/nia5t0Ob7KyU+c74lc1CSG6idZM5SJStP9d3LhogSaJg+4nn8iA==", null, false, "abc56447-4e57-4b35-bd06-30d6f3607116", false, "editor@uczelnia.pl" },
                    { "user-reader-guid", 0, null, "d3237838-068f-44bb-b944-ab9fd8fa2e53", new DateTime(2026, 4, 28, 18, 36, 14, 180, DateTimeKind.Utc).AddTicks(2698), "reader@uczelnia.pl", true, "Anna Nowak (Czytelnik)", false, null, "READER@UCZELNIA.PL", "READER@UCZELNIA.PL", "AQAAAAIAAYagAAAAEBWHSfiSuNMCvodistLFn25hCxDnbirqPGKVzYhmjnPa9G6vMXu6Uc31lJMq7Kho0Q==", null, false, "0ebd6acc-f725-4f2e-992c-96dc4815e9d4", false, "reader@uczelnia.pl" }
                });

            migrationBuilder.InsertData(
                table: "Centers",
                columns: new[] { "Id", "Code", "Name" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "WI", "Wydział Informatyki" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "WM", "Wydział Matematyki" }
                });

            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[,]
                {
                    { "role-editor-guid", "user-editor-guid" },
                    { "role-reader-guid", "user-reader-guid" }
                });

            migrationBuilder.InsertData(
                table: "Curriculums",
                columns: new[] { "Id", "AcademicYear", "CenterId", "Code", "CreatedAt", "CreatedBy", "Description", "Level", "Name", "StudyMode" },
                values: new object[,]
                {
                    { new Guid("c1111111-1111-1111-1111-111111111111"), 2025, new Guid("11111111-1111-1111-1111-111111111111"), "INF-I-2025", new DateTime(2025, 1, 1, 10, 0, 0, 0, DateTimeKind.Utc), "System", "Program studiów pierwszego stopnia na kierunku Informatyka, rok akademicki 2025/2026", "I stopień", "Informatyka I stopień 2025/2026", "Stacjonarne" },
                    { new Guid("c2222222-2222-2222-2222-222222222222"), 2025, new Guid("22222222-2222-2222-2222-222222222222"), "MAT-I-2025", new DateTime(2025, 1, 1, 10, 0, 0, 0, DateTimeKind.Utc), "System", "Program studiów pierwszego stopnia na kierunku Matematyka", "I stopień", "Matematyka I stopień 2025/2026", "Stacjonarne" }
                });

            migrationBuilder.InsertData(
                table: "Subjects",
                columns: new[] { "Id", "Code", "CreatedAt", "CreatedBy", "CurriculumId", "Description", "EctsPoints", "Name", "Semester", "SubjectType" },
                values: new object[,]
                {
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), "INF-PO-001", new DateTime(2025, 1, 15, 10, 0, 0, 0, DateTimeKind.Utc), "System", new Guid("c1111111-1111-1111-1111-111111111111"), "Kurs zaawansowanego programowania obiektowego w C# i .NET", 6, "Programowanie Obiektowe", 3, "Obowiązkowy" },
                    { new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), "INF-BD-002", new DateTime(2025, 2, 1, 10, 0, 0, 0, DateTimeKind.Utc), "System", new Guid("c1111111-1111-1111-1111-111111111111"), "Projektowanie i administracja relacyjnych baz danych", 5, "Bazy Danych", 4, "Obowiązkowy" },
                    { new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), "MAT-AL-001", new DateTime(2025, 1, 10, 10, 0, 0, 0, DateTimeKind.Utc), "System", new Guid("c2222222-2222-2222-2222-222222222222"), "Podstawy algebry liniowej", 4, "Algebra Liniowa", 1, "Obowiązkowy" }
                });

            migrationBuilder.InsertData(
                table: "SubjectVersions",
                columns: new[] { "Id", "AssessmentMethods", "ChangeNote", "CreatedAt", "CreatedBy", "Description", "LabHours", "LearningOutcomes", "Literature", "OtherHours", "Prerequisites", "SubjectId", "TheoryHours", "Title", "TotalHours", "VersionNumber" },
                values: new object[,]
                {
                    { new Guid("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), "Projekt końcowy (60%), Kolokwium (40%)", null, new DateTime(2025, 1, 15, 12, 0, 0, 0, DateTimeKind.Utc), "dr Jan Kowalski", "Podstawy OOP, dziedziczenie, polimorfizm, wzorce projektowe", 30, "Student zna zasady SOLID, umie stosować wzorce projektowe", "Clean Code - Robert Martin, Design Patterns - Gang of Four", 0, "Podstawy programowania", new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), 30, "Programowanie Obiektowe", 60, 1 },
                    { new Guid("22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), "Egzamin pisemny (50%), Projekt (50%)", null, new DateTime(2025, 2, 1, 14, 0, 0, 0, DateTimeKind.Utc), "dr Anna Nowak", "SQL, normalizacja, indeksy, transakcje", 45, "Student umie projektować schematy baz danych, pisać zaawansowane zapytania SQL", "Database System Concepts - Silberschatz", 0, "Podstawy informatyki", new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), 30, "Bazy Danych", 75, 1 },
                    { new Guid("33333333-cccc-cccc-cccc-cccccccccccc"), "Egzamin (70%), Kolokwia (30%)", null, new DateTime(2025, 1, 10, 12, 0, 0, 0, DateTimeKind.Utc), "prof. Marek Wiśniewski", "Przestrzenie wektorowe, macierze", 15, "Student rozumie podstawowe struktury algebry liniowej", "Algebra liniowa - G. Banaszak", 0, "Matematyka szkolna", new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), 30, "Algebra Liniowa", 45, 1 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_CenterId",
                table: "AspNetUsers",
                column: "CenterId");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Centers_Code",
                table: "Centers",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Curriculums_CenterId",
                table: "Curriculums",
                column: "CenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_CurriculumId",
                table: "Subjects",
                column: "CurriculumId");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectVersions_SubjectId",
                table: "SubjectVersions",
                column: "SubjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "SubjectVersions");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Subjects");

            migrationBuilder.DropTable(
                name: "Curriculums");

            migrationBuilder.DropTable(
                name: "Centers");
        }
    }
}
