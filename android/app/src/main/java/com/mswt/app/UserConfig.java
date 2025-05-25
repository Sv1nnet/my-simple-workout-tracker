package com.mswt.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.graphics.Color;

import androidx.core.content.ContextCompat;

public class UserConfig {
    private static final String DEFAULT_LIGHT_STATUS_BAR_COLOR = "#0AA679";
    private static final String DEFAULT_DARK_STATUS_BAR_COLOR = "#075C44";
    private static final String PREFS_NAME = "UserConfigPrefs";
    private static final String KEY_THEME = "theme";
    private static final String KEY_DARK_STATUS_BAR = "darkStatusBar";
    private static final String KEY_DARK_NAV_BAR = "darkNavBar";
    private static final String KEY_LIGHT_STATUS_BAR = "lightStatusBar";
    private static final String KEY_LIGHT_NAV_BAR = "lightNavBar";
    private static final String KEY_LANG = "lang";
    private static final String KEY_UNITS = "units";

    public enum Theme {
        LIGHT,
        DARK,
        SYSTEM
    }

    public interface OnThemeChangeListener {
        void onThemeChanged(boolean isDarkMode);
    }

    private final SharedPreferences preferences;
    private final Context context;
    private OnThemeChangeListener themeChangeListener;

    public UserConfig(Context context) {
        this.context = context;
        this.preferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public SharedPreferences getPreferences() {
        return preferences;
    }

    public void setOnThemeChangeListener(OnThemeChangeListener listener) {
        this.themeChangeListener = listener;
    }

    public boolean isDarkMode() {
        Theme currentTheme = getTheme();
        if (currentTheme == Theme.LIGHT) {
            return false;
        }
        if (currentTheme == Theme.DARK) {
            return true;
        }
        // Only check system theme if theme is set to SYSTEM
        return (context.getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) 
            == Configuration.UI_MODE_NIGHT_YES;
    }

    public Theme getTheme() {
        String themeStr = preferences.getString(KEY_THEME, Theme.SYSTEM.name());
        try {
            return Theme.valueOf(themeStr);
        } catch (IllegalArgumentException e) {
            return Theme.SYSTEM;
        }
    }

    public void setTheme(Theme theme) {
        preferences.edit().putString(KEY_THEME, theme.name()).apply();
        if (themeChangeListener != null) {
            themeChangeListener.onThemeChanged(isDarkMode());
        }
    }

    public int getStatusBarColor() {
        return isDarkMode()
            ? preferences.getInt(KEY_DARK_STATUS_BAR, Color.parseColor(DEFAULT_DARK_STATUS_BAR_COLOR))
            : preferences.getInt(KEY_LIGHT_STATUS_BAR, Color.parseColor(DEFAULT_LIGHT_STATUS_BAR_COLOR));
    }

    public int getNavigationBarColor() {
        if (isDarkMode()) {
            return preferences.getInt(KEY_DARK_NAV_BAR, 
                ContextCompat.getColor(context, R.color.black));
        } else {
            return preferences.getInt(KEY_LIGHT_NAV_BAR, 
                ContextCompat.getColor(context, R.color.white));
        }
    }

    public void setDarkStatusBarColor(int color) {
        preferences.edit().putInt(KEY_DARK_STATUS_BAR, color).apply();
    }

    public void setDarkNavigationBarColor(int color) {
        preferences.edit().putInt(KEY_DARK_NAV_BAR, color).apply();
    }

    public void setLightStatusBarColor(int color) {
        preferences.edit().putInt(KEY_LIGHT_STATUS_BAR, color).apply();
    }

    public void setLightNavigationBarColor(int color) {
        preferences.edit().putInt(KEY_LIGHT_NAV_BAR, color).apply();
    }

    public String getLanguage() {
        return preferences.getString(KEY_LANG, "en");
    }

    public void setLanguage(String lang) {
        preferences.edit().putString(KEY_LANG, lang).apply();
    }

    public String getUnits() {
        return preferences.getString(KEY_UNITS, "kg");
    }

    public void setUnits(String units) {
        preferences.edit().putString(KEY_UNITS, units).apply();
    }
} 