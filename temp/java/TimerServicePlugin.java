package com.mswt.app;

import android.content.Intent;
import android.os.Build;
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
            Integer duration = call.getInt("duration");
            String label = call.getString("label");
            
            if (duration == null) {
                call.reject("Duration is required");
                return;
            }

            Log.d(TAG, "Starting timer with duration: " + duration);
            Intent serviceIntent = new Intent(getContext(), TimerService.class);
            serviceIntent.putExtra("action", "start");
            serviceIntent.putExtra("duration", duration * 1000L); // Convert to milliseconds
            if (label != null) {
                serviceIntent.putExtra("label", label);
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
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
    public void stopTimer(PluginCall call) {
        try {
//            Intent serviceIntent = new Intent(getContext(), TimerService.class);
//            getContext().stopService(serviceIntent);

            Integer timerId = call.getInt("timerId");
            Intent serviceIntent = TIMER_INTENTS.get(timerId);

            getContext().stopService(serviceIntent);
            TIMER_INTENTS.remove(timerId);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to stop timer: " + e.getMessage());
        }
    }

    @PluginMethod()
    public void pauseTimer(PluginCall call) {
        try {
            Integer timerId = call.getInt("timerId");
            if (timerId == null) {
                call.reject("Timer ID is required in pauseTimer");
                return;
            }

            Log.d(TAG, "Pausing timer: " + timerId);
            Intent serviceIntent = new Intent(getContext(), TimerService.class);
            serviceIntent.putExtra("action", "pause");
            serviceIntent.putExtra("timerId", timerId);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
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
            Integer timerId = call.getInt("timerId");
            if (timerId == null) {
                call.reject("Timer ID is required in resumeTimer");
                return;
            }

            Log.d(TAG, "Resuming timer: " + timerId);
            Intent serviceIntent = new Intent(getContext(), TimerService.class);
            serviceIntent.putExtra("action", "resume");
            serviceIntent.putExtra("timerId", timerId);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
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