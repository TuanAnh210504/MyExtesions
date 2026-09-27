using System;
using System.Net.Http;
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
        };
        _httpClient.DefaultRequestHeaders.TryAddWithoutValidation(
            "User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        );
    }

    /// <summary>
    /// Dịch văn bản tiếng Anh sang tiếng Việt qua MyMemory API (miễn phí, không cần key).
    /// </summary>
    public async Task<string> TranslateEnToViAsync(string text, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        string query = Uri.EscapeDataString(text.Trim());
        string url = $"https://api.mymemory.translated.net/get?q={query}&langpair=en|vi";

        try
        {
            using var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            string json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(json);

            var root = doc.RootElement;

            int status = root.TryGetProperty("responseStatus", out var statusProp)
                ? statusProp.GetInt32()
                : 0;

            if (status != 200)
            {
                string details = root.TryGetProperty("responseDetails", out var d) ? d.GetString() ?? "" : "";
                throw new Exception($"MyMemory trả về lỗi {status}: {details}");
            }

            string translated = "";
            if (root.TryGetProperty("responseData", out var data) &&
                data.TryGetProperty("translatedText", out var translatedEl))
            {
                translated = translatedEl.GetString() ?? "";
            }

            return translated.Trim();
        }
        catch (HttpRequestException ex)
        {
            throw new Exception($"Lỗi mạng khi dịch: {ex.Message}", ex);
        }
        catch (TaskCanceledException)
        {
            throw new TimeoutException("Yêu cầu dịch đã hết thời gian chờ.");
        }
        catch (Exception ex) when (ex is not TimeoutException)
        {
            throw new Exception($"Không thể phân tích kết quả dịch: {ex.Message}", ex);
        }
    }
}
