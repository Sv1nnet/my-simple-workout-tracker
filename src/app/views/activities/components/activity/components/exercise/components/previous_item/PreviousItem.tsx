import styled from 'styled-components'
import { theme } from '@/src/styles/vars'
import { timeToHms } from '@/src/app/utils/time'
import { FC } from 'react'

const Container = styled.div`
  display: flex;
  margin-top: ${({ $mt }) => $mt};
  padding-right: 8px;
`

const Value = styled.span`
  color: ${({ $color }) => $color};
  background-color: ${({ $color, $noDiff }) => $noDiff ? 'rgba(0,0,0,0.1)' : `${$color}29`};
  padding-left: 4px;
  padding-right: 4px;
`

const Diff = styled.span`
  color: ${({ $color }) => $color};
`

export interface IPreviousItem {
  comparator: {
    pos: (curr: number, next: number) => boolean,
    neg: (curr: number, next: number) => boolean,
  };
  curr: number;
  prev: number;
  isTimeType: boolean;
  hours: boolean;
  marginTop?: number | string;
}

const PreviousItem: FC<IPreviousItem> = ({ comparator, curr, prev, isTimeType, hours, marginTop }) => {
  let diff = curr - (prev ?? curr)
  const color = comparator.neg(diff, 0) ? theme.errorColor : comparator.pos(diff, 0) ? theme.resultPositiveColor : theme.textColorSecondary
  const noDiff = Math.abs(diff) === 0
  const sign = diff > 0 ? '+' : '-'
  diff = Math.abs(diff)

  return (
    <Container $mt={marginTop}>
      <Value $color={color} $noDiff={noDiff}>
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

PreviousItem.defaultProps = {
  marginTop: 0,
}

export default PreviousItem
