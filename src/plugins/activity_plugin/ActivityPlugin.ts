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
  startActivity(options: { id: string, title: string, startTime?: number, elapsedMs?: number, content?: string  }): Promise<void>;
  stopActivity(options: { id: string, content?: string  }): Promise<void>;
  pauseActivity(options: { id: string, elapsedMs?: number, content?: string  }): Promise<void>;
  resumeActivity(options: { id: string, resumeTime?: number, content?: string  }): Promise<void>;

  startDurationSet(options: { id: string, title: string, startTime: number, content?: string }): Promise<void>;
  stopDurationSet(options: { id: string, content?: string  }): Promise<void>;
  pauseDurationSet(options: { id: string, content?: string  }): Promise<void>;
  resumeDurationSet(options: { id: string, content?: string  }): Promise<void>;

  startSpeedSet(options: { id: string, title: string, startTime: number, content?: string  }): Promise<void>;
  stopSpeedSet(options: { id: string, content?: string  }): Promise<void>;
  pauseSpeedSet(options: { id: string, content?: string  }): Promise<void>;
  resumeSpeedSet(options: { id: string, content?: string  }): Promise<void>;

  startRest(options: { id: string, title: string, duration: number, content?: string  }): Promise<void>;
  stopRest(options: { id: string, content?: string  }): Promise<void>;
  pauseRest(options: { id: string, content?: string  }): Promise<void>;
  resumeRest(options: { id: string, content?: string  }): Promise<void>;

  startBreak(options: { id: string, title: string, duration: number, content?: string  }): Promise<void>;
  stopBreak(options: { id: string, content?: string  }): Promise<void>;
  pauseBreak(options: { id: string, content?: string  }): Promise<void>;
  resumeBreak(options: { id: string, content?: string  }): Promise<void>;
}

const ActivityPlugin = registerPlugin<IActivityPlugin>('ActivityService')
export default ActivityPlugin
