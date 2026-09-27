using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Threading;
using NoteBookEng.Models;
using NoteBookEng.Services;

namespace NoteBookEng;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    private readonly DatabaseService _databaseService;
    private readonly TranslationService _translationService;
    private readonly DispatcherTimer _debounceTimer;
    private readonly DispatcherTimer _toastTimer;
    private BubbleWindow _bubbleWindow;

    private bool _isTranslating;
    private bool _isUpdatingSelection;

    public MainWindow()
    {
        InitializeComponent();

        _databaseService = new DatabaseService();
        _translationService = new TranslationService();
        _bubbleWindow = new BubbleWindow(this);
        
        this.StateChanged += Window_StateChanged;

        // Cấu hình bộ đếm debounce tìm kiếm 250ms
        _debounceTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromMilliseconds(250)
        };
        _debounceTimer.Tick += DebounceTimer_Tick;

        // Cấu hình bộ đếm thông báo trạng thái tạm thời
        _toastTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(2.5)
        };
        _toastTimer.Tick += (s, e) =>
        {
            _toastTimer.Stop();
            TxtFooterStatus.Text = "Sẵn sàng";
            TxtFooterStatus.Foreground = (Brush)FindResource("TextSecondaryBrush");
        };

        UpdatePinVisualState();
    }

    private void Window_StateChanged(object? sender, EventArgs e)
    {
        if (this.WindowState == WindowState.Minimized)
        {
            this.WindowState = WindowState.Normal;
            MinimizeToBubble();
        }
    }

    private async void Window_Loaded(object sender, RoutedEventArgs e)
    {
        try
        {
            TxtFooterStatus.Text = "Đang khởi tạo cơ sở dữ liệu...";
            await _databaseService.InitializeDatabaseAsync();
            TxtFooterStatus.Text = "Sẵn sàng";
            await RefreshRecentWordsAsync();
            TxtWord.Focus();
        }
        catch (Exception ex)
        {
            TxtFooterStatus.Text = "Lỗi khởi tạo cơ sở dữ liệu";
            MessageBox.Show($"Không thể khởi tạo cơ sở dữ liệu: {ex.Message}", "Lỗi cơ sở dữ liệu", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    #region Window Controls & Topmost Pinning

    private void Header_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        if (e.ButtonState == MouseButtonState.Pressed)
        {
            DragMove();
        }
    }

    private void BtnPin_Click(object sender, RoutedEventArgs e)
    {
        Topmost = !Topmost;
        UpdatePinVisualState();
    }

    private void UpdatePinVisualState()
    {
        if (Topmost)
        {
            PathPin.Fill = (Brush)FindResource("AccentHoverBrush");
            BtnPin.ToolTip = "Luôn hiển thị trên cùng: BẬT";
            BtnPin.Opacity = 1.0;
        }
        else
        {
            PathPin.Fill = (Brush)FindResource("TextSecondaryBrush");
            BtnPin.ToolTip = "Luôn hiển thị trên cùng: TẮT";
            BtnPin.Opacity = 0.65;
        }
    }

    private void BtnMinimize_Click(object sender, RoutedEventArgs e)
    {
        MinimizeToBubble();
    }

    private void MinimizeToBubble()
    {
        this.Hide();
        
        if (double.IsNaN(_bubbleWindow.Left)) 
        {
            _bubbleWindow.Left = SystemParameters.WorkArea.Right - 90;
            _bubbleWindow.Top = SystemParameters.WorkArea.Bottom / 2;
        }
        
        _bubbleWindow.Show();
    }

    private void BtnClose_Click(object sender, RoutedEventArgs e)
    {
        _bubbleWindow?.Close();
        Close();
    }

    protected override void OnClosed(EventArgs e)
    {
        _bubbleWindow?.Close();
        base.OnClosed(e);
    }

    #endregion

    #region Search-As-You-Type & Debouncing

    private void TxtWord_TextChanged(object sender, TextChangedEventArgs e)
    {
        string text = TxtWord.Text.Trim();
        TxtWordPlaceholder.Visibility = string.IsNullOrEmpty(TxtWord.Text) ? Visibility.Visible : Visibility.Collapsed;
        BtnClearWord.Visibility = string.IsNullOrEmpty(TxtWord.Text) ? Visibility.Collapsed : Visibility.Visible;

        if (_isUpdatingSelection)
            return;

        // Reset debounce timer on every keystroke
        _debounceTimer.Stop();

        if (string.IsNullOrWhiteSpace(text))
        {
            PillStatus.Visibility = Visibility.Collapsed;
            TxtListHeader.Text = "Từ gần đây";
            _ = RefreshRecentWordsAsync();
        }
        else
        {
            _debounceTimer.Start();
        }
    }

    private async void DebounceTimer_Tick(object? sender, EventArgs e)
    {
        _debounceTimer.Stop();
        await ExecuteSearchAsync(TxtWord.Text.Trim());
    }

    private async Task ExecuteSearchAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            await RefreshRecentWordsAsync();
            return;
        }

        try
        {
            var results = await _databaseService.SearchWordsAsync(query);
            ListResults.ItemsSource = results;

            bool hasResults = results.Count > 0;
            PanelEmptyState.Visibility = Visibility.Collapsed;

            // Check if exact match exists
            var exactMatch = results.FirstOrDefault(r => string.Equals(r.Word, query, StringComparison.OrdinalIgnoreCase));

            PillStatus.Visibility = Visibility.Visible;
            if (exactMatch != null)
            {
                TxtStatusBadge.Text = "✓ Có trong sổ tay";
                TxtStatusBadge.Foreground = (Brush)FindResource("SuccessBrush");
                PillStatus.Background = new SolidColorBrush(Color.FromArgb(40, 16, 185, 129));
                PillStatus.BorderBrush = new SolidColorBrush(Color.FromArgb(120, 16, 185, 129));

                TxtListHeader.Text = $"Tìm thấy {results.Count} kết quả";

                // Nếu nghĩa trống, tự điền nghĩa của từ khớp chính xác
                if (string.IsNullOrWhiteSpace(TxtMeaning.Text))
                {
                    TxtMeaning.Text = exactMatch.Meaning;
                }
            }
            else
            {
                TxtStatusBadge.Text = "● Chưa có trong sổ tay";
                TxtStatusBadge.Foreground = (Brush)FindResource("WarningBrush");
                PillStatus.Background = new SolidColorBrush(Color.FromArgb(40, 245, 158, 11));
                PillStatus.BorderBrush = new SolidColorBrush(Color.FromArgb(120, 245, 158, 11));

                TxtListHeader.Text = hasResults ? $"Liên quan ({results.Count})" : "Không tìm thấy";
            }
        }
        catch (Exception ex)
        {
            ShowStatusMessage($"Lỗi tìm kiếm: {ex.Message}", isError: true);
        }
    }

    private void BtnClearWord_Click(object sender, RoutedEventArgs e)
    {
        TxtWord.Clear();
        TxtMeaning.Clear();
        TxtWord.Focus();
    }

    private void TxtWord_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Enter)
        {
            e.Handled = true;
            // Move focus to Meaning input for quick editing
            TxtMeaning.Focus();
            TxtMeaning.SelectAll();
        }
        else if (e.Key == Key.Down && ListResults.Items.Count > 0)
        {
            ListResults.SelectedIndex = 0;
            ListResults.Focus();
        }
    }

    #endregion

    #region Meaning Input & Quick Add

    private void TxtMeaning_TextChanged(object sender, TextChangedEventArgs e)
    {
        TxtMeaningPlaceholder.Visibility = string.IsNullOrEmpty(TxtMeaning.Text) ? Visibility.Visible : Visibility.Collapsed;
    }

    private async void TxtMeaning_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Enter && !Keyboard.Modifiers.HasFlag(ModifierKeys.Shift))
        {
            e.Handled = true;
            await SaveCurrentWordAsync();
        }
    }

    private async void BtnSave_Click(object sender, RoutedEventArgs e)
    {
        await SaveCurrentWordAsync();
    }

    private async Task SaveCurrentWordAsync()
    {
        string word = TxtWord.Text.Trim();
        string meaning = TxtMeaning.Text.Trim();

        if (string.IsNullOrWhiteSpace(word))
        {
            ShowStatusMessage("Vui lòng nhập từ trước.", isWarning: true);
            TxtWord.Focus();
            return;
        }

        if (string.IsNullOrWhiteSpace(meaning))
        {
            ShowStatusMessage("Vui lòng nhập nghĩa hoặc nhấn Dịch.", isWarning: true);
            TxtMeaning.Focus();
            return;
        }

        try
        {
            var item = await _databaseService.AddOrUpdateWordAsync(word, meaning);
            ShowStatusMessage($"Đã lưu: \"{item.Word}\"", isSuccess: true);

            // Xóa input và đặt focus lại vào ô Từ để nhập nhanh tiếp
            TxtWord.Clear();
            TxtMeaning.Clear();
            PillStatus.Visibility = Visibility.Collapsed;

            await RefreshRecentWordsAsync();
            TxtWord.Focus();
        }
        catch (Exception ex)
        {
            ShowStatusMessage($"Lưu thất bại: {ex.Message}", isError: true);
        }
    }

    #endregion

    #region Auto-Translate Service Integration

    private async void BtnTranslate_Click(object sender, RoutedEventArgs e)
    {
        string word = TxtWord.Text.Trim();
        if (string.IsNullOrWhiteSpace(word))
        {
            ShowStatusMessage("Nhập một từ tiếng Anh để dịch.", isWarning: true);
            TxtWord.Focus();
            return;
        }

        if (_isTranslating)
            return;

        try
        {
            _isTranslating = true;
            BtnTranslate.IsEnabled = false;
            TxtTranslateBtn.Text = "...";
            TxtFooterStatus.Text = $"Đang dịch '{word}'...";

            string translation = await _translationService.TranslateEnToViAsync(word);

            if (!string.IsNullOrWhiteSpace(translation))
            {
                TxtMeaning.Text = translation;
                TxtMeaning.Focus();
                TxtMeaning.CaretIndex = TxtMeaning.Text.Length;
                ShowStatusMessage("Đã tải bản dịch! Nhấn Enter để lưu.", isSuccess: true);
            }
            else
            {
                ShowStatusMessage("Không tìm thấy bản dịch.", isWarning: true);
            }
        }
        catch (Exception ex)
        {
            ShowStatusMessage($"Dịch thất bại: {ex.Message}", isError: true);
        }
        finally
        {
            _isTranslating = false;
            BtnTranslate.IsEnabled = true;
            TxtTranslateBtn.Text = "Dịch";
        }
    }

    #endregion

    #region List Selection & Delete

    private void ListResults_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (ListResults.SelectedItem is VocabItem selected)
        {
            _isUpdatingSelection = true;
            try
            {
                TxtWord.Text = selected.Word;
                TxtMeaning.Text = selected.Meaning;
                PillStatus.Visibility = Visibility.Visible;
                TxtStatusBadge.Text = "✓ Có trong sổ tay";
                TxtStatusBadge.Foreground = (Brush)FindResource("SuccessBrush");
                PillStatus.Background = new SolidColorBrush(Color.FromArgb(40, 16, 185, 129));
                PillStatus.BorderBrush = new SolidColorBrush(Color.FromArgb(120, 16, 185, 129));
            }
            finally
            {
                _isUpdatingSelection = false;
            }
        }
    }

    private async void BtnDeleteItem_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.Tag is long id)
        {
            e.Handled = true;

            var result = MessageBox.Show("Bạn có chắc chắn muốn xoá từ này khỏi sổ tay không?", 
                                         "Xác nhận xoá", 
                                         MessageBoxButton.YesNo, 
                                         MessageBoxImage.Question);
            if (result != MessageBoxResult.Yes)
                return;

            try
            {
                await _databaseService.DeleteWordAsync(id);
                ShowStatusMessage("Đã xoá từ thành công.", isSuccess: true);

                if (string.IsNullOrWhiteSpace(TxtWord.Text))
                {
                    await RefreshRecentWordsAsync();
                }
                else
                {
                    await ExecuteSearchAsync(TxtWord.Text.Trim());
                }
            }
            catch (Exception ex)
            {
                ShowStatusMessage($"Lỗi xoá từ: {ex.Message}", isError: true);
            }
        }
    }

    private async Task RefreshRecentWordsAsync()
    {
        try
        {
            var recents = await _databaseService.GetRecentWordsAsync(15);
            ListResults.ItemsSource = recents;
            PanelEmptyState.Visibility = recents.Count == 0 ? Visibility.Visible : Visibility.Collapsed;
            TxtWordCount.Text = $"{recents.Count} từ";
        }
        catch
        {
            // Silently handle on startup
        }
    }

    #endregion

    #region Helper Toast / Status Notifications

    private void ShowStatusMessage(string message, bool isSuccess = false, bool isWarning = false, bool isError = false)
    {
        _toastTimer.Stop();
        TxtFooterStatus.Text = message;

        if (isSuccess)
        {
            TxtFooterStatus.Foreground = (Brush)FindResource("SuccessBrush");
        }
        else if (isWarning || isError)
        {
            TxtFooterStatus.Foreground = (Brush)FindResource("WarningBrush");
        }
        else
        {
            TxtFooterStatus.Foreground = (Brush)FindResource("TextSecondaryBrush");
        }

        _toastTimer.Start();
    }

    #endregion
}
