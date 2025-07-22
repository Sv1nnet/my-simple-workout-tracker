import { timeToHms } from 'app/utils/time'
import React, { FC } from 'react'
import { EachSideRound, Round } from 'app/store/slices/activity/types'
import { Body, Text } from './components/styled'
import { ThemeContextType, useThemeContext } from 'app/contexts/theme/ThemeContextProvider'

const getColor = (
  curr: number,
  next: number,
  index: number,
  total: number,
  theme: ThemeContextType,
  comparator = {
    pos: (_curr, _next) => _curr > _next,
    neg: (_curr, _next) => _curr < _next,
  },
) => {
  let color = theme.styles.textColorSecondary
  if (next !== undefined) {
    color = comparator.neg(curr, next)
      ? theme.styles.errorColor
      : comparator.pos(curr, next)
        ? theme.styles.resultPositiveColor
        : theme.styles.textColorSecondary
  }

  if (index + 1 === total) color = theme.styles.textColorSecondary
  return color
}

export interface IHistoryItemBody {
  roundsData: Round[];
  nextRoundsData: Round[];
  index: number;
  total: number;
  sideLabels: {
    right: {
      short: string,
    },
    left: {
      short: string,
    },
  };
  isTimeType: boolean;
  comparator: {
    pos: (curr: number, next: number) => boolean,
    neg: (curr: number, next: number) => boolean,
  };
  hours?: boolean;
  eachSide?: boolean;
}

const HistoryItemBody: FC<IHistoryItemBody> = ({ roundsData, nextRoundsData, index, total, hours, eachSide, sideLabels, isTimeType, comparator }) => {
  const theme = useThemeContext()

  return (
    <Body>
      {!isTimeType
        ? eachSide
          ? roundsData.map((data: EachSideRound<number>, i) => (
            <React.Fragment key={i}>
              <Text $color={getColor(data.right, (nextRoundsData as unknown as EachSideRound<number> ?? [])[i]?.right, index, total, theme, comparator)} $eachSide $mt="6px">
                <Text.Side>{sideLabels.right.short}.</Text.Side> <Text.Result>{data.right || 0}</Text.Result>
              </Text>
              <Text $color={getColor(data.left, (nextRoundsData as unknown as EachSideRound<number> ?? [])[i]?.left, index, total, theme, comparator)} $eachSide>
                <Text.Side>{sideLabels.left.short}.</Text.Side> <Text.Result>{data.left || 0}</Text.Result>
              </Text>
            </React.Fragment>
          ))
          : roundsData.map((data: number, i) => (
            <Text key={i} $color={getColor(data, (nextRoundsData as unknown as number ?? [])[i], index, total, theme, comparator)}>
              {data || 0}
            </Text>
          ))
        : eachSide
          ? roundsData.map((data: EachSideRound<number>, i) => (
            <React.Fragment key={i}>
              <Text $isTimeType $color={getColor(data.right, (nextRoundsData as unknown as EachSideRound<number> ?? [])[i]?.right, index, total, theme, comparator)} $eachSide $mt="6px">
                <Text.Side>{sideLabels.right.short}.</Text.Side> <Text.Result>{timeToHms(data.right, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours }) || 0}</Text.Result>
              </Text>
              <Text $isTimeType $color={getColor(data.left, (nextRoundsData as unknown as EachSideRound<number> ?? [])[i]?.left,  index, total, theme, comparator)} $eachSide>
                <Text.Side>{sideLabels.left.short}.</Text.Side> <Text.Result>{timeToHms(data.left, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours }) || 0}</Text.Result>
              </Text>
            </React.Fragment>
          ))
          : roundsData.map((data: number, i) => (
            <Text key={i} $color={getColor(data, (nextRoundsData as unknown as number ?? [])[i], index, total, theme, comparator)}>
              {timeToHms(data, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours }) || 0}
            </Text>
          ))}
    </Body>
  )
}

export default HistoryItemBody
