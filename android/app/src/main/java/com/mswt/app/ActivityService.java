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
    public class ActivityNotification {
        public String id;
        public String content;
        public long pausedTime = 0;
        public long pausedTimePassed = 0;
        public boolean isRunning = false;
        public boolean isPaused = false;
        public boolean isFinished = false;
        public Runnable runnable;

        public ActivityNotification(String id, String content, Runnable runnable) {
            this.content = content;
            this.id = id;

            if (runnable != null) {
                this.runnable = runnable;
            }
        }

        public Runnable run(Runnable runnable) {
            this.runnable = runnable;
            handler.post(runnable);

            this.isRunning = true;
            this.isPaused = false;
            this.isFinished = false;
            return runnable;
        }

        public void pause(long pausedTime) {
            this.isRunning = false;
            this.isPaused = true;

            if (pausedTime != 0) {
                this.pausedTimePassed = pausedTime - this.pausedTime;
            }
            this.pausedTime = pausedTime;
        }

        public void stop() {
            this.isRunning = false;
            this.isPaused = false;
        }

        public void finish() {
            this.stop();
            this.isFinished = false;
        }
    }

    private static final HashMap<String, ActivityNotification> notifications = new HashMap<>();
    private static NotificationManager notificationManager;
    private static String title;
    private static final String CHANNEL_ID = "ActivityServiceChannel";
    private static final String CHANNEL_ID_ALERTS = "ActivityAlertsChannel";
    private static final int ACTIVITY_NOTIFICATION_ID = 10000;
    private static final int RESULT_STOPWATCH_NOTIFICATION_ID = 10001;
    private static final int REST_TIMER_NOTIFICATION_ID = 10002;
    private static final int BREAK_TIMER_NOTIFICATION_ID = 10003;
    private String id;
    private long startTime;
    private long timePaused;
    private long prevTimePaused;
    private long pausedTimePassed = 0;
    private boolean isRunning = false;
    private boolean isStarted = false;

    private Handler handler = new Handler(Looper.getMainLooper());

    public void start(long startTime) {
        this.startTime = startTime;
        this.isStarted = true;
        this.isRunning = true;

        StringBuilder activityTitle = createActivityNotificationText();
        Runnable runnable = run(startTime);

        ActivityNotification activityNotification = new ActivityNotification(
                id,
                activityTitle.toString(),
                runnable
        );
        ActivityService.notifications.put(activityNotification.id, activityNotification);
    }

    public void pause(String id, long pausedTime) {
        ActivityNotification activityNotification = ActivityService.notifications.get(id);

        if (activityNotification == null) return;

        activityNotification.pause(pausedTime);
        handler.removeCallbacks(activityNotification.runnable);
        updateNotificationContent();
    }

    public void stop(String id) {
        ActivityNotification activityNotification = ActivityService.notifications.get(id);

        if (activityNotification != null) {
            handler.removeCallbacks(activityNotification.runnable);
            ActivityService.notifications.remove(id);
        }

        if (ActivityService.notifications.isEmpty()) {
            notificationManager.cancelAll();
            stopForeground(true);
            stopSelf();
        } else {
            updateNotificationContent();
        }
    }

    public void stopAll() {
        notifications.values();

        for (ActivityNotification activityNotification : ActivityService.notifications.values()) {
            stop(activityNotification.id);
        }
    }

    private StringBuilder createActivityNotificationTitle() {
        Settings settings = MainActivity.settings;

        Lang lang = Lang.En;
        if (settings != null) {
            lang = settings.getLang();
        }


        StringBuilder stringBuilder = new StringBuilder();

        String activityTitle = Translation.getString(Translation.activityTitle, lang);

        if (activityTitle != null) {
            // Activity: title
            stringBuilder
                    .append(activityTitle + ": " + title)
                    .append("\n");
        }

        return stringBuilder;
    }

    private StringBuilder createActivityNotificationText() {
        Settings settings = MainActivity.settings;

        Lang lang = Lang.En;
        if (settings != null) {
            lang = settings.getLang();
        }

        StringBuilder stringBuilder = new StringBuilder();

        String timePassed = formatTime(System.currentTimeMillis() - startTime - pausedTimePassed);
        if (isRunning) {
            // 01:43:08
            stringBuilder
                    .append(timePassed)
                    .append("\n");
        } else {
            // (Paused) 01:43:08
            stringBuilder
                    .append("(" + Translation.getString(Translation.paused, lang) + ") " + timePassed)
                    .append("\n");
        }

        return stringBuilder;
    }

    private StringBuilder createRestNotificationText() {
        Settings settings = MainActivity.settings;

        Lang lang = Lang.En;
        if (settings != null) {
            lang = settings.getLang();
        }

        StringBuilder stringBuilder = new StringBuilder();

        String restTitle = Translation.getString(Translation.restTitle, lang);

        if (restTitle != null) {
            stringBuilder
                    .append(restTitle + ": " + title)
                    .append("\n");
        }

        ActivityNotification notification = ActivityService.notifications.get(title);
        if (notification != null) {
            stringBuilder.append(notification.content);
        }

        return stringBuilder;
    }

    private String formatTime(long milliseconds) {
        long seconds = milliseconds / 1000;
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long remainingSeconds = seconds % 60;

        if (hours > 0) {
            return String.format("%02d:%02d:%02d", hours, minutes, remainingSeconds);
        }
        return String.format("%02d:%02d", minutes, remainingSeconds);
    }

//    public void start() {
//        this.isStarted = true;
//    }

//    private Notification createNotification() {
//        StringBuilder activityTitle = createActivityNotificationTitle();
//        StringBuilder restTitle = createActivityNotificationText();

//        Notification notification = new Notification(
//                activityTitle.toString(),
//                restTitle.toString()
//        );

//        return notification;
//    }

    public void pause(long pauseTime) {

    }

    public void stop(long stopTime) {

    }

    public void resume(long resumeTime) {

    }

    private Runnable run(long startTime) {
        this.isRunning = true;

        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                updateNotificationContent();
                handler.postDelayed(this, 1000);
            }
        };

        Notification notification = updateNotificationContent();
        startForeground(ACTIVITY_NOTIFICATION_ID, notification);

        handler.post(runnable);

        return runnable;
    }

    private Notification updateNotificationContent() {
        StringBuilder activityTitle = createActivityNotificationTitle();
        StringBuilder activityText = createActivityNotificationText();

        Intent notificationIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                ACTIVITY_NOTIFICATION_ID,
                notificationIntent,
                PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(activityTitle.toString())
                .setContentText(activityText.toString().trim())
                .setSmallIcon(getApplicationInfo().icon)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setOngoing(true)
                .setSilent(true)
                .setAutoCancel(false)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(pendingIntent);

        Notification notification = builder.build();

        notificationManager.notify(ACTIVITY_NOTIFICATION_ID, notification);

        return notification;
    }

    public void update(String title, long startTime) {
        ActivityService.title = title;
        this.startTime = startTime;
    }

    public void update(String title) {
        ActivityService.title = title;
    }

    public void update(long startTime) {
        this.startTime = startTime;
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
                        "Timer Service Channel",
                        NotificationManager.IMPORTANCE_HIGH
                );
                serviceChannel.setDescription("Shows ongoing timer");
                serviceChannel.setShowBadge(true);

                if (MainActivity.settings.getIsVibration()) {
                    serviceChannel.enableVibration(true);
                    serviceChannel.setVibrationPattern(new long[]{0, 100});
                }
                notificationManager.createNotificationChannel(serviceChannel);

                NotificationChannel alertsChannel = new NotificationChannel(
                        CHANNEL_ID_ALERTS,
                        "Timer Alerts Channel",
                        NotificationManager.IMPORTANCE_HIGH
                );
                alertsChannel.setDescription("Shows timer completion alerts");

                if (MainActivity.settings.getIsVibration()) {
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
            long timeStart = intent.getLongExtra("timeStart", System.currentTimeMillis());

            this.id = id;

            // Only show notification if we're starting a new timer
            if (action == null || action.equals("start")) {
                ActivityService.title = title;
                start(timeStart);
                return START_STICKY;
            }

            if (action != null) {
                switch (action) {
//                    case "pause":
//                        if (timerId != null) {
//                            pauseTimer(timerId);
//                            return START_STICKY;
//                        }
//                        break;
//                    case "resume":
//                        if (timerId != null) {
//                            resumeTimer(timerId);
//                            return START_STICKY;
//                        }
//                        break;
                    case "stop":
                        if (id != null) {
                            stop(id);
                            return START_NOT_STICKY;
                        }
                        break;
//                    case "stopAll":
//                        stopAllTimers();
//                        return START_NOT_STICKY;
                }
            }

            // If no action or it's a start action, start new timer
//            return startNewTimer(intent);
            return START_NOT_STICKY;
        } catch (Exception e) {
            Log.e("ActitityService", "Error in onStartCommand", e);
            return START_NOT_STICKY;
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }


    public long getStartTime() {
        return startTime;
    }

    public void setStartTime(long startTime) {
        this.startTime = startTime;
    }

    public boolean getIsRunning() {
        return isRunning;
    }

    public void setIsRunning(boolean running) {
        isRunning = running;
    }

    public boolean getIsStarted() {
        return isStarted;
    }

    public void setIsStarted(boolean started) {
        isStarted = started;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}