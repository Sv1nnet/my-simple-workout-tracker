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

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class TimerService extends Service {
    private static final String TAG = "TimerService";
    private static final String CHANNEL_ID = "TimerServiceChannel";
    private static final String CHANNEL_ID_ALERTS = "TimerAlertsChannel";
    private static final int CONSOLIDATED_NOTIFICATION_ID = 1001;
    private static final int REST_CONSOLIDATED_NOTIFICATION_ID = 1002;
    private static final int BREAK_CONSOLIDATED_NOTIFICATION_ID = 1003;

    private static final String TYPE_REST = "rest";
    private static final String TYPE_BREAK = "break";
    private static final String SIDE_LEFT = "left";
    private static final String SIDE_RIGHT = "right";

    private static final Map<String, TimerInfo> activeTimers = new LinkedHashMap<>();
    /** Recently finished rest timers by group, so completion can show both sides at 00:00. */
    private static final Map<String, LinkedHashMap<String, TimerInfo>> finishedRestByGroup = new LinkedHashMap<>();

    private final Handler handler = new Handler(Looper.getMainLooper());
    private NotificationManager notificationManager;
    /** Notification id currently bound to this service's startForeground(). */
    private int foregroundNotificationId = -1;

    public static class TimerInfo {
        long endTime;
        long remainingTime;
        Runnable runnable;
        String label;
        String id;
        int notificationId;
        boolean isPaused;
        String type;
        String groupId;
        String exerciseTitle;
        String side;
        String sideLabel;

        TimerInfo(long endTime, String label, String id, int notificationId,
                  String type, String groupId, String exerciseTitle, String side, String sideLabel) {
            this.endTime = endTime;
            this.label = label;
            this.id = id;
            this.notificationId = notificationId;
            this.isPaused = false;
            this.remainingTime = 0;
            this.type = type != null ? type : "";
            this.groupId = groupId != null ? groupId : id;
            this.exerciseTitle = exerciseTitle != null ? exerciseTitle : label;
            this.side = side != null ? side : "";
            this.sideLabel = sideLabel != null ? sideLabel : "";
        }

        boolean isRest() {
            return TYPE_REST.equals(type);
        }

        boolean isBreak() {
            return TYPE_BREAK.equals(type);
        }

        long getRemainingMs() {
            return isPaused ? remainingTime : endTime - System.currentTimeMillis();
        }
    }

    private String formatTime(long milliseconds) {
        long seconds = Math.max(0, milliseconds) / 1000;
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long remainingSeconds = seconds % 60;

        if (hours > 0) {
            return String.format("%02d:%02d:%02d", hours, minutes, remainingSeconds);
        }
        return String.format("%02d:%02d", minutes, remainingSeconds);
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
                        NotificationManager.IMPORTANCE_HIGH
                );
                serviceChannel.setDescription("Shows ongoing timer");
                serviceChannel.setShowBadge(true);

                if (MainActivity.settings != null && MainActivity.settings.getIsVibration()) {
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

                if (MainActivity.settings != null && MainActivity.settings.getIsVibration()) {
                    alertsChannel.enableVibration(true);
                    alertsChannel.setVibrationPattern(new long[]{0, 500, 250, 500});
                }

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
        String type = intent.getStringExtra("type");
        String groupId = intent.getStringExtra("groupId");
        String exerciseTitle = intent.getStringExtra("exerciseTitle");
        String side = intent.getStringExtra("side");
        String sideLabel = intent.getStringExtra("sideLabel");

        if (duration <= 0) {
            Log.e(TAG, "Invalid duration: " + duration);
            return START_NOT_STICKY;
        }

        int notificationId = TYPE_REST.equals(type)
                ? REST_CONSOLIDATED_NOTIFICATION_ID
                : TYPE_BREAK.equals(type)
                ? BREAK_CONSOLIDATED_NOTIFICATION_ID
                : CONSOLIDATED_NOTIFICATION_ID;

        // Create timer info first
        long endTime = System.currentTimeMillis() + duration;
        TimerInfo timerInfo = new TimerInfo(
                endTime, label, timerId, notificationId,
                type, groupId, exerciseTitle, side, sideLabel
        );
        TimerService.activeTimers.put(timerId, timerInfo);

        // Promote the real content notification to FGS immediately (no empty placeholder)
        updateNotifications();

        // Start the timer runnable
        Runnable timerRunnable = createTimerRunnable(timerId, notificationId);
        timerInfo.runnable = timerRunnable;
        handler.post(timerRunnable);

        return START_STICKY;
    }

    private List<TimerInfo> getTimersByType(String type) {
        List<TimerInfo> result = new ArrayList<>();
        for (TimerInfo timer : TimerService.activeTimers.values()) {
            if (type.equals(timer.type)) {
                result.add(timer);
            }
        }
        return result;
    }

    private List<TimerInfo> getOtherTimers() {
        List<TimerInfo> result = new ArrayList<>();
        for (TimerInfo timer : TimerService.activeTimers.values()) {
            if (!timer.isRest() && !timer.isBreak()) {
                result.add(timer);
            }
        }
        return result;
    }

    private void updateNotifications() {
        List<TimerInfo> restTimers = getTimersByType(TYPE_REST);
        List<TimerInfo> breakTimers = getTimersByType(TYPE_BREAK);
        List<TimerInfo> otherTimers = getOtherTimers();

        // Prefer rest as the FGS notification so users see one meaningful card, not an empty placeholder.
        int primaryId = -1;
        Notification primaryNotification = null;

        if (!restTimers.isEmpty()) {
            primaryId = REST_CONSOLIDATED_NOTIFICATION_ID;
            primaryNotification = createRestNotification(restTimers);
        } else if (!breakTimers.isEmpty()) {
            primaryId = BREAK_CONSOLIDATED_NOTIFICATION_ID;
            primaryNotification = createLegacyConsolidatedNotification(
                    breakTimers, BREAK_CONSOLIDATED_NOTIFICATION_ID
            );
        } else if (!otherTimers.isEmpty()) {
            primaryId = CONSOLIDATED_NOTIFICATION_ID;
            primaryNotification = createLegacyConsolidatedNotification(
                    otherTimers, CONSOLIDATED_NOTIFICATION_ID
            );
        }

        if (primaryNotification != null) {
            if (foregroundNotificationId != -1 && foregroundNotificationId != primaryId) {
                notificationManager.cancel(foregroundNotificationId);
            }
            startForeground(primaryId, primaryNotification);
            foregroundNotificationId = primaryId;
        }

        // Secondary types (when both rest and break are active) as regular ongoing notifications
        if (primaryId != REST_CONSOLIDATED_NOTIFICATION_ID) {
            if (!restTimers.isEmpty()) {
                notificationManager.notify(REST_CONSOLIDATED_NOTIFICATION_ID, createRestNotification(restTimers));
            } else {
                notificationManager.cancel(REST_CONSOLIDATED_NOTIFICATION_ID);
            }
        }

        if (primaryId != BREAK_CONSOLIDATED_NOTIFICATION_ID) {
            if (!breakTimers.isEmpty()) {
                notificationManager.notify(BREAK_CONSOLIDATED_NOTIFICATION_ID, createLegacyConsolidatedNotification(
                        breakTimers, BREAK_CONSOLIDATED_NOTIFICATION_ID
                ));
            } else {
                notificationManager.cancel(BREAK_CONSOLIDATED_NOTIFICATION_ID);
            }
        }

        if (primaryId != CONSOLIDATED_NOTIFICATION_ID) {
            if (!otherTimers.isEmpty()) {
                notificationManager.notify(CONSOLIDATED_NOTIFICATION_ID, createLegacyConsolidatedNotification(
                        otherTimers, CONSOLIDATED_NOTIFICATION_ID
                ));
            } else {
                notificationManager.cancel(CONSOLIDATED_NOTIFICATION_ID);
            }
        }
    }

    private Lang getLang() {
        if (MainActivity.settings != null) {
            return MainActivity.settings.getLang();
        }
        return Lang.En;
    }

    private Notification createRestNotification(List<TimerInfo> restTimers) {
        String title = Translation.getString(Translation.restTitle, getLang());

        // Preserve insertion order of groups (LinkedHashMap of timers)
        LinkedHashMap<String, List<TimerInfo>> groups = new LinkedHashMap<>();
        for (TimerInfo timer : restTimers) {
            String key = timer.groupId != null && !timer.groupId.isEmpty()
                    ? timer.groupId
                    : timer.exerciseTitle;
            List<TimerInfo> group = groups.get(key);
            if (group == null) {
                group = new ArrayList<>();
                groups.put(key, group);
            }
            group.add(timer);
        }

        StringBuilder bigText = new StringBuilder();
        String collapsedText = "";
        boolean firstGroup = true;

        for (Map.Entry<String, List<TimerInfo>> entry : groups.entrySet()) {
            List<TimerInfo> groupTimers = entry.getValue();
            String exerciseTitle = groupTimers.get(0).exerciseTitle;
            if (exerciseTitle == null || exerciseTitle.isEmpty()) {
                exerciseTitle = groupTimers.get(0).label;
            }

            TimerInfo left = null;
            TimerInfo right = null;
            TimerInfo nonSide = null;
            for (TimerInfo t : groupTimers) {
                if (SIDE_LEFT.equals(t.side)) {
                    left = t;
                } else if (SIDE_RIGHT.equals(t.side)) {
                    right = t;
                } else {
                    nonSide = t;
                }
            }

            String timeLine;
            if (left != null || right != null) {
                StringBuilder sides = new StringBuilder();
                if (left != null) {
                    String sideName = !left.sideLabel.isEmpty() ? left.sideLabel : left.side;
                    sides.append(sideName).append(" ").append(formatTime(left.getRemainingMs()));
                }
                if (right != null) {
                    if (sides.length() > 0) {
                        sides.append(" | ");
                    }
                    String sideName = !right.sideLabel.isEmpty() ? right.sideLabel : right.side;
                    sides.append(sideName).append(" ").append(formatTime(right.getRemainingMs()));
                }
                timeLine = sides.toString();
            } else if (nonSide != null) {
                timeLine = formatTime(nonSide.getRemainingMs());
            } else {
                // Fallback: join all
                StringBuilder sides = new StringBuilder();
                for (TimerInfo t : groupTimers) {
                    if (sides.length() > 0) {
                        sides.append(" | ");
                    }
                    if (!t.sideLabel.isEmpty()) {
                        sides.append(t.sideLabel).append(" ");
                    }
                    sides.append(formatTime(t.getRemainingMs()));
                }
                timeLine = sides.toString();
            }

            if (!firstGroup) {
                bigText.append("\n\n");
            }
            firstGroup = false;
            bigText.append(exerciseTitle).append("\n").append(timeLine);

            if (collapsedText.isEmpty()) {
                collapsedText = exerciseTitle + " " + timeLine;
            }
        }

        String bigTextStr = bigText.toString().trim();
        String contentText = collapsedText.isEmpty() ? bigTextStr : collapsedText;

        try {
            Intent notificationIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    this, REST_CONSOLIDATED_NOTIFICATION_ID, notificationIntent,
                    PendingIntent.FLAG_IMMUTABLE
            );

            return new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle(title)
                    .setContentText(contentText)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(bigTextStr))
                    .setSmallIcon(getApplicationInfo().icon)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setOngoing(true)
                    .setSilent(true)
                    .setAutoCancel(false)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setContentIntent(pendingIntent)
                    .build();
        } catch (Exception e) {
            Log.e(TAG, "Error creating rest notification", e);
            return new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle(title)
                    .setContentText(contentText)
                    .setSmallIcon(getApplicationInfo().icon)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setOngoing(true)
                    .build();
        }
    }

    private Notification createLegacyConsolidatedNotification(List<TimerInfo> timers, int notificationId) {
        StringBuilder contentBuilder = new StringBuilder();
        int activeTimerCount = timers.size();

        String title = activeTimerCount + " Active Timer" + (activeTimerCount > 1 ? "s" : "");
        for (TimerInfo timer : timers) {
            long remaining = timer.getRemainingMs();
            String status = timer.isPaused ? "⏸" : "⏱";
            contentBuilder.append(status)
                    .append(" ")
                    .append(timer.label)
                    .append(": ")
                    .append(formatTime(remaining))
                    .append("\n");
        }

        String content = contentBuilder.toString().trim();

        try {
            Intent notificationIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    this, notificationId, notificationIntent,
                    PendingIntent.FLAG_IMMUTABLE
            );

            return new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle(title)
                    .setContentText(content)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(content))
                    .setSmallIcon(getApplicationInfo().icon)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setOngoing(true)
                    .setAutoCancel(false)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setContentIntent(pendingIntent)
                    .build();
        } catch (Exception e) {
            Log.e(TAG, "Error creating consolidated notification", e);
            return new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle(title)
                    .setContentText("Timer service running")
                    .setSmallIcon(getApplicationInfo().icon)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
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
            updateNotifications();
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
            updateNotifications();
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
                notificationManager.cancel(REST_CONSOLIDATED_NOTIFICATION_ID);
                notificationManager.cancel(BREAK_CONSOLIDATED_NOTIFICATION_ID);
                notificationManager.cancel(CONSOLIDATED_NOTIFICATION_ID);
                foregroundNotificationId = -1;
                stopForeground(true);
                stopSelf();
            } else {
                updateNotifications();
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
        finishedRestByGroup.clear();
        notificationManager.cancelAll();
        foregroundNotificationId = -1;
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
                        TimerService.activeTimers.remove(timerId);
                        showTimerFinishedNotification(timer);

                        if (!TimerService.activeTimers.isEmpty()) {
                            updateNotifications();
                        } else {
                            notificationManager.cancel(REST_CONSOLIDATED_NOTIFICATION_ID);
                            notificationManager.cancel(BREAK_CONSOLIDATED_NOTIFICATION_ID);
                            notificationManager.cancel(CONSOLIDATED_NOTIFICATION_ID);
                            foregroundNotificationId = -1;
                            stopForeground(true);
                            stopSelf();
                        }
                    } else {
                        // Re-post every tick so dismissed non-FGS notifications reappear
                        updateNotifications();
                        handler.postDelayed(this, 1000);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error in timer runnable", e);
                }
            }
        };
    }

    private String restGroupKey(TimerInfo timer) {
        if (timer.groupId != null && !timer.groupId.isEmpty()) {
            return timer.groupId;
        }
        if (timer.exerciseTitle != null && !timer.exerciseTitle.isEmpty()) {
            return timer.exerciseTitle;
        }
        return timer.id;
    }

    private void rememberFinishedRest(TimerInfo timer) {
        String groupKey = restGroupKey(timer);
        LinkedHashMap<String, TimerInfo> group = finishedRestByGroup.get(groupKey);
        if (group == null) {
            group = new LinkedHashMap<>();
            finishedRestByGroup.put(groupKey, group);
        }
        String slot = timer.side != null && !timer.side.isEmpty() ? timer.side : timer.id;
        group.put(slot, timer);
    }

    private boolean hasActiveRestInGroup(String groupKey) {
        for (TimerInfo t : TimerService.activeTimers.values()) {
            if (t.isRest() && groupKey.equals(restGroupKey(t))) {
                return true;
            }
        }
        return false;
    }

    private String formatRestExerciseBlock(String exerciseTitle, List<TimerInfo> finishedInGroup) {
        StringBuilder block = new StringBuilder();
        String title = exerciseTitle != null && !exerciseTitle.isEmpty() ? exerciseTitle : "";
        if (!title.isEmpty()) {
            block.append(title).append("\n");
        }

        String zero = formatTime(0);
        TimerInfo left = null;
        TimerInfo right = null;
        TimerInfo nonSide = null;
        for (TimerInfo t : finishedInGroup) {
            if (SIDE_LEFT.equals(t.side)) {
                left = t;
            } else if (SIDE_RIGHT.equals(t.side)) {
                right = t;
            } else {
                nonSide = t;
            }
        }

        if (left != null || right != null) {
            StringBuilder sides = new StringBuilder();
            if (left != null) {
                String name = !left.sideLabel.isEmpty() ? left.sideLabel : left.side;
                sides.append(name).append(" - ").append(zero);
            }
            if (right != null) {
                if (sides.length() > 0) {
                    sides.append(" | ");
                }
                String name = !right.sideLabel.isEmpty() ? right.sideLabel : right.side;
                sides.append(name).append(" - ").append(zero);
            }
            block.append(sides);
        } else if (nonSide != null) {
            block.append(zero);
        } else if (!finishedInGroup.isEmpty()) {
            block.append(zero);
        }

        return block.toString();
    }

    private String buildRestCompletionText(TimerInfo finishedTimer) {
        String groupKey = restGroupKey(finishedTimer);
        rememberFinishedRest(finishedTimer);

        LinkedHashMap<String, TimerInfo> finishedGroup = finishedRestByGroup.get(groupKey);
        List<TimerInfo> finishedList = finishedGroup != null
                ? new ArrayList<>(finishedGroup.values())
                : java.util.Collections.singletonList(finishedTimer);

        String exerciseTitle = finishedTimer.exerciseTitle != null && !finishedTimer.exerciseTitle.isEmpty()
                ? finishedTimer.exerciseTitle
                : finishedTimer.label;

        // If siblings still running, show only sides finished so far for this exercise
        String text = formatRestExerciseBlock(exerciseTitle, finishedList);

        if (!hasActiveRestInGroup(groupKey)) {
            finishedRestByGroup.remove(groupKey);
        }

        return text;
    }

    private void showTimerFinishedNotification(TimerInfo timer) {
        try {
            Log.d(TAG, "Creating completion notification for " + timer.label);

            // Stable id per rest exercise group so left+right updates replace one card
            int completionNotificationId = timer.isRest()
                    ? REST_CONSOLIDATED_NOTIFICATION_ID + 1000 + Math.abs(restGroupKey(timer).hashCode()) % 1000
                    : timer.hashCode();

            Intent notificationIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    this, completionNotificationId, notificationIntent,
                    PendingIntent.FLAG_IMMUTABLE
            );

            String title;
            String content;
            if (timer.isRest()) {
                title = Translation.getString(Translation.restDone, getLang());
                content = buildRestCompletionText(timer);
            } else if (timer.isBreak()) {
                title = Translation.getString(Translation.breakDone, getLang());
                content = timer.exerciseTitle != null && !timer.exerciseTitle.isEmpty()
                        ? timer.exerciseTitle
                        : timer.label;
            } else {
                title = timer.label + " Finished!";
                content = "Your timer has completed";
            }

            NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, CHANNEL_ID_ALERTS)
                    .setContentTitle(title)
                    .setContentText(content)
                    .setStyle(new NotificationCompat.BigTextStyle().bigText(content))
                    .setSmallIcon(getApplicationInfo().icon)
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setAutoCancel(true)
                    .setContentIntent(pendingIntent);


            if (MainActivity.settings != null && MainActivity.settings.getIsVibration()) {
                notificationBuilder.setVibrate(new long[]{0, 500, 250, 500});
            }

            Notification notification = notificationBuilder.build();

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
            finishedRestByGroup.clear();
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
