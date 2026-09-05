package com.mswt.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

/**
 * Single ongoing notification for activity duration + rest + break.
 * Avoids OEM reordering / multi-notification limits by posting one card.
 */
public final class WorkoutOngoingNotification {
    public static final int ID = 10000;
    /** Reuse the channel ActivityService already created — known-visible on Samsung. */
    public static final String CHANNEL_ID = "ActivityServiceChannel";

    private static final int LEGACY_REST_BREAK_ID = 1002;
    private static final int LEGACY_BREAK_ID = 1003;
    private static final int LEGACY_CONSOLIDATED_ID = 1001;

    private static long stableWhen = 0;

    private WorkoutOngoingNotification() {}

    public static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) {
            return;
        }
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Workout",
                NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Ongoing workout timers");
        channel.setShowBadge(true);
        channel.setSound(null, null);
        nm.createNotificationChannel(channel);
    }

    public static void cancelLegacyIds(NotificationManager nm) {
        if (nm == null) {
            return;
        }
        nm.cancel(LEGACY_REST_BREAK_ID);
        nm.cancel(LEGACY_BREAK_ID);
        nm.cancel(LEGACY_CONSOLIDATED_ID);
    }

    public static boolean hasContent() {
        return ActivityService.getActivitySnapshot() != null || TimerService.hasRestOrBreakTimers();
    }

    public static Notification build(Context context) {
        ensureChannel(context);
        Lang lang = getLang();

        ActivityService.ActivitySnapshot activity = ActivityService.getActivitySnapshot();
        List<TimerService.TimerInfo> restTimers = TimerService.getTimersByTypePublic(TimerService.TYPE_REST);
        List<TimerService.TimerInfo> breakTimers = TimerService.getTimersByTypePublic(TimerService.TYPE_BREAK);

        String restLabel = Translation.getString(Translation.restTitle, lang);
        String breakLabel = Translation.getString(Translation.breakTitle, lang);

        String titlePlain;
        StringBuilder bodyHtml = new StringBuilder();

        if (activity != null) {
            titlePlain = activity.title + " - " + formatTime(activity.elapsedMs);
        } else if (!restTimers.isEmpty() && !breakTimers.isEmpty()) {
            titlePlain = restLabel + " / " + breakLabel;
        } else if (!restTimers.isEmpty()) {
            titlePlain = restLabel;
        } else if (!breakTimers.isEmpty()) {
            titlePlain = breakLabel;
        } else {
            titlePlain = "Workout";
        }

        appendGroupedSections(bodyHtml, restTimers, restLabel);
        appendGroupedSections(bodyHtml, breakTimers, breakLabel);

        String bodyText = bodyHtml.toString().trim();

        Intent notificationIntent = context.getPackageManager()
                .getLaunchIntentForPackage(context.getPackageName());
        if (notificationIntent == null) {
            notificationIntent = new Intent();
        }
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, ID, notificationIntent, PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setContentTitle(titlePlain)
                .setSmallIcon(context.getApplicationInfo().icon)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
                .setOngoing(true)
                .setSilent(true)
                .setOnlyAlertOnce(true)
                .setAutoCancel(false)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setWhen(stableWhen())
                .setShowWhen(false)
                .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
                .setContentIntent(pendingIntent);

        if (bodyText.isEmpty()) {
            // Activity-only (or empty): title is enough — do not repeat it as content/BigText.
            builder.setContentText("\u00A0");
        } else {
            builder.setContentText(bodyText.replace('\n', ' '))
                    .setStyle(new NotificationCompat.BigTextStyle()
                            .bigText(bodyText)
                            .setBigContentTitle(titlePlain));
        }

        return builder.build();
    }

    public static void resetStableWhen() {
        stableWhen = 0;
    }

    private static long stableWhen() {
        if (stableWhen == 0) {
            ActivityService.ActivitySnapshot activity = ActivityService.getActivitySnapshot();
            if (activity != null && activity.startTime > 0) {
                stableWhen = activity.startTime;
            } else {
                stableWhen = System.currentTimeMillis();
            }
        }
        return stableWhen;
    }

    private static void appendGroupedSections(
            StringBuilder bodyHtml,
            List<TimerService.TimerInfo> timers,
            String sectionLabel
    ) {
        if (timers == null || timers.isEmpty()) {
            return;
        }

        LinkedHashMap<String, List<TimerService.TimerInfo>> groups = new LinkedHashMap<>();
        for (TimerService.TimerInfo timer : timers) {
            String key = timer.groupId != null && !timer.groupId.isEmpty()
                    ? timer.groupId
                    : timer.exerciseTitle;
            List<TimerService.TimerInfo> group = groups.get(key);
            if (group == null) {
                group = new ArrayList<>();
                groups.put(key, group);
            }
            group.add(timer);
        }

        for (List<TimerService.TimerInfo> groupTimers : groups.values()) {
            String exerciseTitle = groupTimers.get(0).exerciseTitle;
            if (exerciseTitle == null || exerciseTitle.isEmpty()) {
                exerciseTitle = groupTimers.get(0).label;
            }

            TimerService.TimerInfo left = null;
            TimerService.TimerInfo right = null;
            TimerService.TimerInfo nonSide = null;
            for (TimerService.TimerInfo t : groupTimers) {
                if (TimerService.SIDE_LEFT.equals(t.side)) {
                    left = t;
                } else if (TimerService.SIDE_RIGHT.equals(t.side)) {
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
                    sides.append(sideName).append(" - ").append(formatTime(left.getRemainingMs()));
                }
                if (right != null) {
                    if (sides.length() > 0) {
                        sides.append(" | ");
                    }
                    String sideName = !right.sideLabel.isEmpty() ? right.sideLabel : right.side;
                    sides.append(sideName).append(" - ").append(formatTime(right.getRemainingMs()));
                }
                timeLine = sides.toString();
            } else if (nonSide != null) {
                timeLine = formatTime(nonSide.getRemainingMs());
            } else {
                StringBuilder sides = new StringBuilder();
                for (TimerService.TimerInfo t : groupTimers) {
                    if (sides.length() > 0) {
                        sides.append(" | ");
                    }
                    if (!t.sideLabel.isEmpty()) {
                        sides.append(t.sideLabel).append(" - ");
                    }
                    sides.append(formatTime(t.getRemainingMs()));
                }
                timeLine = sides.toString();
            }

            if (bodyHtml.length() > 0) {
                bodyHtml.append("\n\n");
            }
            bodyHtml.append(sectionLabel)
                    .append(": ")
                    .append(exerciseTitle == null ? "" : exerciseTitle)
                    .append("\n")
                    .append(timeLine);
        }
    }

    static String formatTime(long milliseconds) {
        long seconds = Math.max(0, milliseconds) / 1000;
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long remainingSeconds = seconds % 60;
        if (hours > 0) {
            return String.format("%02d:%02d:%02d", hours, minutes, remainingSeconds);
        }
        return String.format("%02d:%02d", minutes, remainingSeconds);
    }

    private static Lang getLang() {
        if (MainActivity.settings != null) {
            return MainActivity.settings.getLang();
        }
        return Lang.En;
    }
}
