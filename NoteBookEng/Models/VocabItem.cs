using System;

namespace NoteBookEng.Models;

public class VocabItem
{
    public long Id { get; set; }
    public string Word { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public string FormattedTime => CreatedAt.ToLocalTime().ToString("g");

    public string ShortMeaning
    {
        get
        {
            if (string.IsNullOrWhiteSpace(Meaning)) return string.Empty;
            var lines = Meaning.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            return lines.Length > 0 ? lines[0] : Meaning;
        }
    }
}
