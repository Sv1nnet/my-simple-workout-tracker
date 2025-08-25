export {}

declare const __ENVIRONMENT__: 'ios' | 'android' | 'web'

declare global {
  interface Window {
    opera: string;
  }
}

declare module '@capacitor/core' {
  interface PluginRegistry {
    TimerService: ITimerPlugin;
    SettingsPlugin: ISettingsPlugin;
  }
}

export interface ITimerPlugin {
  startTimer(options: { duration: number, timerId: string, label?: string, body?: string, timeOverLabel?: string, timeOverBody?: string }): Promise<void>;
  stopTimer(options: { timerId: string }): Promise<void>;
  pauseTimer(options: { timerId: string, label?: string, body?: string, timeOverLabel?: string, timeOverBody?: string }): Promise<void>;
  resumeTimer(options: { timerId: string, label?: string, body?: string, timeOverLabel?: string, timeOverBody?: string }): Promise<void>;
}

export interface ISettingsPlugin {
  initSettings(options: { isVibration: boolean, isSound: boolean }): Promise<void>;
  getSettings(): Promise<{ isVibration: boolean, isSound: boolean }>;
  setSettings(options: { isVibration: boolean, isSound: boolean }): Promise<void>;
}

export type Tag = { label: string, value: string, key: string, disabled?: boolean, title?: string }
