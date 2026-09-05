import { TimerPlugin } from 'src/plugins'
import { timerSessions } from 'app/components/timer/timerSessions'

/** Timer ids used by rest Timers for a given exercise */
export const getExerciseRestTimerIds = (exerciseId: string) => [
  `${exerciseId}_rest`,
  `${exerciseId}_rest_left`,
  `${exerciseId}_rest_right`,
]

/** Stops native + in-memory rest timers for one exercise (e.g. Done checkbox). */
export const stopExerciseRestTimers = async (exerciseId: string) => {
  await Promise.all(
    getExerciseRestTimerIds(exerciseId).map(async (timerId) => {
      timerSessions.remove(timerId)
      try {
        await TimerPlugin.stopTimer({ timerId })
      } catch (error) {
        console.error('Failed to stop rest timer', timerId, error)
      }
    }),
  )
}
