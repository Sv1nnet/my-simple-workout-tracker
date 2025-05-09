package com.mswt.app;

import android.content.Intent;
import android.os.Build;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.util.Log;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import androidx.core.app.NotificationCompat;

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
            Log.d(TAG, "Duration in Plugin: " + duration);
            if (duration == 0) {
                call.reject("Duration is required");
                return;
            }

            // Create notification channel first
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationManager notificationManager = 
                    (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
                NotificationChannel channel = new NotificationChannel(
                    "TimerServiceChannel",
                    "Timer Service Channel",
                    NotificationManager.IMPORTANCE_LOW
                );
                notificationManager.createNotificationChannel(channel);
            }

            // Start the service
            Intent serviceIntent = new Intent(getContext(), TimerService.class);
            serviceIntent.putExtra("action", "start");
            serviceIntent.putExtra("timerId", timerId);
            serviceIntent.putExtra("duration", duration);
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
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
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