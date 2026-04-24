using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ReactApp1.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Centers",
                columns: new[] { "Id", "Code", "Name" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "WI", "Wydział Informatyki" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "WM", "Wydział Matematyki" },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "WF", "Wydział Fizyki" }
                });

            migrationBuilder.InsertData(
                table: "Syllabuses",
                columns: new[] { "Id", "CenterId", "Code", "Description", "Title", "YearIntroduced" },
                values: new object[,]
                {
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), new Guid("11111111-1111-1111-1111-111111111111"), "INF-PO-001", "Kurs zaawansowanego programowania obiektowego w C# i .NET", "Programowanie Obiektowe", 2025 },
                    { new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), new Guid("11111111-1111-1111-1111-111111111111"), "INF-BD-002", "Projektowanie i administracja relacyjnych baz danych", "Bazy Danych", 2026 },
                    { new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), new Guid("22222222-2222-2222-2222-222222222222"), "MAT-AL-001", "Podstawy algebry liniowej dla studentów I stopnia", "Algebra Liniowa", 2025 },
                    { new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"), new Guid("33333333-3333-3333-3333-333333333333"), "FIZ-KW-001", "Wprowadzenie do mechaniki kwantowej", "Fizyka Kwantowa", 2026 }
                });

            migrationBuilder.InsertData(
                table: "CurriculumGridEntries",
                columns: new[] { "Id", "Hours", "Semester", "SyllabusId", "Year" },
                values: new object[,]
                {
                    { new Guid("28d9e810-7453-40f6-9b32-30f9a27b78a1"), 60, 5, new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"), 2026 },
                    { new Guid("63078e1c-cc2c-4687-a0a7-f1f2c63f878c"), 75, 4, new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), 2026 },
                    { new Guid("85656f01-9193-496c-a044-2d6d0bf8a873"), 60, 3, new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), 2025 },
                    { new Guid("aaa158b9-2f05-4435-bf15-42e4ef3985fd"), 30, 1, new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), 2025 },
                    { new Guid("b86482bc-6097-48c9-9445-6e4205986471"), 15, 2, new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), 2025 }
                });

            migrationBuilder.InsertData(
                table: "SyllabusVersions",
                columns: new[] { "Id", "AssessmentMethods", "ChangeNote", "CreatedAt", "CreatedBy", "Description", "LabHours", "LearningOutcomes", "Literature", "OtherHours", "Prerequisites", "SyllabusId", "TheoryHours", "Title", "TotalHours", "VersionNumber" },
                values: new object[,]
                {
                    { new Guid("a0000001-0000-0000-0000-000000000001"), "Projekt końcowy (60%), Kolokwium (40%)", null, new DateTime(2025, 1, 15, 10, 0, 0, 0, DateTimeKind.Utc), "dr Jan Kowalski", "Podstawy OOP, dziedziczenie, polimorfizm, wzorce projektowe", 30, "Student zna zasady SOLID, umie stosować wzorce projektowe", "Clean Code - Robert Martin, Design Patterns - Gang of Four", 0, "Podstawy programowania", new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), 30, "Programowanie Obiektowe", 60, 1 },
                    { new Guid("b0000001-0000-0000-0000-000000000001"), "Egzamin pisemny (50%), Projekt (50%)", null, new DateTime(2026, 2, 10, 14, 30, 0, 0, DateTimeKind.Utc), "dr Anna Nowak", "SQL, normalizacja, indeksy, transakcje, administracja", 45, "Student umie projektować schematy baz danych, pisać zaawansowane zapytania SQL", "Database System Concepts - Silberschatz, SQL dla każdego", 0, "Podstawy informatyki", new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), 30, "Bazy Danych", 75, 1 },
                    { new Guid("c0000001-0000-0000-0000-000000000001"), "Egzamin (70%), Kolokwia (30%)", null, new DateTime(2025, 3, 5, 9, 0, 0, 0, DateTimeKind.Utc), "prof. Marek Wiśniewski", "Przestrzenie wektorowe, macierze, układy równań, wartości własne", 15, "Student rozumie podstawowe struktury algebry liniowej", "Algebra liniowa - G. Banaszak, Linear Algebra - Lay", 0, "Matematyka szkolna", new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), 30, "Algebra Liniowa", 45, 1 },
                    { new Guid("d0000001-0000-0000-0000-000000000001"), "Egzamin ustny (60%), Zadania domowe (40%)", null, new DateTime(2026, 4, 12, 11, 15, 0, 0, DateTimeKind.Utc), "prof. Ewa Zielińska", "Postulaty mechaniki kwantowej, funkcja falowa, operator Hamiltona", 0, "Student rozumie podstawowe pojęcia mechaniki kwantowej", "Introduction to Quantum Mechanics - Griffiths", 15, "Fizyka klasyczna, Matematyka wyższa", new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"), 45, "Fizyka Kwantowa", 60, 1 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "CurriculumGridEntries",
                keyColumn: "Id",
                keyValue: new Guid("28d9e810-7453-40f6-9b32-30f9a27b78a1"));

            migrationBuilder.DeleteData(
                table: "CurriculumGridEntries",
                keyColumn: "Id",
                keyValue: new Guid("63078e1c-cc2c-4687-a0a7-f1f2c63f878c"));

            migrationBuilder.DeleteData(
                table: "CurriculumGridEntries",
                keyColumn: "Id",
                keyValue: new Guid("85656f01-9193-496c-a044-2d6d0bf8a873"));

            migrationBuilder.DeleteData(
                table: "CurriculumGridEntries",
                keyColumn: "Id",
                keyValue: new Guid("aaa158b9-2f05-4435-bf15-42e4ef3985fd"));

            migrationBuilder.DeleteData(
                table: "CurriculumGridEntries",
                keyColumn: "Id",
                keyValue: new Guid("b86482bc-6097-48c9-9445-6e4205986471"));

            migrationBuilder.DeleteData(
                table: "SyllabusVersions",
                keyColumn: "Id",
                keyValue: new Guid("a0000001-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "SyllabusVersions",
                keyColumn: "Id",
                keyValue: new Guid("b0000001-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "SyllabusVersions",
                keyColumn: "Id",
                keyValue: new Guid("c0000001-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "SyllabusVersions",
                keyColumn: "Id",
                keyValue: new Guid("d0000001-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Syllabuses",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "Syllabuses",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"));

            migrationBuilder.DeleteData(
                table: "Syllabuses",
                keyColumn: "Id",
                keyValue: new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"));

            migrationBuilder.DeleteData(
                table: "Syllabuses",
                keyColumn: "Id",
                keyValue: new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"));

            migrationBuilder.DeleteData(
                table: "Centers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "Centers",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "Centers",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));
        }
    }
}
