using System;
using System.Windows;
using System.Windows.Input;

namespace NoteBookEng;

public partial class BubbleWindow : Window
{
    private readonly Window _mainWindow;
    private Point _startPoint;
    private bool _isDragging;

    public BubbleWindow(Window mainWindow)
    {
        InitializeComponent();
        _mainWindow = mainWindow;
        
        // Initial position logic can be set here if needed, 
        // but typically set by MainWindow right before showing.
    }

    private void Border_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        _startPoint = e.GetPosition(this);
        _isDragging = false;
        BubbleBorder.CaptureMouse();
    }

    private void Border_MouseMove(object sender, MouseEventArgs e)
    {
        if (BubbleBorder.IsMouseCaptured)
        {
            Point currentPoint = e.GetPosition(this);
            Vector diff = _startPoint - currentPoint;

            if (Math.Abs(diff.X) > SystemParameters.MinimumHorizontalDragDistance ||
                Math.Abs(diff.Y) > SystemParameters.MinimumVerticalDragDistance)
            {
                _isDragging = true;
                BubbleBorder.ReleaseMouseCapture();
                this.DragMove();
            }
        }
    }

    private void Border_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
    {
        if (BubbleBorder.IsMouseCaptured)
        {
            BubbleBorder.ReleaseMouseCapture();
        }

        if (!_isDragging)
        {
            // It's a click, restore main window
            _mainWindow.Show();
            if (_mainWindow.WindowState == WindowState.Minimized)
            {
                _mainWindow.WindowState = WindowState.Normal;
            }
            
            _mainWindow.Activate();
            this.Hide();
        }
    }
}
