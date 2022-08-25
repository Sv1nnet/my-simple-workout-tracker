import { timeToHms } from 'app/utils/time'
import { theme } from '@/src/styles/vars'
import styled from 'styled-components'
import React, { FC } from 'react'
import { EachSideRound, Round } from '@/src/app/store/slices/activity/types'

export const Body = styled.div`
  overflow-y: scroll;
  border-right: 1px solid lightgrey;
  border-left: none;
  height: 100%;
`

const Text = styled.p`
  margin: 0;
  color: ${({ $color }) => $color};
  margin-top: ${({ $mt }) => $mt};
  ${({ $eachSide }) => $eachSide ? 'line-height: 1;' : ''}
`

const getColor = (
  curr: number,
  next: number,
  index: number,
  total: number,
  comparator = {
    pos: (_curr, _next) => _curr > _next,
    neg: (_curr, _next) => _curr < _next,
  },
) => {
  let color = theme.textColorSecondary
  if (next !== undefined) {
    color = comparator.neg(curr, next)
      ? theme.errorColor
      : comparator.pos(curr, next)
        ? theme.resultPositiveColor
        : theme.textColorSecondary
  }

  if (index + 1 === total) color = theme.textColorSecondary
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

const HistoryItemBody: FC<IHistoryItemBody> = ({ roundsData, nextRoundsData, index, total, hours, eachSide, sideLabels, isTimeType, comparator }) => (
  <Body>
    {!isTimeType
      ? eachSide
        ? roundsData.map((data: EachSideRound<number>, i) => (
          <React.Fragment key={i}>
            <Text $color={getColor(data.right, (nextRoundsData as unknown as EachSideRound<number> ?? [])[i]?.right, index, total, comparator)} $eachSide $mt="6px">
              {sideLabels.right.short}. {data.right || 0}
            </Text>
            <Text $color={getColor(data.left, (nextRoundsData as unknown as EachSideRound<number> ?? [])[i]?.left, index, total, comparator)} $eachSide>
              {sideLabels.left.short}. {data.left || 0}
            </Text>
          </React.Fragment>
        ))
        : roundsData.map((data: number, i) => (
          <Text key={i} $color={getColor(data, (nextRoundsData as unknown as number ?? [])[i], index, total, comparator)}>
            {data || 0}
          </Text>
        ))
      : eachSide
        ? roundsData.map((data: EachSideRound<number>, i) => (
          <React.Fragment key={i}>
            <Text key={i} $color={getColor(data.right, (nextRoundsData as unknown as EachSideRound<number> ?? [])[i]?.right, index, total, comparator)} $eachSide $mt="6px">
              {sideLabels.right.short}. {timeToHms(data.right, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours }) || 0}
            </Text>
            <Text key={i} $color={getColor(data.left, (nextRoundsData as unknown as EachSideRound<number> ?? [])[i]?.left,  index, total, comparator)} $eachSide>
              {sideLabels.left.short}. {timeToHms(data.left, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours }) || 0}
            </Text>
          </React.Fragment>
        ))
        : roundsData.map((data: number, i) => (
          <Text key={i} $color={getColor(data, (nextRoundsData as unknown as number ?? [])[i], index, total, comparator)}>
            {timeToHms(data, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours }) || 0}
          </Text>
        ))}
  </Body>
)

export default HistoryItemBody
