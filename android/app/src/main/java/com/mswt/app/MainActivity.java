package com.mswt.app;

import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.graphics.Insets;
import android.os.Build;
import android.graphics.Color;
import android.view.Window;
import android.content.res.Configuration;
import android.content.res.Resources;
import com.getcapacitor.BridgeActivity;
import androidx.core.content.ContextCompat;
import android.view.WindowManager;
import android.graphics.drawable.GradientDrawable;

public class MainActivity extends BridgeActivity {
    private Window window;

    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TimerServicePlugin.class);  // Make sure this line is before super.onCreate()
        super.onCreate(savedInstanceState);
        
        window = getWindow();
        updateThemeColors();
    }

    private void updateThemeColors() {

        // Update gradient background
        View decorView = window.getDecorView();

        // Handle insets based on Android version
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            decorView.setOnApplyWindowInsetsListener((view, windowInsets) -> {
                Insets insets = windowInsets.getInsets(WindowInsets.Type.systemBars());
//                view.setPadding(
//                    view.getPaddingLeft(),
//                    insets.top,
//                    view.getPaddingRight(),
//                    insets.bottom
//                );
                return windowInsets;
            });
        } else {
            // For older Android versions
            int statusBarHeight = getStatusBarHeight();
//            decorView.setPadding(
//                decorView.getPaddingLeft(),
//                statusBarHeight,
//                decorView.getPaddingRight(),
//                decorView.getPaddingBottom()
//            );
        }

        // Force immediate update
        decorView.invalidate();
    }

    private int getStatusBarHeight() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsets windowInsets = window.getDecorView().getRootWindowInsets();
            if (windowInsets != null) {
                return windowInsets.getInsets(WindowInsets.Type.statusBars()).top;
            }
        } else {
            // For older Android versions, use a default value
//            return (int) (24 * getResources().getDisplayMetrics().density);
        }
        return 0;
    }
}