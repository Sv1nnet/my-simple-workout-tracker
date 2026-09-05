package com.mswt.app;

import android.app.NotificationManager;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;

/**
 * Posts the combined ongoing notification at most once per second.
 * Multiple activity/rest/break timers must not each call notify() — Samsung
 * throttles rapid updates to the same id (~5–7s).
 */
public final class WorkoutNotificationTicker {
    private static final Handler HANDLER = new Handler(Looper.getMainLooper());
    private static final long INTERVAL_MS = 1000L;

    private static Context appContext;
    private static Runnable tick;
    private static long lastPostAt = 0L;

    private WorkoutNotificationTicker() {}

    /** Ensure the 1 Hz loop is running (does not force an extra notify). */
    public static void ensureStarted(Context context) {
        if (context == null) {
            return;
        }
        appContext = context.getApplicationContext();
        if (tick != null) {
            return;
        }
        tick = new Runnable() {
            @Override
            public void run() {
                if (!WorkoutOngoingNotification.hasContent()) {
                    tick = null;
                    return;
                }
                post(appContext, false);
                HANDLER.postDelayed(this, INTERVAL_MS);
            }
        };
        HANDLER.postDelayed(tick, INTERVAL_MS);
    }

    /** Immediate post (start/pause/resume/stop) + ensure the 1 Hz loop is running. */
    public static void refreshNow(Context context) {
        if (context == null) {
            return;
        }
        appContext = context.getApplicationContext();
        post(appContext, true);
        ensureStarted(appContext);
    }

    public static void stopIfIdle() {
        if (WorkoutOngoingNotification.hasContent()) {
            return;
        }
        if (tick != null) {
            HANDLER.removeCallbacks(tick);
            tick = null;
        }
        lastPostAt = 0L;
    }

    private static void post(Context context, boolean force) {
        if (context == null) {
            return;
        }
        long now = System.currentTimeMillis();
        // Drop near-duplicate posts from overlapping service callbacks.
        if (!force && now - lastPostAt < 800L) {
            return;
        }
        lastPostAt = now;

        WorkoutOngoingNotification.ensureChannel(context);
        NotificationManager nm =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) {
            return;
        }
        WorkoutOngoingNotification.cancelLegacyIds(nm);
        if (!WorkoutOngoingNotification.hasContent()) {
            return;
        }
        nm.notify(WorkoutOngoingNotification.ID, WorkoutOngoingNotification.build(context));
    }
}
