import { registerPlugin } from '@capacitor/core'

export type Activity = {
  id: string;
  title: string;
  startTime: number;
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
}

export interface IActivityPlugin {
  start(options: { id: string, title: string, startTime: number }): Promise<void>;
  stop(options: { id: string }): Promise<void>;
}

const ActivityPlugin = registerPlugin<IActivityPlugin>('ActivityService')
export default ActivityPlugin
