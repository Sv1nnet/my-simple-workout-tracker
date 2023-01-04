import { Timer } from '@/src/app/components'
import { SECONDS_IN_HOUR } from '@/src/app/utils/time'
import { Container, EachSideContainer, SideLabel } from './components/styled'

const Timers = ({ eachSide, durationInSeconds, sideLabels }) => {
  const hoursOn = (durationInSeconds / SECONDS_IN_HOUR) >= 1
  const duration = durationInSeconds * 1000

  return eachSide
    ? (
      <Container $eachSide>
        <EachSideContainer $left>
          <SideLabel type="secondary">{sideLabels.left}</SideLabel>
          <Timer hoursOn={hoursOn} resetButton duration={duration} buttonProps={{ size: 'middle' }} />
        </EachSideContainer>
        <EachSideContainer $right>
          <SideLabel type="secondary">{sideLabels.right}</SideLabel>
          <Timer hoursOn={hoursOn} resetButton duration={duration} buttonProps={{ size: 'middle' }} />
        </EachSideContainer>
      </Container>
    )
    : (
      <Container>
        <Timer hoursOn={hoursOn} resetButton duration={duration} buttonProps={{ size: 'middle' }} />
      </Container>
    )
}

export default Timers