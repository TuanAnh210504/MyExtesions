using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace NoteBookEng.Services;

public class TranslationService
{
    private readonly HttpClient _httpClient;

    public TranslationService()
    {
        var handler = new SocketsHttpHandler
        {
            AutomaticDecompression = System.Net.DecompressionMethods.All
        };
        _httpClient = new HttpClient(handler)
        {
            Timeout = TimeSpan.FromSeconds(10),
            DefaultRequestVersion = System.Net.HttpVersion.Version11
        };
        _httpClient.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", "curl/8.21.0");
        _httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Accept", "*/*");
    }

    /// <summary>
    /// Translates English text to Vietnamese using the Google Translate endpoint, 
    /// pulling in pronunciation and dictionary meanings if available.
    /// </summary>
    public async Task<string> TranslateEnToViAsync(string text, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        string query = Uri.EscapeDataString(text.Trim());
        // Added dt=bd (dictionary) and dt=rm (romanization/pronunciation)
        string url = $"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&dt=rm&q={query}";

        try
        {
            using var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            string json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(json);

            var sb = new StringBuilder();
            string primaryTranslation = "";
            string pronunciation = "";

            if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
            {
                // Parse standard translations & pronunciation
                var sentences = doc.RootElement[0];
                if (sentences.ValueKind == JsonValueKind.Array)
                {
                    foreach (var sentence in sentences.EnumerateArray())
                    {
                        if (sentence.ValueKind == JsonValueKind.Array)
                        {
                            if (sentence.GetArrayLength() > 0 && sentence[0].ValueKind == JsonValueKind.String)
                            {
                                primaryTranslation += sentence[0].GetString();
                            }
                            
                            // Pronunciation is often found as the 4th element (index 3) when the first element is null
                            if (sentence.GetArrayLength() > 3 && 
                                sentence[0].ValueKind == JsonValueKind.Null && 
                                sentence[3].ValueKind == JsonValueKind.String)
                            {
                                pronunciation = sentence[3].GetString() ?? "";
                            }
                        }
                    }
                }

                sb.Append(primaryTranslation.Trim());

                if (!string.IsNullOrWhiteSpace(pronunciation))
                {
                    sb.AppendLine();
                    sb.Append($"/{pronunciation}/");
                }

                // Parse dictionary definitions if available (Multiple meanings)
                if (doc.RootElement.GetArrayLength() > 1 && doc.RootElement[1].ValueKind == JsonValueKind.Array)
                {
                    var dictEntries = doc.RootElement[1];
                    sb.AppendLine();
                    
                    foreach (var entry in dictEntries.EnumerateArray())
                    {
                        if (entry.ValueKind == JsonValueKind.Array && entry.GetArrayLength() >= 2)
                        {
                            var pos = entry[0].GetString() ?? ""; // Part of speech (e.g. noun, verb)
                            var terms = entry[1];

                            if (terms.ValueKind == JsonValueKind.Array && terms.GetArrayLength() > 0)
                            {
                                sb.AppendLine();
                                sb.Append($"[{pos}]: ");
                                
                                bool first = true;
                                foreach (var term in terms.EnumerateArray())
                                {
                                    if (!first) sb.Append(", ");
                                    sb.Append(term.GetString());
                                    first = false;
                                }
                            }
                        }
                    }
                }
            }

            return sb.ToString().Trim();
        }
        catch (HttpRequestException ex)
        {
            throw new Exception($"Lỗi mạng khi dịch: {ex.Message}", ex);
        }
        catch (TaskCanceledException)
        {
            throw new TimeoutException("Yêu cầu dịch đã hết thời gian chờ.");
        }
        catch (Exception ex)
        {
            throw new Exception($"Không thể phân tích kết quả dịch: {ex.Message}", ex);
        }
    }
}
