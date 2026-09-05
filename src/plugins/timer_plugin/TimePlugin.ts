import { registerPlugin, WebPlugin } from '@capacitor/core'

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

export class TimerPluginWeb extends WebPlugin implements ITimerPlugin {
  async startTimer(options: TimerPluginOptions & { duration: number }): Promise<void> {
    console.log('startTimer', options)
  }
  
  async stopTimer(options: { timerId: string }): Promise<void> {
    console.log('stopTimer', options)
  }

  async pauseTimer(options: TimerPluginOptions): Promise<void> {
    console.log('pauseTimer', options)
  }

  async resumeTimer(options: TimerPluginOptions): Promise<void> {
    console.log('resumeTimer', options)
  }

  async getTimer(options: { timerId: string }): Promise<GetTimerResult> {
    console.log('getTimer', options)
    return { exists: false }
  }
}

const TimerPlugin = registerPlugin<ITimerPlugin>('TimerService', {
  web: () => new TimerPluginWeb(),
})
export default TimerPlugin
