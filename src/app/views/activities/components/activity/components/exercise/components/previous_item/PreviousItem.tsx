import styled from 'styled-components'
import { theme } from '@/src/styles/vars'
import { timeToHms } from '@/src/app/utils/time'

const Container = styled.div`
  display: flex;
  &:not(:last-of-type) {
    min-width: 65px;
    /* padding-right: 2px; */
    /* border-right: 2px solid lightgrey; */
  }
`

const Value = styled.span`
  color: ${({ $color }) => $color};
  background-color: ${({ $color }) => `${$color}29`};
  padding-left: 4px;
  padding-right: 4px;
`

const Diff = styled.span`
  color: ${({ $color }) => $color};
`

const PreviousItem = ({ curr, prev, isTimeType, hours }) => {
  let diff = curr - (prev ?? curr)
  const color = diff < 0 ? theme.errorColor : diff > 0 ? theme.resultPositiveColor : theme.textColorSecondary
  const sign = diff > 0 ? '+' : '-'
  diff = Math.abs(diff)

  return (
    <Container>
      <Value $color={color}>
        {isTimeType
          ? timeToHms(curr, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours })
          : curr}
      </Value>
      <Diff $color={color}>
        &nbsp;{diff !== 0 ? sign : ''}{
          isTimeType
            ? timeToHms(diff, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours })
            : diff}
      </Diff>
    </Container>
  )
}

export default PreviousItem
