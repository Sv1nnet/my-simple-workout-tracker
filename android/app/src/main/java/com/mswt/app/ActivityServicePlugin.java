package com.mswt.app;

import android.content.Intent;
import android.os.Build;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ActivityService")
public class ActivityServicePlugin extends Plugin {
    @PluginMethod()
    public void start(PluginCall call) {
        String id = call.getString("id");
        String title = call.getString("title");
        long startTime = System.currentTimeMillis();

        try {
            startTime = call.getLong("startTime");
        } catch (Exception e) {
            startTime = (long) call.getInt("startTime");
        }

        // Start the service
        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "start");
        serviceIntent.putExtra("id", id);
        serviceIntent.putExtra("title", title);
        serviceIntent.putExtra("startTime", startTime);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(serviceIntent);
        } else {
            getContext().startService(serviceIntent);
        }
        call.resolve();
    }

    @PluginMethod()
    public void stop(PluginCall call) {
        String id = call.getString("id");

        // Start the service
        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "stop");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }
}
