using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReactApp1.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                name: "Syllabuses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Code = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    CenterId = table.Column<Guid>(type: "TEXT", nullable: true),
                    YearIntroduced = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Syllabuses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Syllabuses_Centers_CenterId",
                        column: x => x.CenterId,
                        principalTable: "Centers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CurriculumGridEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SyllabusId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Semester = table.Column<int>(type: "INTEGER", nullable: false),
                    Hours = table.Column<int>(type: "INTEGER", nullable: false),
                    Year = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CurriculumGridEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CurriculumGridEntries_Syllabuses_SyllabusId",
                        column: x => x.SyllabusId,
                        principalTable: "Syllabuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SyllabusVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    SyllabusId = table.Column<Guid>(type: "TEXT", nullable: false),
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
                    table.PrimaryKey("PK_SyllabusVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SyllabusVersions_Syllabuses_SyllabusId",
                        column: x => x.SyllabusId,
                        principalTable: "Syllabuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Centers_Code",
                table: "Centers",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CurriculumGridEntries_SyllabusId",
                table: "CurriculumGridEntries",
                column: "SyllabusId");

            migrationBuilder.CreateIndex(
                name: "IX_Syllabuses_CenterId",
                table: "Syllabuses",
                column: "CenterId");

            migrationBuilder.CreateIndex(
                name: "IX_SyllabusVersions_SyllabusId",
                table: "SyllabusVersions",
                column: "SyllabusId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CurriculumGridEntries");

            migrationBuilder.DropTable(
                name: "SyllabusVersions");

            migrationBuilder.DropTable(
                name: "Syllabuses");

            migrationBuilder.DropTable(
                name: "Centers");
        }
    }
}
