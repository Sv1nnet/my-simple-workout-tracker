package com.mswt.app;

import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ActivityService")
public class ActivityServicePlugin extends Plugin {

    private void startServiceWithIntent(Intent serviceIntent) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(serviceIntent);
        } else {
            getContext().startService(serviceIntent);
        }
    }

    // Activity methods
    @PluginMethod()
    public void startActivity(PluginCall call) {
        String id = call.getString("id");
        String title = call.getString("title");
        String content = call.getString("content", "");
        long startTime = call.getLong("startTime", System.currentTimeMillis());
        long elapsedMsInt = call.getInt("elapsedMs", 0);
        long elapsedMsLong = elapsedMsInt == 0 ? call.getLong("elapsedMs", 0L) : (long) elapsedMsInt;

        // Debug logging to see what the plugin receives
        Log.d("ActivityServicePlugin", "Received startActivity call:");
        Log.d("ActivityServicePlugin", "  id: " + id);
        Log.d("ActivityServicePlugin", "  title: " + title);
        Log.d("ActivityServicePlugin", "  startTime: " + startTime);
        Log.d("ActivityServicePlugin", "  elapsedMs: " + elapsedMsLong);
        Log.d("ActivityServicePlugin", "  current system time: " + System.currentTimeMillis());

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "start");
        serviceIntent.putExtra("id", id);
        serviceIntent.putExtra("title", title);
        serviceIntent.putExtra("content", content);
        serviceIntent.putExtra("startTime", startTime);
        serviceIntent.putExtra("elapsedMs", elapsedMsLong);
        serviceIntent.putExtra("type", "ACTIVITY");

        startServiceWithIntent(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void stopActivity(PluginCall call) {
        String id = call.getString("id");

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "stop");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void pauseActivity(PluginCall call) {
        String id = call.getString("id");
        
        // Try different ways to get the elapsedMs value
        long elapsedMs = 0L;
        
        Log.d("ActivityServicePlugin", "hasOption('elapsedMs'): " + call.hasOption("elapsedMs"));
        
        // Try to get the value - since getLong fails, try getInt first
        try {
            int elapsedMsInt = call.getInt("elapsedMs", -1);
            if (elapsedMsInt != -1) {
                elapsedMs = elapsedMsInt;
                Log.d("ActivityServicePlugin", "getInt success: " + elapsedMs);
            } else {
                Log.d("ActivityServicePlugin", "getInt returned default value");
                
                // Try getDouble as fallback
                double elapsedMsDouble = call.getDouble("elapsedMs", -1.0);
                if (elapsedMsDouble != -1.0) {
                    elapsedMs = (long) elapsedMsDouble;
                    Log.d("ActivityServicePlugin", "getDouble success: " + elapsedMs);
                } else {
                    Log.d("ActivityServicePlugin", "getDouble returned default value");
                    
                    // Try raw value access
                    Object rawValue = call.getData().opt("elapsedMs");
                    Log.d("ActivityServicePlugin", "Raw value type: " + (rawValue != null ? rawValue.getClass().getName() : "null"));
                    Log.d("ActivityServicePlugin", "Raw value: " + rawValue);
                    
                    if (rawValue instanceof Number) {
                        elapsedMs = ((Number) rawValue).longValue();
                        Log.d("ActivityServicePlugin", "Converted from Number: " + elapsedMs);
                    }
                }
            }
        } catch (Exception e) {
            Log.e("ActivityServicePlugin", "All parsing failed: " + e.getMessage());
        }

        Log.d("ActivityServicePlugin", "Received pauseActivity call - id: " + id + ", elapsedMs: " + elapsedMs);
        Log.d("ActivityServicePlugin", "Call data: " + call.getData().toString());

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "pause");
        serviceIntent.putExtra("id", id);
        serviceIntent.putExtra("elapsedMs", elapsedMs);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void resumeActivity(PluginCall call) {
        String id = call.getString("id");
        long resumeTime = call.getLong("resumeTime", System.currentTimeMillis());

        Log.d("ActivityServicePlugin", "Received resumeActivity call - id: " + id + ", resumeTime: " + resumeTime);

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "resume");
        serviceIntent.putExtra("id", id);
        serviceIntent.putExtra("resumeTime", resumeTime);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    // Duration Set methods
    @PluginMethod()
    public void startDurationSet(PluginCall call) {
        String id = call.getString("id");
        String title = call.getString("title");
        String content = call.getString("content", "");
        long startTime = call.getLong("startTime", System.currentTimeMillis());

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "start");
        serviceIntent.putExtra("id", id);
        serviceIntent.putExtra("title", title);
        serviceIntent.putExtra("content", content);
        serviceIntent.putExtra("startTime", startTime);
        serviceIntent.putExtra("type", "DURATION_SET");

        startServiceWithIntent(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void stopDurationSet(PluginCall call) {
        String id = call.getString("id");

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "stop");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void pauseDurationSet(PluginCall call) {
        String id = call.getString("id");

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "pause");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void resumeDurationSet(PluginCall call) {
        String id = call.getString("id");

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "resume");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    // Speed Set methods
    @PluginMethod()
    public void startSpeedSet(PluginCall call) {
        String id = call.getString("id");
        String title = call.getString("title");
        String content = call.getString("content", "");
        long startTime = call.getLong("startTime", System.currentTimeMillis());

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "start");
        serviceIntent.putExtra("id", id);
        serviceIntent.putExtra("title", title);
        serviceIntent.putExtra("content", content);
        serviceIntent.putExtra("startTime", startTime);
        serviceIntent.putExtra("type", "SPEED_SET");

        startServiceWithIntent(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void stopSpeedSet(PluginCall call) {
        String id = call.getString("id");

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "stop");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void pauseSpeedSet(PluginCall call) {
        String id = call.getString("id");

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "pause");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void resumeSpeedSet(PluginCall call) {
        String id = call.getString("id");

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "resume");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    // Rest methods
    @PluginMethod()
    public void startRest(PluginCall call) {
        String id = call.getString("id");
        String title = call.getString("title");
        String content = call.getString("content", "");
        long duration = call.getLong("duration", 0L);

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "start");
        serviceIntent.putExtra("id", id);
        serviceIntent.putExtra("title", title);
        serviceIntent.putExtra("content", content);
        serviceIntent.putExtra("duration", duration);
        serviceIntent.putExtra("type", "REST");

        startServiceWithIntent(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void stopRest(PluginCall call) {
        String id = call.getString("id");

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "stop");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void pauseRest(PluginCall call) {
        String id = call.getString("id");

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "pause");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void resumeRest(PluginCall call) {
        String id = call.getString("id");

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "resume");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    // Break methods
    @PluginMethod()
    public void startBreak(PluginCall call) {
        String id = call.getString("id");
        String title = call.getString("title");
        String content = call.getString("content", "");
        long duration = call.getLong("duration", 0L);

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "start");
        serviceIntent.putExtra("id", id);
        serviceIntent.putExtra("title", title);
        serviceIntent.putExtra("content", content);
        serviceIntent.putExtra("duration", duration);
        serviceIntent.putExtra("type", "BREAK");

        startServiceWithIntent(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void stopBreak(PluginCall call) {
        String id = call.getString("id");

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "stop");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void pauseBreak(PluginCall call) {
        String id = call.getString("id");

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "pause");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    @PluginMethod()
    public void resumeBreak(PluginCall call) {
        String id = call.getString("id");

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "resume");
        serviceIntent.putExtra("id", id);

        getContext().startService(serviceIntent);
        call.resolve();
    }
}