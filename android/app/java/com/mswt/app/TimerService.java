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
    private static final String BASE_TIMER_ID = "BaseTimerId";
    private static final int BASE_NOTIFICATION_ID = 1000;
    private static final int CONSOLIDATED_NOTIFICATION_ID = 1001;

    private static final Map<String, TimerInfo> activeTimers = new HashMap<>();
    
    private final Handler handler = new Handler(Looper.getMainLooper());
    private NotificationManager notificationManager;

    private static class TimerInfo {
        long endTime;
        long remainingTime;
        Runnable runnable;
        String label;
        String id;
        int notificationId;
        boolean isPaused;

        TimerInfo(long endTime, String label, String id, int notificationId) {
            this.endTime = endTime;
            this.label = label;
            this.id = id;
            this.notificationId = notificationId;
            this.isPaused = false;
            this.remainingTime = 0;
        }
    }

    private String formatTime(long milliseconds) {
        long seconds = milliseconds / 1000;
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long remainingSeconds = seconds % 60;

        if (hours > 0) {
            return String.format("%02d:%02d:%02d", hours, minutes, remainingSeconds);
        } else {
            return String.format("%02d:%02d", minutes, remainingSeconds);
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
                NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Timer Service Channel",
                    NotificationManager.IMPORTANCE_LOW
                );
                serviceChannel.setDescription("Shows ongoing timer");
                notificationManager.createNotificationChannel(serviceChannel);

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
            if (intent == null) {
                Log.e(TAG, "Intent is null");
                return START_NOT_STICKY;
            }

            String action = intent.getStringExtra("action");
            String timerId = intent.getStringExtra("timerId");

            if (action == null || !action.equals("stop")) {
                startForeground(CONSOLIDATED_NOTIFICATION_ID, createConsolidatedNotification());
            }

            if (action != null) {
                switch (action) {
                    case "pause":
                        if (timerId != null) {
                            pauseTimer(timerId);
                            return START_STICKY;
                        }
                        break;
                    case "resume":
                        if (timerId != null) {
                            resumeTimer(timerId);
                            return START_STICKY;
                        }
                        break;
                    case "stop":
                        if (timerId != null) {
                            stopTimer(timerId);
                            return START_NOT_STICKY;
                        }
                        break;
                    case "stopAll":
                        stopAllTimers();
                        return START_NOT_STICKY;
                }
            }

            // If no action or it's a start action, start new timer
            return startNewTimer(intent);

        } catch (Exception e) {
            Log.e(TAG, "Error in onStartCommand", e);
            return START_NOT_STICKY;
        }
    }

    private int startNewTimer(Intent intent) {
        String timerId = intent.getStringExtra("timerId");
        Log.d(TAG, "Timer ID in startNewTimer: " + timerId);

        TimerInfo existingTimer = TimerService.activeTimers.get(timerId);
        if (existingTimer != null) {
            return START_NOT_STICKY;
        }

        long duration = intent.getLongExtra("duration", 0L);
        String label = intent.getStringExtra("label") != null ?
                      intent.getStringExtra("label") :
                      "Timer " + timerId;

        if (duration <= 0) {
            Log.e(TAG, "Invalid duration: " + duration);
            return START_NOT_STICKY;
        }

        // Create and start timer
        long endTime = System.currentTimeMillis() + duration;
        TimerInfo timerInfo = new TimerInfo(endTime, label, timerId, CONSOLIDATED_NOTIFICATION_ID);
        TimerService.activeTimers.put(timerId, timerInfo);

        // Update notification immediately before starting the runnable
        updateConsolidatedNotification();

        // Then start the timer runnable
        Runnable timerRunnable = createTimerRunnable(timerId, CONSOLIDATED_NOTIFICATION_ID);
        timerInfo.runnable = timerRunnable;
        handler.post(timerRunnable);

        return START_STICKY;
    }

    private void updateConsolidatedNotification() {
        if (!TimerService.activeTimers.isEmpty()) {
            notificationManager.notify(CONSOLIDATED_NOTIFICATION_ID, createConsolidatedNotification());
        }
    }

    private Notification createConsolidatedNotification() {
        StringBuilder contentBuilder = new StringBuilder();
        int activeTimerCount = TimerService.activeTimers.size();
        String title = activeTimerCount > 0 ? 
            activeTimerCount + " Active Timer" + (activeTimerCount > 1 ? "s" : "") :
            "Starting timer...";

        if (activeTimerCount > 0) {
            for (TimerInfo timer : TimerService.activeTimers.values()) {
                long remaining = timer.isPaused ? timer.remainingTime : timer.endTime - System.currentTimeMillis();
                String status = timer.isPaused ? "⏸" : "⏱";
                contentBuilder.append(status)
                             .append(" ")
                             .append(timer.label)
                             .append(": ")
                             .append(formatTime(remaining))
                             .append("\n");
            }
        } else {
            contentBuilder.append("Initializing...");
        }

        try {
            Intent notificationIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this, CONSOLIDATED_NOTIFICATION_ID, notificationIntent,
                PendingIntent.FLAG_IMMUTABLE
            );

            return new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle(title)
                    .setContentText(contentBuilder.toString().trim())
                    .setStyle(new NotificationCompat.BigTextStyle()
                            .bigText(contentBuilder.toString().trim()))
                    .setSmallIcon(getApplicationInfo().icon)
                    .setPriority(NotificationCompat.PRIORITY_LOW)
                    .setOngoing(true)
                    .setContentIntent(pendingIntent)
                    .build();
        } catch (Exception e) {
            Log.e(TAG, "Error creating consolidated notification", e);
            return new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle(title)
                    .setContentText("Timer service running")
                    .setSmallIcon(getApplicationInfo().icon)
                    .build();
        }
    }

    private void pauseTimer(String timerId) {
        TimerInfo timer = TimerService.activeTimers.get(timerId);
        Log.d(TAG, "Pausing timer: " + timer);
        if (timer != null && !timer.isPaused) {
            timer.isPaused = true;
            timer.remainingTime = timer.endTime - System.currentTimeMillis();
            if (timer.runnable != null) {
                handler.removeCallbacks(timer.runnable);
            }
            updateConsolidatedNotification();
        }
    }

    private void resumeTimer(String timerId) {
        TimerInfo timer = TimerService.activeTimers.get(timerId);
        if (timer != null && timer.isPaused) {
            timer.isPaused = false;
            timer.endTime = System.currentTimeMillis() + timer.remainingTime;
            Runnable timerRunnable = createTimerRunnable(timerId, timer.notificationId);
            timer.runnable = timerRunnable;
            handler.post(timerRunnable);
            updateConsolidatedNotification();
        }
    }

    private void stopTimer(String timerId) {
        TimerInfo timer = TimerService.activeTimers.get(timerId);
        if (timer != null) {
            if (timer.runnable != null) {
                handler.removeCallbacks(timer.runnable);
            }
            TimerService.activeTimers.remove(timerId);
            
            if (TimerService.activeTimers.isEmpty()) {
                stopForeground(true);
                stopSelf();
            } else {
                // Update the consolidated notification if there are still active timers
                updateConsolidatedNotification();
            }
        }
    }

    private void stopAllTimers() {
        for (TimerInfo timer : TimerService.activeTimers.values()) {
            if (timer.runnable != null) {
                handler.removeCallbacks(timer.runnable);
            }
        }
        TimerService.activeTimers.clear();
        stopForeground(true);
        stopSelf();
    }

    private Runnable createTimerRunnable(final String timerId, final int notificationId) {
        return new Runnable() {
            @Override
            public void run() {
                try {
                    TimerInfo timer = TimerService.activeTimers.get(timerId);
                    if (timer == null || timer.isPaused) return;

                    long remaining = timer.endTime - System.currentTimeMillis();
                    Log.d(TAG, "Remaining time for " + timer.label + ": " + remaining);

                    if (remaining <= 0) {
                        showTimerFinishedNotification(timer);
                        TimerService.activeTimers.remove(timerId);
                        
                        if (!TimerService.activeTimers.isEmpty()) {
                            updateConsolidatedNotification();
                        } else {
                            stopForeground(true);
                            stopSelf();
                        }
                    } else {
                        updateConsolidatedNotification();
                        handler.postDelayed(this, 1000);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error in timer runnable", e);
                }
            }
        };
    }

    private void updateNotification(TimerInfo timer, String content) {
        try {
            String title = timer.isPaused ? timer.label + " (Paused)" : timer.label;
            Notification notification = createOngoingNotification(title, content, timer.notificationId);
            Log.d(TAG, "updateNotification for id: " + timer.label + ". NotificationId: " + timer.notificationId);
            notificationManager.notify(timer.notificationId, notification);
        } catch (Exception e) {
            Log.e(TAG, "Error updating notification", e);
        }
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

    private void showTimerFinishedNotification(TimerInfo timer) {
        try {
            Log.d(TAG, "Creating completion notification for " + timer.label);

            int completionNotificationId = timer.hashCode();

            Intent notificationIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
            PendingIntent pendingIntent = PendingIntent.getActivity(
                this, completionNotificationId, notificationIntent,
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
            notificationManager.notify(completionNotificationId, notification);
        } catch (Exception e) {
            Log.e(TAG, "Error showing timer finished notification", e);
        }
    }

    @Override
    public void onDestroy() {
        try {
            Log.d(TAG, "Destroying service");
            for (TimerInfo timer : TimerService.activeTimers.values()) {
                if (timer.runnable != null) {
                    handler.removeCallbacks(timer.runnable);
                }
            }
            TimerService.activeTimers.clear();
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
