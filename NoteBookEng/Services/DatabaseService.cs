using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;
using NoteBookEng.Models;

namespace NoteBookEng.Services;

public class DatabaseService
{
    private readonly string _connectionString;
    public string DbPath { get; }

    public DatabaseService()
    {
        DbPath = Path.Combine(AppContext.BaseDirectory, "vocab.db");
        _connectionString = new SqliteConnectionStringBuilder
        {
            DataSource = DbPath,
            Mode = SqliteOpenMode.ReadWriteCreate
        }.ToString();
    }

    public async Task InitializeDatabaseAsync()
    {
        using var connection = new SqliteConnection(_connectionString);
        await connection.OpenAsync();

        var tableCmd = connection.CreateCommand();
        tableCmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS Vocab (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Word TEXT NOT NULL COLLATE NOCASE,
                Meaning TEXT NOT NULL,
                CreatedAt TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_vocab_word ON Vocab(Word);
        ";
        await tableCmd.ExecuteNonQueryAsync();
    }

    public async Task<List<VocabItem>> SearchWordsAsync(string query, int limit = 10)
    {
        var results = new List<VocabItem>();
        if (string.IsNullOrWhiteSpace(query))
            return results;

        query = query.Trim();
        using var connection = new SqliteConnection(_connectionString);
        await connection.OpenAsync();

        var cmd = connection.CreateCommand();
        cmd.CommandText = @"
            SELECT Id, Word, Meaning, CreatedAt
            FROM Vocab
            WHERE Word LIKE @contains ESCAPE '\'
            ORDER BY 
                CASE 
                    WHEN Word = @exact THEN 0
                    WHEN Word LIKE @prefix ESCAPE '\' THEN 1
                    ELSE 2 
                END,
                LENGTH(Word) ASC,
                Word ASC
            LIMIT @limit;
        ";

        string escaped = EscapeLike(query);
        cmd.Parameters.AddWithValue("@exact", query);
        cmd.Parameters.AddWithValue("@prefix", escaped + "%");
        cmd.Parameters.AddWithValue("@contains", "%" + escaped + "%");
        cmd.Parameters.AddWithValue("@limit", limit);

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            results.Add(new VocabItem
            {
                Id = reader.GetInt64(0),
                Word = reader.GetString(1),
                Meaning = reader.GetString(2),
                CreatedAt = DateTime.TryParse(reader.GetString(3), out var dt) ? dt : DateTime.UtcNow
            });
        }

        return results;
    }

    public async Task<VocabItem?> GetExactWordAsync(string word)
    {
        if (string.IsNullOrWhiteSpace(word))
            return null;

        word = word.Trim();
        using var connection = new SqliteConnection(_connectionString);
        await connection.OpenAsync();

        var cmd = connection.CreateCommand();
        cmd.CommandText = @"
            SELECT Id, Word, Meaning, CreatedAt
            FROM Vocab
            WHERE Word = @word COLLATE NOCASE
            LIMIT 1;
        ";
        cmd.Parameters.AddWithValue("@word", word);

        using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return new VocabItem
            {
                Id = reader.GetInt64(0),
                Word = reader.GetString(1),
                Meaning = reader.GetString(2),
                CreatedAt = DateTime.TryParse(reader.GetString(3), out var dt) ? dt : DateTime.UtcNow
            };
        }

        return null;
    }

    public async Task<VocabItem> AddOrUpdateWordAsync(string word, string meaning)
    {
        word = word.Trim();
        meaning = meaning.Trim();

        using var connection = new SqliteConnection(_connectionString);
        await connection.OpenAsync();

        var existing = await GetExactWordAsync(word);
        if (existing != null)
        {
            var updateCmd = connection.CreateCommand();
            updateCmd.CommandText = @"
                UPDATE Vocab
                SET Meaning = @meaning, CreatedAt = @createdAt
                WHERE Id = @id;
            ";
            updateCmd.Parameters.AddWithValue("@meaning", meaning);
            updateCmd.Parameters.AddWithValue("@createdAt", DateTime.UtcNow.ToString("o"));
            updateCmd.Parameters.AddWithValue("@id", existing.Id);
            await updateCmd.ExecuteNonQueryAsync();

            existing.Meaning = meaning;
            existing.CreatedAt = DateTime.UtcNow;
            return existing;
        }
        else
        {
            var insertCmd = connection.CreateCommand();
            insertCmd.CommandText = @"
                INSERT INTO Vocab (Word, Meaning, CreatedAt)
                VALUES (@word, @meaning, @createdAt);
                SELECT last_insert_rowid();
            ";
            insertCmd.Parameters.AddWithValue("@word", word);
            insertCmd.Parameters.AddWithValue("@meaning", meaning);
            var now = DateTime.UtcNow;
            insertCmd.Parameters.AddWithValue("@createdAt", now.ToString("o"));

            var newId = (long)(await insertCmd.ExecuteScalarAsync() ?? 0L);

            return new VocabItem
            {
                Id = newId,
                Word = word,
                Meaning = meaning,
                CreatedAt = now
            };
        }
    }

    public async Task<List<VocabItem>> GetRecentWordsAsync(int limit = 15)
    {
        var results = new List<VocabItem>();
        using var connection = new SqliteConnection(_connectionString);
        await connection.OpenAsync();

        var cmd = connection.CreateCommand();
        cmd.CommandText = @"
            SELECT Id, Word, Meaning, CreatedAt
            FROM Vocab
            ORDER BY Id DESC
            LIMIT @limit;
        ";
        cmd.Parameters.AddWithValue("@limit", limit);

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            results.Add(new VocabItem
            {
                Id = reader.GetInt64(0),
                Word = reader.GetString(1),
                Meaning = reader.GetString(2),
                CreatedAt = DateTime.TryParse(reader.GetString(3), out var dt) ? dt : DateTime.UtcNow
            });
        }

        return results;
    }

    public async Task<bool> DeleteWordAsync(long id)
    {
        using var connection = new SqliteConnection(_connectionString);
        await connection.OpenAsync();

        var cmd = connection.CreateCommand();
        cmd.CommandText = "DELETE FROM Vocab WHERE Id = @id;";
        cmd.Parameters.AddWithValue("@id", id);
        int rows = await cmd.ExecuteNonQueryAsync();
        return rows > 0;
    }

    private static string EscapeLike(string value)
    {
        return value
            .Replace(@"\", @"\\")
            .Replace("%", @"\%")
            .Replace("_", @"\_");
    }
}
