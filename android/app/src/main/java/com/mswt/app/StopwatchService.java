package com.mswt.app;

import static android.content.ContentValues.TAG;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import java.util.HashMap;
import java.util.Map;

public class StopwatchService extends Service {
    private static final int NOTIFICATION_ID = 10001;
    private static final String CHANNEL_ID = "StopwatchServiceChannel";
    private static NotificationManager notificationManager;
    private static final Map<String, StopwatchService.StopwatchInfo> activeStopwatches = new HashMap<>();

    private static Handler handler = new Handler(Looper.getMainLooper());

    private static class StopwatchInfo {
        long startTime;
        long passedTime;

        // to update time notification
        Runnable runnable;
        // title for notification
        String title;
        // key in activeStopwatches HashMap
        String channelId;
        // id in notificationManager.notify
        int notificationId;
        boolean isPaused;
        int updateRate;
        // if paused increase gap to calculate actual time passed
        long gap;

        StopwatchInfo(long startTime, String title, String channelId, int notificationId, int updateRate, Runnable runnable) {
            this.startTime = startTime;
            this.title = title;
            this.channelId = channelId;
            this.notificationId = notificationId;
            this.isPaused = false;
            this.passedTime = 0;
            this.updateRate = updateRate;
            this.runnable = runnable;
            this.gap = 0;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        createNotificationChannels();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    //    @Override
//    public int onStartCommand(Intent intent, int flags, int startId) {
//
//    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Stopwatch Service Channel",
                    NotificationManager.IMPORTANCE_HIGH
            );
            serviceChannel.setDescription("Show ongoin stopwatch");
            serviceChannel.setShowBadge(true);

            notificationManager.createNotificationChannel(serviceChannel);
        }
    }

    public int start(Intent intent) {
        String channelId = intent.getStringExtra("channelId");
        String title = intent.getStringExtra("title");
        if (title == null) title = "";

        String content = intent.getStringExtra("content");

        int notificationId = intent.getIntExtra("notificationId", NOTIFICATION_ID);
        int updateRate = intent.getIntExtra("updateRate", 1000);

        long startTime = intent.getLongExtra("startTime", System.currentTimeMillis());

        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                handler.postDelayed(this, updateRate);
            }
        };

        Notification notification = buildNotification(channelId, title, content);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification);
        }

        StopwatchInfo stopwatch = new StopwatchInfo(
                startTime,
                title,
                channelId,
                notificationId,
                updateRate,
                runnable
        );

        activeStopwatches.put(String.valueOf(notificationId), stopwatch);

        handler.post(runnable);
//        new Thread(runnable).start();

        return START_STICKY;
    }

    public void pause(int id, Intent intent) {
        StopwatchInfo stopwatch = activeStopwatches.get(String.valueOf(id));

        Log.d(TAG, "Pausing stopwatch: " + stopwatch);
        if (stopwatch == null || stopwatch.isPaused) return;

        stopwatch.isPaused = true;
        stopwatch.passedTime = System.currentTimeMillis();
        if (stopwatch.runnable != null) {
            handler.removeCallbacks(stopwatch.runnable);
        }

        String content = intent.getStringExtra("content");

        updateNotification(stopwatch, content);
    }

    public void resume(String id) {

    }

    private Notification updateNotification(StopwatchInfo stopwatch, String content) {
        return buildNotification(stopwatch.channelId, stopwatch.title, content);
    }

    public Notification buildNotification(String channelId, String title, String content) {
        return new NotificationCompat.Builder(this, channelId)
                .setContentTitle(title)
                .setContentText(content)
                .setSmallIcon(getApplicationInfo().icon)
                .setSilent(true)
                .build();
    }

    private String formatTime(long milliseconds) {
        long seconds = milliseconds / 1000;
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long remainingSeconds = seconds % 60;

        return String.format("%02d:%02d:%02d", hours, minutes, remainingSeconds);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        try {
            if (intent == null) {
                Log.e(TAG, "Intent is null");
                return START_NOT_STICKY;
            }

            String action = intent.getStringExtra("action");
            String channelId = intent.getStringExtra("channelId");

            // Only show notification if we're starting a new timer
            if (action == null) {
                throw new Exception("No command provided");
            }

            if (!action.equals("stopAll") && channelId == null) {
                throw new Exception("channelId is not provided");
            }

            switch (action) {
                case "start":
                    start(intent);
                    return START_STICKY;
                case "pause":
                    pause(NOTIFICATION_ID, intent);
                    return START_STICKY;
                case "resume":
                    if (channelId != null) {
//                            resumeTimer(timerId);
                        return START_STICKY;
                    }
                    break;
                case "stop":
                    if (channelId != null) {
//                            stopTimer(timerId);
                        return START_NOT_STICKY;
                    }
                    break;
                case "stopAll":
//                        stopAllTimers();
                    return START_NOT_STICKY;
            }

            // If no action or it's a start action, start new timer
//            return startNewTimer(intent);

        } catch (Exception e) {
            Log.e(TAG, "Error in onStartCommand", e);
            return START_NOT_STICKY;
        }

        return START_NOT_STICKY;
    }
}
