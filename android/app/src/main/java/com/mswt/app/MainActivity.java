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
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TimerServicePlugin.class);  // Make sure this line is before super.onCreate()
        super.onCreate(savedInstanceState);

        // Set theme colors for status and navigation bars
        Window window = getWindow();
        
        // Define colors from resources
        int colorPrimary = ContextCompat.getColor(this, R.color.colorPrimary);      // Light theme color
        int colorWhite = ContextCompat.getColor(this, R.color.white);               // White color

        // Set the status bar color
        window.setStatusBarColor(colorPrimary);
        
        // Set the navigation bar color to white
        window.setNavigationBarColor(colorWhite);

        // Set up window insets listener
        window.getDecorView().setOnApplyWindowInsetsListener((view, windowInsets) -> {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Insets insets = windowInsets.getInsets(WindowInsets.Type.systemBars());

                // Set the gradient background
                GradientDrawable gradientDrawable = new GradientDrawable(
                    GradientDrawable.Orientation.TOP_BOTTOM,
                    new int[]{
                        colorPrimary, // 0%
                        colorPrimary, // 30%
                        colorWhite,   // 70%
                        colorWhite    // 100%
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
                return windowInsets.consumeSystemWindowInsets();
            }
            return windowInsets;
        });
    }
}