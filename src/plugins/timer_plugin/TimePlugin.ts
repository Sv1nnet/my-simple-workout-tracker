import { registerPlugin, WebPlugin } from '@capacitor/core'

export interface ITimerPlugin {
  startTimer(options: { duration: number, timerId: string, label?: string, body?: string, timeOverLabel?: string, timeOverBody?: string }): Promise<void>;
  stopTimer(options: { timerId: string }): Promise<void>;
  pauseTimer(options: { timerId: string, label?: string, body?: string, timeOverLabel?: string, timeOverBody?: string }): Promise<void>;
  resumeTimer(options: { timerId: string, label?: string, body?: string, timeOverLabel?: string, timeOverBody?: string }): Promise<void>;
}

export class TimerPluginWeb extends WebPlugin implements ITimerPlugin {
  constructor() {
    super({
      name: 'TimerPlugin',
    })
  }

  async startTimer(options: { duration: number, timerId: string, label?: string, body?: string, timeOverLabel?: string, timeOverBody?: string }): Promise<void> {
    console.log('startTimer', options)
  }
  
  async stopTimer(options: { timerId: string }): Promise<void> {
    console.log('stopTimer', options)
  }

  async pauseTimer(options: { timerId: string, label?: string, body?: string, timeOverLabel?: string, timeOverBody?: string }): Promise<void> {
    console.log('pauseTimer', options)
  }

  async resumeTimer(options: { timerId: string, label?: string, body?: string, timeOverLabel?: string, timeOverBody?: string }): Promise<void> {
    console.log('resumeTimer', options)
  }
}

const TimerPlugin = registerPlugin<ITimerPlugin>('TimerService', {
  web: () => new TimerPluginWeb(),
})
export default TimerPlugin
