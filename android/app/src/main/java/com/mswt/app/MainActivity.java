package com.mswt.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TimerServicePlugin.class);  // Make sure this line is before super.onCreate()
        super.onCreate(savedInstanceState);
    }
}