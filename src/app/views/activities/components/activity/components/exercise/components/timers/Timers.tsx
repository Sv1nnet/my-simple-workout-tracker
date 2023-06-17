import { Timer } from 'app/components'
import { SECONDS_IN_HOUR } from 'app/utils/time'
import { Container, EachSideContainer, SideLabel } from './components/styled'
import { useState } from 'react'

enum Side {
  NON_SIDE = 0,
  LEFT = 0,
  RIGHT = 1,
}

const Timers = ({ eachSide, durationInSeconds, totalRounds, sideLabels, onTimeOver, timerDictionary }) => {
  const [ currentRound, setCurrentRound ] = useState(() => eachSide ? [ 1, 1 ] : [ 1 ])
  const [ finishedRounds, setFinishedRounds ] = useState({})
  const hoursOn = (durationInSeconds / SECONDS_IN_HOUR) >= 1
  const duration = durationInSeconds * 1000

  const getNotificationBody = (side?: Side) => currentRound[side] < totalRounds
    ? `${timerDictionary.round_break.message} ${currentRound[side] + 1}.`
    : timerDictionary.round_break.no_more_rounds

  const handleTimeOver = (side?: Side) => (...args) => {
    if (currentRound[side] < totalRounds) {
      const newFinishedRounds = eachSide
        ? {
          ...finishedRounds,
          [currentRound[side]]: {
            ...(finishedRounds[currentRound[side]] || {}),
            [side]: true,
          },
        }
        : {
          ...finishedRounds,
          [currentRound[Side.NON_SIDE]]: true,
        }
      setFinishedRounds(newFinishedRounds)
  
      if (eachSide) {
        if (newFinishedRounds[currentRound[side]]) {
          const newCurrentRound = [ ...currentRound ]
          newCurrentRound[side] += 1
          setCurrentRound(newCurrentRound)
        }
        onTimeOver(...args)
        return
      }

      if (newFinishedRounds[currentRound[Side.NON_SIDE]]) setCurrentRound([ currentRound[Side.NON_SIDE] + 1 ])
    }

    onTimeOver(...args)
  }

  return eachSide
    ? (
      <Container $eachSide>
        <EachSideContainer $left>
          <SideLabel type="secondary">{sideLabels.left}</SideLabel>
          <Timer
            resetButton
            onTimeOver={handleTimeOver(Side.LEFT)}
            notificationTitle={`(${timerDictionary.side.left}) ${timerDictionary.round_break.title}`}
            notificationOptions={{
              tag: 'break_timer_left',
              body: getNotificationBody(Side.LEFT),
              renotify: true,
            }}
            hoursOn={hoursOn}
            duration={duration}
            buttonProps={{ size: 'middle' }}
          />
        </EachSideContainer>
        <EachSideContainer $right>
          <SideLabel type="secondary">{sideLabels.right}</SideLabel>
          <Timer
            resetButton
            onTimeOver={handleTimeOver(Side.RIGHT)}
            notificationTitle={`(${timerDictionary.side.right}) ${timerDictionary.round_break.title}`}
            notificationOptions={{
              tag: 'break_timer_right',
              body: getNotificationBody(Side.RIGHT),
              renotify: true,
            }}
            hoursOn={hoursOn}
            duration={duration}
            buttonProps={{ size: 'middle' }}
          />
        </EachSideContainer>
      </Container>
    )
    : (
      <Container>
        <Timer
          resetButton
          onTimeOver={handleTimeOver(Side.NON_SIDE)}
          notificationTitle={timerDictionary.round_break.title}
          notificationOptions={{
            tag: 'break_timer',
            body: getNotificationBody(Side.NON_SIDE),
            renotify: true,
          }}
          hoursOn={hoursOn}
          duration={duration}
          buttonProps={{ size: 'middle' }}
        />
      </Container>
    )
}

export default Timers