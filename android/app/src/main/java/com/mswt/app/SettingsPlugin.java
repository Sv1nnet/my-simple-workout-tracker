package com.mswt.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Objects;

@CapacitorPlugin(name = "SettingsService")
public class SettingsPlugin extends Plugin {
  @PluginMethod()
  public void initSettings(PluginCall call) {
    boolean isVibration = Boolean.TRUE.equals(call.getBoolean("isVibration", true));
    boolean isSound = Boolean.TRUE.equals(call.getBoolean("isSound", true));
    String lang = call.getString("lang", "en");

    Settings settings = new Settings(isVibration, isSound, Objects.equals(lang, "ru") ? Lang.Ru : Lang.En);
    Settings.initAppSettings(settings);
    call.resolve();
  }

  @PluginMethod()
  public void getSettings(PluginCall call) {
    JSObject object = new JSObject();

    if (MainActivity.settings != null) {
      object.put("isInited", true);
      object.put("isVibration", MainActivity.settings.getIsVibration());
      object.put("isSound", MainActivity.settings.getIsSound());

      call.resolve(object);
    }

    object.put("isInited", false);
    call.resolve(object);
  }

  @PluginMethod()
  public void setSettings(PluginCall call) {
    boolean isVibration = Boolean.TRUE.equals(call.getBoolean("isVibration", true));
    boolean isSound = Boolean.TRUE.equals(call.getBoolean("isSound", true));
    String lang = call.getString("lang", "en");

    MainActivity.initSettings(new Settings(isVibration, isSound, Objects.equals(lang, "ru") ? Lang.Ru : Lang.En));
  }

  @PluginMethod()
  public void updateSettings(PluginCall call) {
    Boolean isVibration = call.getBoolean("isVibration", true);
    Boolean isSound = call.getBoolean("isSound", true);
    String lang = call.getString("lang", "en");

    JSObject object = new JSObject();
    if (isVibration != null) {
      object.put("isVibration", isVibration.booleanValue());
    }
    if (isSound != null) {
      object.put("isSound", isSound.booleanValue());
    }
    if (lang != null) {
      object.put("lang", lang);
    }

    if (MainActivity.settings != null) {
      try {
        MainActivity.settings.update(object);
      } catch (Error error) {
        MainActivity.initSettings(new Settings(isVibration, isSound, Objects.equals(lang, "ru") ? Lang.Ru : Lang.En));
      }
    } else {
      MainActivity.initSettings(new Settings(isVibration, isSound, Objects.equals(lang, "ru") ? Lang.Ru : Lang.En));
    }

    call.resolve();
  }
}
