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
import androidx.core.app.ServiceCompat;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class TimerService extends Service {
    private static final String TAG = "TimerService";
    /** Fresh channel id — older builds created TimerServiceChannel as IMPORTANCE_LOW (cannot upgrade). */
    private static final String CHANNEL_ID = "TimerServiceChannel_v2";
    private static final String CHANNEL_ID_ALERTS = "TimerAlertsChannel";
    private static final String LEGACY_CHANNEL_ID = "TimerServiceChannel";
    private static final int CONSOLIDATED_NOTIFICATION_ID = 1001;
    /** Single ongoing card for both rest and break (Samsung limits multiple updating notifs). */
    private static final int REST_BREAK_NOTIFICATION_ID = 1002;
    /** Legacy break-only id — always cancelled so old installs don't keep a second card. */
    private static final int LEGACY_BREAK_NOTIFICATION_ID = 1003;

    public static final String TYPE_REST = "rest";
    public static final String TYPE_BREAK = "break";
    public static final String SIDE_LEFT = "left";
    public static final String SIDE_RIGHT = "right";

    private static final Map<String, TimerInfo> activeTimers = new LinkedHashMap<>();
    /** Recently finished rest timers by group, so completion can show both sides at 00:00. */
    private static final Map<String, LinkedHashMap<String, TimerInfo>> finishedRestByGroup = new LinkedHashMap<>();

    private final Handler handler = new Handler(Looper.getMainLooper());
    private NotificationManager notificationManager;
    /** Notification id currently bound to this service's startForeground(). */
    private int foregroundNotificationId = -1;

    public static TimerInfo getActiveTimer(String timerId) {
        return activeTimers.get(timerId);
    }

    public static boolean hasActiveTimers() {
        return !activeTimers.isEmpty();
    }

    public static boolean hasRestOrBreakTimers() {
        for (TimerInfo timer : activeTimers.values()) {
            if (timer.isRest() || timer.isBreak()) {
                return true;
            }
        }
        return false;
    }

    public static List<TimerInfo> getTimersByTypePublic(String type) {
        List<TimerInfo> result = new ArrayList<>();
        if (type == null) {
            return result;
        }
        for (TimerInfo timer : activeTimers.values()) {
            if (type.equals(timer.type)) {
                result.add(timer);
            }
        }
        return result;
    }

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
                try {
                    notificationManager.deleteNotificationChannel(LEGACY_CHANNEL_ID);
                } catch (Exception ignored) {
                }

                // Match ActivityService: silent ongoing channel
                NotificationChannel serviceChannel = new NotificationChannel(
                        CHANNEL_ID,
                        "Timer Service Channel",
                        NotificationManager.IMPORTANCE_LOW
                );
                serviceChannel.setDescription("Shows ongoing rest and break timers");
                serviceChannel.setShowBadge(true);
                serviceChannel.setSound(null, null);
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

    /** Called when ActivityService releases FGS so we can keep rest/break alive. */
    public static void requestForegroundPromotion(android.content.Context context) {
        if (activeTimers.isEmpty()) {
            return;
        }
        Intent intent = new Intent(context, TimerService.class);
        intent.putExtra("action", "promote");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
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

            if ("promote".equals(action)) {
                ensureForegroundStarted();
                updateNotifications();
                return START_STICKY;
            }

            // Second FGS is delayed on Samsung. If activity duration already holds FGS,
            // rest/break are posted as silent ongoing notify only (process kept alive by ActivityService).
            boolean needsOwnFgs = !ActivityService.isForegroundActive();
            if (needsOwnFgs && (action == null || "start".equals(action) || "resume".equals(action))) {
                ensureForegroundStarted();
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

            return startNewTimer(intent);

        } catch (Exception e) {
            Log.e(TAG, "Error in onStartCommand", e);
            return START_NOT_STICKY;
        }
    }

    private void ensureForegroundStarted() {
        if (foregroundNotificationId != -1) {
            return;
        }
        WorkoutOngoingNotification.ensureChannel(this);
        Notification bootstrap = WorkoutOngoingNotification.build(this);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ServiceCompat.startForeground(
                    this,
                    WorkoutOngoingNotification.ID,
                    bootstrap,
                    android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            );
        } else {
            startForeground(WorkoutOngoingNotification.ID, bootstrap);
        }
        foregroundNotificationId = WorkoutOngoingNotification.ID;
    }

    private void updateNotifications() {
        WorkoutOngoingNotification.ensureChannel(this);
        WorkoutOngoingNotification.cancelLegacyIds(notificationManager);

        boolean hasCombinedContent = WorkoutOngoingNotification.hasContent()
                || !getOtherTimers().isEmpty();

        if (!hasCombinedContent) {
            WorkoutNotificationTicker.stopIfIdle();
            notificationManager.cancel(WorkoutOngoingNotification.ID);
            WorkoutOngoingNotification.resetStableWhen();
            return;
        }

        Notification primaryNotification = WorkoutOngoingNotification.build(this);
        int primaryId = WorkoutOngoingNotification.ID;

        if (ActivityService.isForegroundActive()) {
            // Activity duration already owns FGS — update the same card via ticker
            if (foregroundNotificationId != -1) {
                stopForeground(false);
                foregroundNotificationId = -1;
            }
            WorkoutNotificationTicker.refreshNow(this);
        } else {
            if (foregroundNotificationId != -1 && foregroundNotificationId != primaryId) {
                notificationManager.cancel(foregroundNotificationId);
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ServiceCompat.startForeground(
                        this,
                        primaryId,
                        primaryNotification,
                        android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
                );
            } else {
                startForeground(primaryId, primaryNotification);
            }
            foregroundNotificationId = primaryId;
            WorkoutNotificationTicker.refreshNow(this);
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

        int notificationId = (TYPE_REST.equals(type) || TYPE_BREAK.equals(type))
                ? REST_BREAK_NOTIFICATION_ID
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

    private List<TimerInfo> getOtherTimers() {
        List<TimerInfo> result = new ArrayList<>();
        for (TimerInfo timer : TimerService.activeTimers.values()) {
            if (!timer.isRest() && !timer.isBreak()) {
                result.add(timer);
            }
        }
        return result;
    }

    private Lang getLang() {
        if (MainActivity.settings != null) {
            return MainActivity.settings.getLang();
        }
        return Lang.En;
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
                if (ActivityService.isForegroundActive()) {
                    if (foregroundNotificationId != -1) {
                        stopForeground(false);
                        foregroundNotificationId = -1;
                    }
                    // Activity keeps refreshing the combined card
                    WorkoutNotificationTicker.refreshNow(this);
                } else {
                    WorkoutNotificationTicker.stopIfIdle();
                    notificationManager.cancel(WorkoutOngoingNotification.ID);
                    WorkoutOngoingNotification.cancelLegacyIds(notificationManager);
                    WorkoutOngoingNotification.resetStableWhen();
                    foregroundNotificationId = -1;
                    stopForeground(true);
                }
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

        if (ActivityService.isForegroundActive()) {
            if (foregroundNotificationId != -1) {
                stopForeground(false);
                foregroundNotificationId = -1;
            }
            WorkoutNotificationTicker.refreshNow(this);
        } else {
            WorkoutNotificationTicker.stopIfIdle();
            notificationManager.cancel(WorkoutOngoingNotification.ID);
            WorkoutOngoingNotification.cancelLegacyIds(notificationManager);
            WorkoutOngoingNotification.resetStableWhen();
            foregroundNotificationId = -1;
            stopForeground(true);
        }
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
                        } else if (ActivityService.isForegroundActive()) {
                            if (foregroundNotificationId != -1) {
                                stopForeground(false);
                                foregroundNotificationId = -1;
                            }
                            WorkoutNotificationTicker.refreshNow(TimerService.this);
                            stopSelf();
                        } else {
                            WorkoutNotificationTicker.stopIfIdle();
                            notificationManager.cancel(WorkoutOngoingNotification.ID);
                            WorkoutOngoingNotification.cancelLegacyIds(notificationManager);
                            WorkoutOngoingNotification.resetStableWhen();
                            foregroundNotificationId = -1;
                            stopForeground(true);
                            stopSelf();
                        }
                    } else {
                        // UI updates are owned by WorkoutNotificationTicker (1 Hz).
                        // This runnable only watches for completion.
                        handler.postDelayed(this, 1000);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error in timer runnable", e);
                }
            }
        };
    }

    private String timerGroupKey(TimerInfo timer) {
        if (timer.groupId != null && !timer.groupId.isEmpty()) {
            return timer.groupId;
        }
        if (timer.exerciseTitle != null && !timer.exerciseTitle.isEmpty()) {
            return timer.exerciseTitle;
        }
        return timer.id;
    }

    private void rememberFinishedRest(TimerInfo timer) {
        String groupKey = timerGroupKey(timer);
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
            if (t.isRest() && groupKey.equals(timerGroupKey(t))) {
                return true;
            }
        }
        return false;
    }

    private String formatCompletionExerciseBlock(String exerciseTitle, List<TimerInfo> finishedInGroup) {
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
        String groupKey = timerGroupKey(finishedTimer);
        rememberFinishedRest(finishedTimer);

        LinkedHashMap<String, TimerInfo> finishedGroup = finishedRestByGroup.get(groupKey);
        List<TimerInfo> finishedList = finishedGroup != null
                ? new ArrayList<>(finishedGroup.values())
                : java.util.Collections.singletonList(finishedTimer);

        String exerciseTitle = finishedTimer.exerciseTitle != null && !finishedTimer.exerciseTitle.isEmpty()
                ? finishedTimer.exerciseTitle
                : finishedTimer.label;

        String text = formatCompletionExerciseBlock(exerciseTitle, finishedList);

        if (!hasActiveRestInGroup(groupKey)) {
            finishedRestByGroup.remove(groupKey);
        }

        return text;
    }

    private String buildBreakCompletionText(TimerInfo finishedTimer) {
        String exerciseTitle = finishedTimer.exerciseTitle != null && !finishedTimer.exerciseTitle.isEmpty()
                ? finishedTimer.exerciseTitle
                : finishedTimer.label;
        return formatCompletionExerciseBlock(
                exerciseTitle,
                java.util.Collections.singletonList(finishedTimer)
        );
    }

    private void showTimerFinishedNotification(TimerInfo timer) {
        try {
            Log.d(TAG, "Creating completion notification for " + timer.label);

            // Stable id per exercise group so left+right rest updates replace one card
            int completionNotificationId;
            if (timer.isRest()) {
                completionNotificationId = REST_BREAK_NOTIFICATION_ID + 1000
                        + Math.abs(timerGroupKey(timer).hashCode()) % 1000;
            } else if (timer.isBreak()) {
                completionNotificationId = LEGACY_BREAK_NOTIFICATION_ID + 1000
                        + Math.abs(timerGroupKey(timer).hashCode()) % 1000;
            } else {
                completionNotificationId = timer.hashCode();
            }

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
                content = buildBreakCompletionText(timer);
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
