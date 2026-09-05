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

export type TimerType = 'rest' | 'break'

export type TimerPluginOptions = {
  duration?: number
  timerId: string
  label?: string
  body?: string
  timeOverLabel?: string
  timeOverBody?: string
  type?: TimerType
  groupId?: string
  exerciseTitle?: string
  side?: 'left' | 'right' | ''
  sideLabel?: string
}

export type GetTimerResult = {
  exists: boolean
  remainingMs?: number
  isPaused?: boolean
  type?: string
  groupId?: string
  exerciseTitle?: string
  side?: string
  sideLabel?: string
}

export interface ITimerPlugin {
  startTimer(options: TimerPluginOptions & { duration: number }): Promise<void>;
  stopTimer(options: { timerId: string }): Promise<void>;
  pauseTimer(options: TimerPluginOptions): Promise<void>;
  resumeTimer(options: TimerPluginOptions): Promise<void>;
  getTimer(options: { timerId: string }): Promise<GetTimerResult>;
}

export interface ISettingsPlugin {
  initSettings(options: { isVibration: boolean, isSound: boolean }): Promise<void>;
  getSettings(): Promise<{ isVibration: boolean, isSound: boolean }>;
  setSettings(options: { isVibration: boolean, isSound: boolean }): Promise<void>;
}

export type Tag = { label: string, value: string, key: string, disabled?: boolean, title?: string }
