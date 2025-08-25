package com.mswt.app;

import java.util.HashMap;

public class Translation {
    public static final String activityTitle = "activity_title";
    public static final String restTitle = "rest_title";
    public static final String breakTitle = "break_title";
    
    public static final String restDone = "rest_done";
    public static final String breakDone = "break_done";

    public static final String paused = "paused";

    public static final HashMap<String, DictItem> dict = new HashMap<String, DictItem>() {
        {
            put(Translation.activityTitle, new DictItem("Activity", "Активность"));
            put(Translation.restTitle, new DictItem("Rest", "Отдых"));
            put(Translation.breakTitle, new DictItem("Break", "Перерыв"));
            put(Translation.restDone, new DictItem("Rest is over", "Отдых закончен"));
            put(Translation.breakDone, new DictItem("Break is over", "Перерыв закончен"));
            put(Translation.paused, new DictItem("Paused", "На паузе"));
        }
    };

    public static String getString(String key, Lang lang) {
        DictItem dictItem = Translation.dict.get(key);

        if (dictItem == null) return "";
        return lang == Lang.Ru ? dictItem.ru : dictItem.en;
    }
}
