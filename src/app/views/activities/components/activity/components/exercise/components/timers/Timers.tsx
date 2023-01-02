import styled from 'styled-components'
import { Timer } from '@/src/app/components'
import { Typography } from 'antd'
import { SECONDS_IN_HOUR } from '@/src/app/utils/time'

const Container = styled.div`
  margin-top: ${({ $eachSide }) => $eachSide ? '' : '10px'};
  ${({ $eachSide }) => $eachSide ? `
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
  ` : ''}
`

const SideLabel = styled(Typography.Paragraph)`
  margin-bottom: 0;
`

const EachSideContainer = styled.div`
  margin-left: ${({ $right }) => $right ? '10px' : ''};
      
  ${SideLabel} {
    margin-bottom: 0;
  }

  @media (max-width: 375px) {
    & {
      width: 100%;
      margin-left: 0;
      order: ${({ $left }) => $left ? 1 : ''};
      margin-top: ${({ $left }) => $left ? '6px' : ''};  
    }
  }
`

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