import { registerPlugin } from '@capacitor/core'

export interface TimerServicePlugin {
  startTimer(options: { duration: number, timerId: string, label?: string, body?: string, timeOverLabel?: string, timeOverBody?: string }): Promise<void>;
  stopTimer(options: { timerId: string }): Promise<void>;
  pauseTimer(options: { timerId: string, label?: string, body?: string, timeOverLabel?: string, timeOverBody?: string }): Promise<void>;
  resumeTimer(options: { timerId: string, label?: string, body?: string, timeOverLabel?: string, timeOverBody?: string }): Promise<void>;
}

const TimerService = registerPlugin<TimerServicePlugin>('TimerService')
export default TimerService
