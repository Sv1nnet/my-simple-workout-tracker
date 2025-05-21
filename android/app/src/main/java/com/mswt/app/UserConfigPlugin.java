package com.mswt.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.graphics.Color;

@CapacitorPlugin(name = "UserConfig")
public class UserConfigPlugin extends Plugin {
    private UserConfig userConfig;

    @Override
    public void load() {
        userConfig = new UserConfig(getContext());
    }

    @PluginMethod
    public void setUserConfig(PluginCall call) {
        try {
            String theme = call.getString("theme");
            String lang = call.getString("lang");
            String units = call.getString("units");

            if (theme != null) {
                switch (theme.toLowerCase()) {
                    case "dark":
                        userConfig.setTheme(UserConfig.Theme.DARK);
                        break;
                    case "light":
                        userConfig.setTheme(UserConfig.Theme.LIGHT);
                        break;
                    case "system":
                        userConfig.setTheme(UserConfig.Theme.SYSTEM);
                        break;
                }
            }

            // Store other preferences if needed
            if (lang != null) {
                userConfig.getPreferences().edit().putString("lang", lang).apply();
            }
            if (units != null) {
                userConfig.getPreferences().edit().putString("units", units).apply();
            }

            call.resolve();
        } catch (Exception e) {
            call.reject("Error setting user config", e);
        }
    }

    @PluginMethod
    public void getUserConfig(PluginCall call) {
        try {
            JSObject ret = new JSObject();
            
            // Get theme
            UserConfig.Theme theme = userConfig.getTheme();
            ret.put("theme", theme.name().toLowerCase());

            // Get other preferences
            String lang = userConfig.getPreferences().getString("lang", "en");
            String units = userConfig.getPreferences().getString("units", "kg");

            ret.put("lang", lang);
            ret.put("units", units);

            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error getting user config", e);
        }
    }
} 