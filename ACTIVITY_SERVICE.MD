# About
This is a service that should work in background and be prevented from being stopped
by Android until user stop it's working. Notification about running service should be not able to be closed by swipe, the only way to close it is stop time/stopwatch of activity/rest/break/etc. The service has to show a user information about:

1) Current activity title and how long time passed since start; time passed should update every second; it should look like:
```
Activity: {ActivityTitle} hh:mm:ss
```

2) If user starts rest timer the timer should look like:
```
Rest: hh:mm:ss
{OptionalContent - user can pass it from client side of the app by capacitor API}
```
or if rest less then an hour
```
Rest: mm:ss
{OptionalContent - user can pass it from client side of the app by capacitor API}
```
The rest might be 2 types: simple or for each side (like for every arm). So if the rest is for each side
then for every side there should be separated not closable notification:
```
Rest {Left or Right}: hh:mm:ss
{OptionalContent - user can pass it from client side of the app by capacitor API}
```

3) If user starts break timer the timer should look like:
```
Break: hh:mm:ss
{OptionalContent - user can pass it from client side of the app by capacitor API}
```
There might be also multiple breaks, so for each break should be separated not closable notification;

## Rest and Break timers
Rest and break timers should send notification once time over. It should vibrate and play sound according settings user specified. Settings are stored in MainActivity.

## Client API
API that will be used by user is described in /Users/leonidcukanov/Documents/Code/my-simple-workout-tracker/src/plugins/activity_plugin/ActivityPlugin.ts
