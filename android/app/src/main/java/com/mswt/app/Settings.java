package com.mswt.app;

import com.getcapacitor.JSObject;

import java.util.Objects;

public class Settings {
  private boolean isVibration;
  private boolean isSound;
  private Lang lang;

  public static Settings initAppSettings(Settings config) {
    MainActivity.initSettings(config);
    return config;
  }

  public Settings(boolean isVibration, boolean isSound, Lang lang) {
    this.isVibration = isVibration;
    this.isSound = isSound;
    this.lang = lang;
  }

  public JSObject toJSObject() {
    JSObject object = new JSObject();
    object.put("isVibration", isVibration);
    object.put("isSound", isSound);
    object.put("lang", lang);
    return object;
  }

  public void update(JSObject config) {
    Boolean isVibration = this.isVibration;
    if (!config.isNull("isVibration")) {
      isVibration = config.getBoolean("isVibration", Boolean.TRUE);
    }
    if (isVibration != null) {
      this.isVibration = isVibration;
    }

    Boolean isSound = this.isSound;
    if (!config.isNull("isSound")) {
      isSound = config.getBoolean("isSound", true);
    }
    if (isSound != null) {
      this.isSound = isSound;
    }

    Lang lang = this.lang;
    if (!config.isNull("lang")) {
      String configLang = config.getString("lang");
      lang = Objects.equals(configLang, "ru") ? Lang.Ru : Lang.En;
    }
    if (lang != null) {
      this.lang = lang;
    }
  }

  public boolean getIsVibration() {
    return isVibration;
  }

  public boolean getIsSound() {
    return isSound;
  }

  public Lang getLang() { return lang; }
}
