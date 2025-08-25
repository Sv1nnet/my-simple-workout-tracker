package com.mswt.app;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.content.Context;

public class MainActivity extends BridgeActivity {
    static public Settings settings = null;

    public static void initSettings(Settings settings) {
        MainActivity.settings = settings;
    }

    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TimerServicePlugin.class);  // Make sure this line is before super.onCreate()
        registerPlugin(ActivityServicePlugin.class);  // Make sure this line is before super.onCreate()
        registerPlugin(SettingsPlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onDestroy() {
        Intent timerServiceIntent = new Intent(this, TimerService.class);
        timerServiceIntent.putExtra("action", "stopAll");
        startService(timerServiceIntent);

        Intent stopWatchServiceIntent = new Intent(this, StopwatchService.class);
        stopWatchServiceIntent.putExtra("action", "stopAll");
        startService(stopWatchServiceIntent);

        super.onDestroy();
    }
}