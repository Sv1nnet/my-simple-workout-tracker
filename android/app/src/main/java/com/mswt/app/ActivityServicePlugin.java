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

    /**
     * JS numbers arrive as Integer or Double; Capacitor getLong() often returns the default.
     */
    private static long getLongValue(PluginCall call, String key, long defaultValue) {
        if (call.getData() == null || !call.getData().has(key) || call.getData().isNull(key)) {
            return defaultValue;
        }
        try {
            Object raw = call.getData().opt(key);
            if (raw instanceof Number) {
                return ((Number) raw).longValue();
            }
            if (raw instanceof String && !((String) raw).isEmpty()) {
                return (long) Double.parseDouble((String) raw);
            }
        } catch (Exception e) {
            Log.e("ActivityServicePlugin", "Failed to parse " + key + ": " + e.getMessage());
        }
        return defaultValue;
    }

    // Activity methods
    @PluginMethod()
    public void startActivity(PluginCall call) {
        String id = call.getString("id");
        String title = call.getString("title");
        String content = call.getString("content", "");
        long startTime = getLongValue(call, "startTime", System.currentTimeMillis());
        long elapsedMs = getLongValue(call, "elapsedMs", 0L);

        Log.d("ActivityServicePlugin", "Received startActivity call:");
        Log.d("ActivityServicePlugin", "  id: " + id);
        Log.d("ActivityServicePlugin", "  title: " + title);
        Log.d("ActivityServicePlugin", "  startTime: " + startTime);
        Log.d("ActivityServicePlugin", "  elapsedMs: " + elapsedMs);
        Log.d("ActivityServicePlugin", "  current system time: " + System.currentTimeMillis());

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "start");
        serviceIntent.putExtra("id", id);
        serviceIntent.putExtra("title", title);
        serviceIntent.putExtra("content", content);
        serviceIntent.putExtra("startTime", startTime);
        serviceIntent.putExtra("elapsedMs", elapsedMs);
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
        long elapsedMs = getLongValue(call, "elapsedMs", 0L);

        Log.d("ActivityServicePlugin", "Received pauseActivity call - id: " + id + ", elapsedMs: " + elapsedMs);

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
        String title = call.getString("title", "");
        String content = call.getString("content", "");
        long resumeTime = getLongValue(call, "resumeTime", System.currentTimeMillis());
        long elapsedMs = getLongValue(call, "elapsedMs", 0L);

        Log.d("ActivityServicePlugin", "Received resumeActivity call - id: " + id
                + ", resumeTime: " + resumeTime + ", elapsedMs: " + elapsedMs);

        Intent serviceIntent = new Intent(getContext(), ActivityService.class);
        serviceIntent.putExtra("action", "resume");
        serviceIntent.putExtra("id", id);
        serviceIntent.putExtra("title", title);
        serviceIntent.putExtra("content", content);
        serviceIntent.putExtra("resumeTime", resumeTime);
        serviceIntent.putExtra("elapsedMs", elapsedMs);

        startServiceWithIntent(serviceIntent);
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