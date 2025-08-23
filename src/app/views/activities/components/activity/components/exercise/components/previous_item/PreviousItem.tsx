import { timeToHms } from 'app/utils/time'
import { FC } from 'react'
import { Container, Diff, Value } from './components/styled'
import { useThemeContext } from 'app/contexts/theme/ThemeContextProvider'
import { isNumber } from 'app/utils/typeCheckers'


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

const zeroEqualValues = [ undefined, null, '', '.', '.-', '-.', '-' ]

const PreviousItem: FC<IPreviousItem> = ({ omitValue, comparator, curr, prev, isTimeType, hours, marginTop }) => {
  const theme = useThemeContext()

  let diff = zeroEqualValues.some(value => curr === value) ? 0 : ((+curr * 1000) - ((prev ?? +curr) * 1000)) / 1000
  const color = comparator.neg(diff, 0) ? theme.styles.errorColor : comparator.pos(diff, 0) ? theme.styles.resultPositiveColor : theme.styles.textColorSecondary
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
      {isNumber(prev) && (
        <Diff $color={color}>
        &nbsp;{diff !== 0 ? sign : ''}{
            isTimeType
              ? timeToHms(diff, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours })
              : diff}
        </Diff>
      )}
    </Container>
  )
}

PreviousItem.defaultProps = {
  marginTop: 0,
}

export default PreviousItem
