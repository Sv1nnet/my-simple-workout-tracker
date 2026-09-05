import { millisecondsToTimeArray } from 'app/utils/time'

export type TimerSession = {
  timerId: string
  duration: number
  /** Wall-clock end time while running */
  endAt?: number
  /** Remaining ms while paused */
  remainingMs?: number
  isRunning: boolean
  isPaused: boolean
}

const sessions = new Map<string, TimerSession>()

export const timerSessions = {
  get(timerId: string): TimerSession | undefined {
    return sessions.get(timerId)
  },

  set(session: TimerSession) {
    sessions.set(session.timerId, session)
  },

  remove(timerId: string) {
    sessions.delete(timerId)
  },

  /** Current remaining ms from session, or null if no active session */
  getRemainingMs(timerId: string): number | null {
    const session = sessions.get(timerId)
    if (!session) return null
    if (session.isPaused) {
      return Math.max(0, session.remainingMs ?? 0)
    }
    if (session.isRunning && session.endAt != null) {
      return Math.max(0, session.endAt - Date.now())
    }
    return null
  },

  markRunning(timerId: string, duration: number, remainingMs: number) {
    sessions.set(timerId, {
      timerId,
      duration,
      endAt: Date.now() + Math.max(0, remainingMs),
      isRunning: true,
      isPaused: false,
    })
  },

  markPaused(timerId: string, duration: number, remainingMs: number) {
    sessions.set(timerId, {
      timerId,
      duration,
      remainingMs: Math.max(0, remainingMs),
      isRunning: false,
      isPaused: true,
    })
  },

  toTimeValue(remainingMs: number) {
    return millisecondsToTimeArray(Math.max(0, remainingMs))
  },
}
