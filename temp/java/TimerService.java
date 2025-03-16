package com.mswt.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import java.util.HashMap;
import java.util.Map;

public class TimerService extends Service {
    private static final String TAG = "TimerService";
    private static final String CHANNEL_ID = "TimerServiceChannel";
    private static final String CHANNEL_ID_ALERTS = "TimerAlertsChannel";
    private static final int BASE_NOTIFICATION_ID = 1000;
    
    private final Handler handler = new Handler(Looper.getMainLooper());
    private NotificationManager notificationManager;
    private Map<Integer, TimerInfo> activeTimers = new HashMap<>();
    private int timerCounter = 0;

    private class TimerInfo {
        long endTime;
        long remainingTime;
        Runnable runnable;
        String label;
        int notificationId;
        boolean isPaused;

        TimerInfo(long endTime, String label, int notificationId) {
            this.endTime = endTime;
            this.label = label;
            this.notificationId = notificationId;
            this.isPaused = false;
            this.remainingTime = 0;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Creating service");
        notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        createNotificationChannels();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                // Channel for ongoing timer
                NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Timer Service Channel",
                    NotificationManager.IMPORTANCE_LOW
                );
                serviceChannel.setDescription("Shows ongoing timer");
                notificationManager.createNotificationChannel(serviceChannel);

                // Channel for timer completion
                NotificationChannel alertsChannel = new NotificationChannel(
                    CHANNEL_ID_ALERTS,
                    "Timer Alerts Channel",
                    NotificationManager.IMPORTANCE_HIGH
                );
                alertsChannel.setDescription("Shows timer completion alerts");
                alertsChannel.enableVibration(true);
                alertsChannel.setVibrationPattern(new long[]{0, 500, 250, 500});
                notificationManager.createNotificationChannel(alertsChannel);
                
                Log.d(TAG, "Notification channels created");
            } catch (Exception e) {
                Log.e(TAG, "Error creating notification channels", e);
            }
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        try {
            String action = intent.getStringExtra("action");
            if (action != null) {
                switch (action) {
                    case "pause":
                        int pauseTimerId = intent.getIntExtra("timerId", -1);
                        if (pauseTimerId != -1) {
                            pauseTimer(pauseTimerId);
                        }
                        break;
                    case "resume":
                        int resumeTimerId = intent.getIntExtra("timerId", -1);
                        if (resumeTimerId != -1) {
                            resumeTimer(resumeTimerId);
                        }
                        break;
                    case "start":
                        startNewTimer(intent);
                        break;
                }
                return START_STICKY;
            }

            // Legacy start (backward compatibility)
            return startNewTimer(intent);

        } catch (Exception e) {
            Log.e(TAG, "Error in onStartCommand", e);
            return START_NOT_STICKY;
        }
    }

    private int startNewTimer(Intent intent) {
        long duration = intent.getLongExtra("duration", 0);
        String label = intent.getStringExtra("label") != null ? 
                      intent.getStringExtra("label") : 
                      "Timer " + (timerCounter + 1);
        
        Log.d(TAG, "Duration received: " + duration + " for " + label);
        
        if (duration <= 0) {
            Log.e(TAG, "Invalid duration: " + duration);
            return START_NOT_STICKY;
        }

        int timerId = ++timerCounter;
        int notificationId = BASE_NOTIFICATION_ID + timerId;
        long endTime = System.currentTimeMillis() + duration;

        TimerInfo timerInfo = new TimerInfo(endTime, label, notificationId);
        activeTimers.put(timerId, timerInfo);

        // Create and start the timer runnable
        Runnable timerRunnable = createTimerRunnable(timerId);
        timerInfo.runnable = timerRunnable;
        handler.post(timerRunnable);

        // Show notification for this timer
        Notification notification = createOngoingNotification(label, "Timer started...", notificationId);
        
        // Start foreground service if this is the first timer
        if (activeTimers.size() == 1) {
            startForeground(notificationId, notification);
        } else {
            notificationManager.notify(notificationId, notification);
        }

        return START_STICKY;
    }

    private void pauseTimer(int timerId) {
        TimerInfo timer = activeTimers.get(timerId);
        if (timer != null && !timer.isPaused) {
            timer.isPaused = true;
            timer.remainingTime = timer.endTime - System.currentTimeMillis();
            if (timer.runnable != null) {
                handler.removeCallbacks(timer.runnable);
            }
            updateNotification(timer, "Paused: " + String.format("%d seconds remaining", timer.remainingTime / 1000));
        }
    }

    private void resumeTimer(int timerId) {
        TimerInfo timer = activeTimers.get(timerId);
        if (timer != null && timer.isPaused) {
            timer.isPaused = false;
            timer.endTime = System.currentTimeMillis() + timer.remainingTime;
            Runnable timerRunnable = createTimerRunnable(timerId);
            timer.runnable = timerRunnable;
            handler.post(timerRunnable);
            updateNotification(timer, String.format("%d seconds remaining", timer.remainingTime / 1000));
        }
    }

    private Runnable createTimerRunnable(final int timerId) {
        return new Runnable() {
            @Override
            public void run() {
                try {
                    TimerInfo timer = activeTimers.get(timerId);
                    if (timer == null || timer.isPaused) return;

                    long remaining = timer.endTime - System.currentTimeMillis();
                    Log.d(TAG, "Remaining time for " + timer.label + ": " + remaining);
                    
                    if (remaining <= 0) {
                        showTimerFinishedNotification(timer);
                        activeTimers.remove(timerId);
                        
                        // If no more timers, stop the service
                        if (activeTimers.isEmpty()) {
                            stopForeground(true);
                            stopSelf();
                        }
                    } else {
                        updateNotification(timer, String.format("%d seconds remaining", remaining / 1000));
                        handler.postDelayed(this, 1000);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error in timer runnable", e);
                }
            }
        };
    }

    private Notification createOngoingNotification(String title, String content, int notificationId) {
        try {
            Intent notificationIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this, notificationId, notificationIntent,
                PendingIntent.FLAG_IMMUTABLE
            );

            return new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle(title)
                    .setContentText(content)
                    .setSmallIcon(getApplicationInfo().icon)
                    .setPriority(NotificationCompat.PRIORITY_LOW)
                    .setOngoing(true)
                    .setContentIntent(pendingIntent)
                    .build();
        } catch (Exception e) {
            Log.e(TAG, "Error creating ongoing notification", e);
            return new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle(title)
                    .setContentText("Running")
                    .setSmallIcon(getApplicationInfo().icon)
                    .build();
        }
    }

    private void updateNotification(TimerInfo timer, String content) {
        try {
            Notification notification = createOngoingNotification(timer.label, content, timer.notificationId);
            notificationManager.notify(timer.notificationId, notification);
        } catch (Exception e) {
            Log.e(TAG, "Error updating notification", e);
        }
    }

    private void showTimerFinishedNotification(TimerInfo timer) {
        try {
            Log.d(TAG, "Creating completion notification for " + timer.label);
            
            Intent notificationIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this, timer.notificationId, notificationIntent,
                PendingIntent.FLAG_IMMUTABLE
            );

            Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID_ALERTS)
                    .setContentTitle(timer.label + " Finished!")
                    .setContentText("Your timer has completed")
                    .setSmallIcon(getApplicationInfo().icon)
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setVibrate(new long[]{0, 500, 250, 500})
                    .setAutoCancel(true)
                    .setContentIntent(pendingIntent)
                    .build();

            Log.d(TAG, "Showing completion notification for " + timer.label);
            notificationManager.notify(timer.notificationId + 1000, notification);
        } catch (Exception e) {
            Log.e(TAG, "Error showing timer finished notification", e);
        }
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        Log.d(TAG, "onTaskRemoved called - app was force closed");
        stopForeground(true);
        stopSelf();
        super.onTaskRemoved(rootIntent);
    }

    @Override
    public void onDestroy() {
        try {
            Log.d(TAG, "Destroying service");
            // Cancel all active timers
            for (TimerInfo timer : activeTimers.values()) {
                if (timer.runnable != null) {
                    handler.removeCallbacks(timer.runnable);
                }
            }
            activeTimers.clear();
            stopForeground(true);
        } catch (Exception e) {
            Log.e(TAG, "Error in onDestroy", e);
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}