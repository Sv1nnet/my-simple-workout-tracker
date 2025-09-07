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

public class ActivityService extends Service {
    
    public enum NotificationType {
        ACTIVITY,
        REST,
        BREAK,
        DURATION_SET,
        SPEED_SET
    }

    public class Timer {
        public String id;
        public String title;
        public String content;

        public NotificationType type;

        public long startTime;
        public long elapsedMs;
        public long duration; // For countdown timers (rest/break)
        public long pausedTime = 0;
        public long totalPausedTime = 0;

        public boolean isRunning = false;
        public boolean isPaused = false;
        public boolean isFinished = false;
        public boolean isCountdown = false;

        public Runnable runnable;

        public Timer(String id, String title, String content, NotificationType type) {
            this.id = id;
            this.title = title;
            this.content = content;
            this.type = type;
            this.startTime = System.currentTimeMillis();
        }

        public Timer(String id, String title, String content, NotificationType type, long startTime) {
            this.id = id;
            this.title = title;
            this.content = content;
            this.type = type;
            this.startTime = startTime;
        }

        public Timer(String id, String title, String content, NotificationType type, long duration, boolean isCountdown) {
            this.id = id;
            this.title = title;
            this.content = content;
            this.type = type;
            this.duration = duration;
            this.isCountdown = isCountdown;
            this.startTime = System.currentTimeMillis();
        }

        public Runnable start() {
            this.isRunning = true;
            this.isPaused = false;
            this.isFinished = false;
            
            this.runnable = createTimerRunnable();
            handler.post(runnable);

            return runnable;
        }

        public void pause(long pausedTime) {
            pause(pausedTime, 0);
        }

        public void pause(long pausedTime, long elapsedMs) {
            this.isRunning = false;
            this.isPaused = true;

            if (elapsedMs > 0) {
                // Precise pause: set totalPausedTime so that current elapsed time equals elapsedMs
                long currentTime = System.currentTimeMillis();
                this.totalPausedTime = (currentTime - startTime) - elapsedMs;
                this.pausedTime = currentTime;
                
                // Store the frontend-provided elapsed time for perfect sync
                this.elapsedMs = elapsedMs;

                // Force update the notification with the corrected time
                updateNotification();
                
                Log.d("ActivityService", "Pausing Timer " + id + " with precise sync - FrontendElapsedMs: " + elapsedMs + ", StoredElapsedMs: " + this.elapsedMs + ", PausedTimeAccumulated: " + this.totalPausedTime);
            } else {
                // Regular pause: just record when the pause started and use current calculated elapsed time
                this.pausedTime = pausedTime;
                
                Log.d("ActivityService", "Pausing Timer " + id + " - CurrentStoredElapsedMs: " + this.elapsedMs);
            }

            if (runnable != null) {
                handler.removeCallbacks(runnable);
            }
        }

        public void resume(long resumeTime) {
            this.isRunning = true;
            this.isPaused = false;
            
            // Add the current pause duration to total paused time
            if (this.pausedTime != 0) {
                long pauseDuration = resumeTime - this.pausedTime;
                this.totalPausedTime += pauseDuration;
                
                Log.d("ActivityService", "Resuming Timer " + id + " - ResumeTime: " + resumeTime + ", PauseDuration: " + pauseDuration + ", TotalPausedTimePassed: " + this.totalPausedTime + ", LastStoredElapsedMs: " + this.elapsedMs);
            }
            this.pausedTime = 0;
            
            this.runnable = createTimerRunnable();
            handler.post(runnable);
        }

        public void stop() {
            this.isRunning = false;
            this.isPaused = false;
            this.isFinished = true;
            
            if (runnable != null) {
                handler.removeCallbacks(runnable);
            }
        }

        private Runnable createTimerRunnable() {
            return new Runnable() {
                @Override
                public void run() {
                    if (isCountdown) {
                        long elapsed = System.currentTimeMillis() - startTime - totalPausedTime;
                        long remaining = duration - elapsed;
                        
                        if (remaining <= 0) {
                            // Timer finished
                            stop();
                            showCompletionNotification();
                            return;
                        }
                    }
                    
                    updateElapsedTime();
                    updateNotification();
                    handler.postDelayed(this, 1000);
                }
            };
        }

        private void showCompletionNotification() {
            Settings settings = MainActivity.settings;
            Lang lang = Lang.En;
            if (settings != null) {
                lang = settings.getLang();
            }

            String completionTitle = "";
            String completionText = "";
            
            switch (type) {
                case REST:
                    completionTitle = Translation.getString(Translation.restDone, lang);
                    completionText = title;
                    break;
                case BREAK:
                    completionTitle = Translation.getString(Translation.breakDone, lang);
                    completionText = title;
                    break;
            }

            Intent notificationIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    ActivityService.this,
                    getNotificationId() + 1000,
                    notificationIntent,
                    PendingIntent.FLAG_IMMUTABLE
            );

            NotificationCompat.Builder builder = new NotificationCompat.Builder(ActivityService.this, CHANNEL_ID_ALERTS)
                    .setContentTitle(completionTitle)
                    .setContentText(completionText)
                    .setSmallIcon(getApplicationInfo().icon)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setAutoCancel(true)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setContentIntent(pendingIntent);

            if (settings != null && settings.getIsVibration()) {
                builder.setVibrate(new long[]{0, 500, 250, 500});
            }

            Notification notification = builder.build();
            notificationManager.notify(getNotificationId() + 1000, notification);
        }

        private int getNotificationId() {
            switch (type) {
                case ACTIVITY: return ACTIVITY_NOTIFICATION_ID;
                case REST: return REST_TIMER_NOTIFICATION_ID + Math.abs(id.hashCode()) % 1000;
                case BREAK: return BREAK_TIMER_NOTIFICATION_ID + Math.abs(id.hashCode()) % 1000;
                case DURATION_SET: return DURATION_SET_NOTIFICATION_ID + Math.abs(id.hashCode()) % 1000;
                case SPEED_SET: return SPEED_SET_NOTIFICATION_ID + Math.abs(id.hashCode()) % 1000;
                default: return ACTIVITY_NOTIFICATION_ID;
            }
        }

        private void updateElapsedTime() {
            // Calculate and store current elapsed time for synchronization
            long currentTime = System.currentTimeMillis();
            long elapsed = currentTime - startTime - totalPausedTime;
            this.elapsedMs = elapsed;
            
            // Debug logging for stored elapsed time
            if (type == NotificationType.ACTIVITY) {
                Log.d("ActivityService", "Timer " + id + " - UpdateElapsedTime - StoredElapsedMs: " + this.elapsedMs);
            }
        }

        private void updateNotification() {
            String notificationTitle = createNotificationTitle();
            String notificationText = createNotificationText();

            Intent notificationIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    ActivityService.this,
                    getNotificationId(),
                    notificationIntent,
                    PendingIntent.FLAG_IMMUTABLE
            );

            NotificationCompat.Builder builder = new NotificationCompat.Builder(ActivityService.this, CHANNEL_ID)
                    .setContentTitle(notificationTitle)
                    .setContentText(notificationText)
                    .setSmallIcon(getApplicationInfo().icon)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
                    .setOngoing(true)
                    .setSilent(true)
                    .setAutoCancel(false)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setContentIntent(pendingIntent);

            Notification notification = builder.build();
            notificationManager.notify(getNotificationId(), notification);
        }

        private String createNotificationTitle() {
            Settings settings = MainActivity.settings;
            Lang lang = Lang.En;
            if (settings != null) {
                lang = settings.getLang();
            }

            switch (type) {
                case ACTIVITY:
                    String activityTitle = Translation.getString(Translation.activityTitle, lang);
                    return activityTitle + ": " + title;
                case REST:
                    String restTitle = Translation.getString(Translation.restTitle, lang);
                    return restTitle + ": " + title;
                case BREAK:
                    String breakTitle = Translation.getString(Translation.breakTitle, lang);
                    return breakTitle + ": " + title;
                case DURATION_SET:
                    return "Duration Set: " + title;
                case SPEED_SET:
                    return "Speed Set: " + title;
                default:
                    return title;
            }
        }

        private String createNotificationText() {
            Settings settings = MainActivity.settings;
            Lang lang = Lang.En;
            if (settings != null) {
                lang = settings.getLang();
            }

            String timeText;
            if (isCountdown) {
                long elapsed = System.currentTimeMillis() - startTime - totalPausedTime;
                long remaining = Math.max(0, duration - elapsed);
                timeText = formatTime(remaining);
            } else {
                long currentTime = System.currentTimeMillis();
                long elapsed = currentTime - startTime - totalPausedTime;
                
                // Debug logging
                if (type == NotificationType.ACTIVITY) {
                    Log.d("ActivityService", "Timer " + id + " - CurrentTime: " + currentTime + ", StartTime: " + startTime + ", PausedTimePassed: " + totalPausedTime + ", Elapsed: " + elapsed);
                }
                
                timeText = formatTime(elapsed);
            }

            StringBuilder text = new StringBuilder();
            
            if (!isRunning && isPaused) {
                text.append("(").append(Translation.getString(Translation.paused, lang)).append(") ");
            }
            
            text.append(timeText);
            
            if (!content.isEmpty()) {
                text.append("\n").append(content);
            }

            return text.toString();
        }
    }

    private static final HashMap<String, Timer> timers = new HashMap<>();
    private static NotificationManager notificationManager;
    private static final String CHANNEL_ID = "ActivityServiceChannel";
    private static final String CHANNEL_ID_ALERTS = "ActivityAlertsChannel";
    private static final int ACTIVITY_NOTIFICATION_ID = 10000;
    private static final int REST_TIMER_NOTIFICATION_ID = 10100;
    private static final int BREAK_TIMER_NOTIFICATION_ID = 10200;
    private static final int DURATION_SET_NOTIFICATION_ID = 10300;
    private static final int SPEED_SET_NOTIFICATION_ID = 10400;

    private Handler handler = new Handler(Looper.getMainLooper());

    private String formatTime(long milliseconds) {
        long seconds = milliseconds / 1000;
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long remainingSeconds = seconds % 60;

        String formatted;
        if (hours > 0) {
            formatted = String.format("%02d:%02d:%02d", hours, minutes, remainingSeconds);
        } else {
            formatted = String.format("%02d:%02d", minutes, remainingSeconds);
        }
        
        // Debug logging
        Log.d("ActivityService", "formatTime: " + milliseconds + "ms -> " + formatted);
        
        return formatted;
    }

    public void startTimer(String id, String title, String content, NotificationType type, long startTime, long elapsedMs) {
        Timer timer = new Timer(id, title, content, type, startTime);
        
        // Set the initial elapsed time if provided
        if (elapsedMs > 0) {
            // Verify the startTime calculation is correct
            long expectedStartTime = System.currentTimeMillis() - elapsedMs;
            Log.d("ActivityService", "Provided startTime: " + startTime + ", Expected: " + expectedStartTime + ", InitialElapsed: " + elapsedMs);
        }
        
        timer.start();
        timers.put(id, timer);
        
        if (type == NotificationType.ACTIVITY) {
            startForeground(timer.getNotificationId(), createForegroundNotification());
        }
    }

    public void startTimer(String id, String title, String content, NotificationType type, long startTime) {
        startTimer(id, title, content, type, startTime, 0);
    }

    public void startCountdownTimer(String id, String title, String content, NotificationType type, long duration) {
        Timer timer = new Timer(id, title, content, type, duration, true);
        timer.start();
        timers.put(id, timer);
    }

    public void pauseTimer(String id, long elapsedMs) {
        Timer timer = timers.get(id);
        if (timer != null) {
            timer.pause(System.currentTimeMillis(), elapsedMs);
        }
    }

    public void resumeTimer(String id, long resumeTime) {
        Timer timer = timers.get(id);
        if (timer != null) {
            timer.resume(resumeTime);
        }
    }

    public void stopTimer(String id) {
        Timer timer = timers.get(id);
        if (timer != null) {
            timer.stop();
            notificationManager.cancel(timer.getNotificationId());
            timers.remove(id);
        }

        if (timers.isEmpty()) {
            stopForeground(true);
            stopSelf();
        }
    }

    public void stopAllTimers() {
        for (Timer timer : timers.values()) {
            timer.stop();
            notificationManager.cancel(timer.getNotificationId());
        }
        timers.clear();
        stopForeground(true);
        stopSelf();
    }

    private Notification createForegroundNotification() {
        Intent notificationIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                ACTIVITY_NOTIFICATION_ID,
                notificationIntent,
                PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Activity Service")
                .setContentText("Running...")
                .setSmallIcon(getApplicationInfo().icon)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
                .setOngoing(true)
                .setSilent(true)
                .setAutoCancel(false)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(pendingIntent);

        return builder.build();
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d("ActivityService", "Creating service");

        notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                NotificationChannel serviceChannel = new NotificationChannel(
                        CHANNEL_ID,
                        "Activity Service Channel",
                        NotificationManager.IMPORTANCE_LOW
                );
                serviceChannel.setDescription("Shows ongoing activity timers");
                serviceChannel.setShowBadge(true);
                serviceChannel.setSound(null, null);
                notificationManager.createNotificationChannel(serviceChannel);

                NotificationChannel alertsChannel = new NotificationChannel(
                        CHANNEL_ID_ALERTS,
                        "Activity Alerts Channel",
                        NotificationManager.IMPORTANCE_HIGH
                );
                alertsChannel.setDescription("Shows timer completion alerts");

                Settings settings = MainActivity.settings;
                if (settings != null && settings.getIsVibration()) {
                    alertsChannel.enableVibration(true);
                    alertsChannel.setVibrationPattern(new long[]{0, 500, 250, 500});
                }

                notificationManager.createNotificationChannel(alertsChannel);

                Log.d("ActivityService", "Notification channels created");
            } catch (Exception e) {
                Log.e("ActivityService", "Error creating notification channels", e);
            }
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        try {
            if (intent == null) {
                Log.e("ActivityService", "Intent is null");
                return START_NOT_STICKY;
            }

            String action = intent.getStringExtra("action");
            String id = intent.getStringExtra("id");
            String title = intent.getStringExtra("title");
            String content = intent.getStringExtra("content");
            long startTime = intent.getLongExtra("startTime", System.currentTimeMillis());
            long elapsedMs = intent.getLongExtra("elapsedMs", 0);
            long duration = intent.getLongExtra("duration", 0);
            long resumeTime = intent.getLongExtra("resumeTime", System.currentTimeMillis());
            String typeStr = intent.getStringExtra("type");
            
            NotificationType type = NotificationType.ACTIVITY;
            if (typeStr != null) {
                try {
                    type = NotificationType.valueOf(typeStr.toUpperCase());
                } catch (IllegalArgumentException e) {
                    Log.w("ActivityService", "Unknown notification type: " + typeStr);
                }
            }

            if (action == null || action.equals("start")) {
                if (duration > 0) {
                    startCountdownTimer(id, title, content, type, duration);
                } else {
                    startTimer(id, title, content, type, startTime, elapsedMs);
                }
                return START_STICKY;
            }

            if (action != null) {
                switch (action) {
                    case "pause":
                        pauseTimer(id, elapsedMs);
                        return START_STICKY;
                    case "resume":
                        resumeTimer(id, resumeTime);
                        return START_STICKY;
                    case "stop":
                        stopTimer(id);
                        return START_NOT_STICKY;
                    case "stopAll":
                        stopAllTimers();
                        return START_NOT_STICKY;
                }
            }

            return START_NOT_STICKY;
        } catch (Exception e) {
            Log.e("ActivityService", "Error in onStartCommand", e);
            return START_NOT_STICKY;
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}