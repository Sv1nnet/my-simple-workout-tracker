import { theme } from 'styles/vars'
import { timeToHms } from 'app/utils/time'
import { FC } from 'react'
import { Container, Diff, Value } from './components/styled'


export interface IPreviousItem {
  comparator: {
    pos: (curr: number, next: number) => boolean,
    neg: (curr: number, next: number) => boolean,
  };
  curr: number | string;
  prev: number;
  isTimeType: boolean;
  hours: boolean;
  omitValue?: boolean;
  marginTop?: number | string;
}

const zeroEqualValues = [ null, '', '.', '.-', '-.', '-' ]

const PreviousItem: FC<IPreviousItem> = ({ omitValue, comparator, curr, prev, isTimeType, hours, marginTop }) => {
  let diff = zeroEqualValues.some(value => curr === value) ? 0 : ((+curr * 1000) - ((prev ?? +curr) * 1000)) / 1000
  const color = comparator.neg(diff, 0) ? theme.errorColor : comparator.pos(diff, 0) ? theme.resultPositiveColor : theme.textColorSecondary
  const noDiff = Math.abs(diff) === 0
  const sign = diff > 0 ? '+' : '-'
  diff = Math.abs(Math.floor(diff * 1000) / 1000)

  return (
    <Container $mt={marginTop}>
      {!omitValue && (
        <Value $color={color} $noDiff={noDiff}>
          {isTimeType
            ? timeToHms(curr, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours })
            : curr}
        </Value>
      )}
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
