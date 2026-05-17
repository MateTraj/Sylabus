using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Services
{
    /// <summary>
    /// Serwis do generowania PDF sylabusów w stylu Politechniki Wroc³awskiej
    /// </summary>
    public class SyllabusPdfService
    {
        public byte[] GenerateSubjectPdf(Subject subject, SubjectVersion version, Curriculum curriculum)
        {
            // Licencja QuestPDF (Community - darmowa dla projektów edukacyjnych)
            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Calibri"));

                    page.Header().Element(ComposeHeader);
                    page.Content().Element(content => ComposeContent(content, subject, version, curriculum));
                    page.Footer().AlignCenter().Text(text =>
                    {
                        text.Span("Strona ");
                        text.CurrentPageNumber();
                        text.Span(" z ");
                        text.TotalPages();
                    });
                });
            });

            return document.GeneratePdf();
        }

        private void ComposeHeader(IContainer container)
        {
            container.Column(column =>
            {
                // Logo i nazwa uczelni (mo¿esz dodaæ logo)
                column.Item().AlignCenter().Text("UCZELNIA")
                    .FontSize(16).Bold();

                column.Item().PaddingTop(5).AlignCenter().Text("Wydzia³ Informatyki i Telekomunikacji")
                    .FontSize(12);

                column.Item().PaddingTop(10).PaddingBottom(10)
                    .BorderBottom(1).BorderColor(Colors.Grey.Lighten1);
            });
        }

        private void ComposeContent(IContainer container, Subject subject, SubjectVersion version, Curriculum curriculum)
        {
            container.Column(column =>
            {
                // Tytu³ dokumentu
                column.Item().PaddingTop(10).PaddingBottom(10)
                    .AlignCenter().Text("KARTA PRZEDMIOTU")
                    .FontSize(18).Bold();

                // Sekcja 1: Dane podstawowe
                column.Item().Element(c => ComposeBasicInfo(c, subject, version, curriculum));

                // Sekcja 2: Opis przedmiotu
                if (!string.IsNullOrWhiteSpace(version.Description))
                {
                    column.Item().PaddingTop(15).Element(c => ComposeSection(c, "OPIS PRZEDMIOTU", version.Description));
                }

                // Sekcja 3: Efekty kszta³cenia
                if (!string.IsNullOrWhiteSpace(version.LearningOutcomes))
                {
                    column.Item().PaddingTop(15).Element(c => ComposeSection(c, "EFEKTY UCZENIA SIÊ", version.LearningOutcomes));
                }

                // Sekcja 4: Wymagania wstêpne
                if (!string.IsNullOrWhiteSpace(version.Prerequisites))
                {
                    column.Item().PaddingTop(15).Element(c => ComposeSection(c, "WYMAGANIA WSTÊPNE", version.Prerequisites));
                }

                // Sekcja 5: Godziny
                column.Item().PaddingTop(15).Element(c => ComposeHoursTable(c, version));

                // Sekcja 6: Metody oceniania
                if (!string.IsNullOrWhiteSpace(version.AssessmentMethods))
                {
                    column.Item().PaddingTop(15).Element(c => ComposeSection(c, "METODY OCENIANIA", version.AssessmentMethods));
                }

                // Sekcja 7: Literatura
                if (!string.IsNullOrWhiteSpace(version.Literature))
                {
                    column.Item().PaddingTop(15).Element(c => ComposeSection(c, "LITERATURA", version.Literature));
                }

                // Stopka dokumentu
                column.Item().PaddingTop(20).Element(ComposeFooter);
            });
        }

        private void ComposeBasicInfo(IContainer container, Subject subject, SubjectVersion version, Curriculum curriculum)
        {
            container.Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(150);
                    columns.RelativeColumn();
                });

                // Kod przedmiotu
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text("Kod przedmiotu:").Bold();
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text(subject.Code);

                // Nazwa przedmiotu
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text("Nazwa przedmiotu:").Bold();
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text(subject.Name);

                // Siatka/Program studiów
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text("Program studiów:").Bold();
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text($"{curriculum.Name} ({curriculum.Code})");

                // Semestr
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text("Semestr:").Bold();
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text(subject.Semester.ToString());

                // ECTS
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text("Punkty ECTS:").Bold();
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text(subject.EctsPoints.ToString());

                // Typ przedmiotu
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text("Typ przedmiotu:").Bold();
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text(subject.SubjectType ?? "-");

                // Wersja
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text("Wersja sylabusa:").Bold();
                table.Cell().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5)
                    .Text($"v{version.VersionNumber} ({version.CreatedAt:dd.MM.yyyy})");
            });
        }

        private void ComposeSection(IContainer container, string title, string content)
        {
            container.Column(column =>
            {
                column.Item().Background(Colors.Grey.Lighten3).Padding(8)
                    .Text(title).FontSize(12).Bold();

                column.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10)
                    .Text(content).LineHeight(1.5f);
            });
        }

        private void ComposeHoursTable(IContainer container, SubjectVersion version)
        {
            container.Column(column =>
            {
                column.Item().Background(Colors.Grey.Lighten3).Padding(8)
                    .Text("GODZINY ZAJÊÆ").FontSize(12).Bold();

                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(1);
                    });

                    // Nag³ówek
                    table.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(5)
                        .Text("Rodzaj zajêæ").Bold();
                    table.Cell().Border(1).Background(Colors.Grey.Lighten2).Padding(5)
                        .AlignCenter().Text("Liczba godzin").Bold();

                    // Wiersze
                    table.Cell().Border(1).Padding(5).Text("Wyk³ad");
                    table.Cell().Border(1).Padding(5).AlignCenter().Text(version.TheoryHours.ToString());

                    table.Cell().Border(1).Padding(5).Text("Laboratorium");
                    table.Cell().Border(1).Padding(5).AlignCenter().Text(version.LabHours.ToString());

                    table.Cell().Border(1).Padding(5).Text("Inne");
                    table.Cell().Border(1).Padding(5).AlignCenter().Text(version.OtherHours.ToString());

                    table.Cell().Border(1).Background(Colors.Blue.Lighten4).Padding(5).Text("Razem").Bold();
                    table.Cell().Border(1).Background(Colors.Blue.Lighten4).Padding(5).AlignCenter().Text(version.TotalHours.ToString()).Bold();
                });
            });
        }

        private void ComposeFooter(IContainer container)
        {
            container.Column(column =>
            {
                column.Item().BorderTop(1).BorderColor(Colors.Grey.Lighten1).PaddingTop(10)
                    .Text(text =>
                    {
                        text.Span("Wygenerowano: ").FontSize(8).FontColor(Colors.Grey.Darken1);
                        text.Span(DateTime.Now.ToString("dd.MM.yyyy HH:mm")).FontSize(8).Bold();
                    });
            });
        }
    }
}