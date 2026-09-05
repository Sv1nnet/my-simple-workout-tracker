package com.mswt.app;

import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.util.Log;

import java.util.HashMap;

@CapacitorPlugin(name = "TimerService")
public class TimerServicePlugin extends Plugin {
    public static final HashMap<String, Intent> TIMER_INTENTS = new HashMap<>();
    private static final String TAG = "TimerServicePlugin";

    @PluginMethod()
    public void startTimer(PluginCall call) {
        startTimerService(call);
    }

    private void startTimerService(PluginCall call) {
        try {
            long duration = 0;

            try {
                duration = call.getLong("duration");
            } catch (Exception error) {
                duration = (long) call.getInt("duration");
            }

            String label = call.getString("label");
            String timerId = call.getString("timerId");
            String type = call.getString("type");
            String groupId = call.getString("groupId");
            String exerciseTitle = call.getString("exerciseTitle");
            String side = call.getString("side");
            String sideLabel = call.getString("sideLabel");
            Log.d(TAG, "Duration in Plugin: " + duration);
            if (duration == 0) {
                call.reject("Duration is required");
                return;
            }

            // Channel is owned by TimerService (IMPORTANCE_LOW + silent, same as activity duration).

            // Start the service
            Intent serviceIntent = new Intent(getContext(), TimerService.class);
            serviceIntent.putExtra("action", "start");
            serviceIntent.putExtra("timerId", timerId);
            serviceIntent.putExtra("duration", duration);
            if (label != null) {
                serviceIntent.putExtra("label", label);
            }
            if (type != null) {
                serviceIntent.putExtra("type", type);
            }
            if (groupId != null) {
                serviceIntent.putExtra("groupId", groupId);
            }
            if (exerciseTitle != null) {
                serviceIntent.putExtra("exerciseTitle", exerciseTitle);
            }
            if (side != null) {
                serviceIntent.putExtra("side", side);
            }
            if (sideLabel != null) {
                serviceIntent.putExtra("sideLabel", sideLabel);
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !ActivityService.isForegroundActive()) {
                getContext().startForegroundService(serviceIntent);
            } else {
                getContext().startService(serviceIntent);
            }
            
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Error starting timer", e);
            call.reject("Failed to start timer: " + e.getMessage());
        }
    }

    @PluginMethod()
    public void getTimer(PluginCall call) {
        try {
            String timerId = call.getString("timerId");
            if (timerId == null) {
                call.reject("Timer ID is required");
                return;
            }

            TimerService.TimerInfo timer = TimerService.getActiveTimer(timerId);
            JSObject result = new JSObject();
            if (timer == null) {
                result.put("exists", false);
                call.resolve(result);
                return;
            }

            result.put("exists", true);
            result.put("remainingMs", Math.max(0, timer.getRemainingMs()));
            result.put("isPaused", timer.isPaused);
            result.put("type", timer.type != null ? timer.type : "");
            result.put("groupId", timer.groupId != null ? timer.groupId : "");
            result.put("exerciseTitle", timer.exerciseTitle != null ? timer.exerciseTitle : "");
            result.put("side", timer.side != null ? timer.side : "");
            result.put("sideLabel", timer.sideLabel != null ? timer.sideLabel : "");
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error getting timer", e);
            call.reject("Failed to get timer: " + e.getMessage());
        }
    }

    @PluginMethod()
    public void stopTimer(PluginCall call) {
        try {
            String timerId = call.getString("timerId");
            if (timerId == null) {
                call.reject("Timer ID is required");
                return;
            }

            Intent serviceIntent = new Intent(getContext(), TimerService.class);
            serviceIntent.putExtra("action", "stop");
            serviceIntent.putExtra("timerId", timerId);
            
            // Use regular startService instead of startForegroundService for stop actions
            getContext().startService(serviceIntent);
            
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to stop timer: " + e.getMessage());
        }
    }

    @PluginMethod()
    public void pauseTimer(PluginCall call) {
        try {
            String timerId = call.getString("timerId");
            if (timerId == null) {
                call.reject("Timer ID is required in pauseTimer");
                return;
            }

            Log.d(TAG, "Pausing timer: " + timerId);
            Intent serviceIntent = new Intent(getContext(), TimerService.class);
            serviceIntent.putExtra("action", "pause");
            serviceIntent.putExtra("timerId", timerId);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !ActivityService.isForegroundActive()) {
                Log.d(TAG, "Pause timer: " + timerId);
                getContext().startForegroundService(serviceIntent);
            } else {
                getContext().startService(serviceIntent);
            }
            
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Error pausing timer", e);
            call.reject("Failed to pause timer: " + e.getMessage());
        }
    }

    @PluginMethod()
    public void resumeTimer(PluginCall call) {
        try {
            String timerId = call.getString("timerId");
            if (timerId == null) {
                call.reject("Timer ID is required in resumeTimer");
                return;
            }

            Log.d(TAG, "Resuming timer: " + timerId);
            Intent serviceIntent = new Intent(getContext(), TimerService.class);
            serviceIntent.putExtra("action", "resume");
            serviceIntent.putExtra("timerId", timerId);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !ActivityService.isForegroundActive()) {
                getContext().startForegroundService(serviceIntent);
            } else {
                getContext().startService(serviceIntent);
            }
            
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Error resuming timer", e);
            call.reject("Failed to resume timer: " + e.getMessage());
        }
    }
}