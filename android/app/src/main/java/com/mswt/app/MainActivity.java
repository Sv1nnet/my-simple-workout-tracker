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

public class MainActivity extends BridgeActivity implements UserConfig.OnThemeChangeListener {
    private UserConfig userConfig;
    private Window window;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TimerServicePlugin.class);  // Make sure this line is before super.onCreate()
        registerPlugin(UserConfigPlugin.class);
        super.onCreate(savedInstanceState);

        // Initialize UserConfig
        userConfig = new UserConfig(this);
        userConfig.setOnThemeChangeListener(this);

        // Set theme colors for status and navigation bars
        window = getWindow();
        updateThemeColors();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        if (userConfig.getTheme() == UserConfig.Theme.SYSTEM) {
            updateThemeColors();
        }
    }

    @Override
    public void onThemeChanged(boolean isDarkMode) {
        updateThemeColors();
    }

    private void updateThemeColors() {
        // Get colors based on current theme
        int statusBarColor = userConfig.getStatusBarColor();
        int navigationBarColor = userConfig.getNavigationBarColor();

        // Set the status bar color
        window.setStatusBarColor(statusBarColor);

        // Set the navigation bar color
        window.setNavigationBarColor(navigationBarColor);

        // Update gradient background
        View decorView = window.getDecorView();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            decorView.setOnApplyWindowInsetsListener((view, windowInsets) -> {
                Insets insets = windowInsets.getInsets(WindowInsets.Type.systemBars());

                // Set the gradient background
                GradientDrawable gradientDrawable = new GradientDrawable(
                    GradientDrawable.Orientation.TOP_BOTTOM,
                    new int[]{
                        statusBarColor,    // 0%
                        statusBarColor,    // 30%
                        navigationBarColor, // 70%
                        navigationBarColor  // 100%
                    }
                );
                view.setBackground(gradientDrawable);

                // Set the paddings
                view.setPadding(
                    view.getPaddingLeft(),
                    insets.top,
                    view.getPaddingRight(),
                    insets.bottom
                );
                return windowInsets;
            });
        }
    }
}