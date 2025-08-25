package com.mswt.app;

public class DictItem {
    public String en = null;
    public String ru = null;

    DictItem(String en, String ru) {
        this.en = en;
        this.ru = ru;
    }

    public String get(Lang lang) throws Exception {
        if (lang == Lang.En) return this.en;
        if (lang == Lang.Ru) return this.ru;

        throw new Exception("No supported language provided");
    }
}
