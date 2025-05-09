export {}

declare const __ENVIRONMENT__: 'ios' | 'android' | 'web'

declare global {
  interface Window {
    opera: string;
  }
}

declare module '@capacitor/core' {
  interface PluginRegistry {
    TimerService: TimerServicePlugin;
  }
}

export interface TimerServicePlugin {
  startTimer(options: { duration: number }): Promise<void>;
  stopTimer(): Promise<void>;
}

export type Tag = { label: string, value: string, key: string, disabled?: boolean, title?: string }
