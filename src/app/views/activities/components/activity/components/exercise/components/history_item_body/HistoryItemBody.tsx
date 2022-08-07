import { timeToHms } from 'app/utils/time'
import { theme } from '@/src/styles/vars'
import styled from 'styled-components'
import React from 'react'

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

const getColor = (curr, next, index, total) => {
  let color = theme.textColorSecondary
  if (next !== undefined) {
    color = curr < next
      ? theme.errorColor
      : curr > next
        ? theme.resultPositiveColor
        : theme.textColorSecondary
  }

  if (index + 1 === total) color = theme.textColorSecondary
  return color
}

const HistoryItemBody = ({ roundsData, nextRoundsData, index, total, type, hours, eachSide }) => (
  <Body>
    {type === 'count'
      ? eachSide
        ? roundsData.map((data, i) => (
          <React.Fragment key={i}>
            <Text $color={getColor(data.right, (nextRoundsData ?? [])[i].right, index, total)} $eachSide $mt="6px">
              r. {data.right || 0}
            </Text>
            <Text $color={getColor(data.left, (nextRoundsData ?? [])[i].left, index, total)} $eachSide>
              l. {data.left || 0}
            </Text>
          </React.Fragment>
        ))
        : roundsData.map((data, i) => (
          <Text key={i} $color={getColor(data, (nextRoundsData ?? [])[i], index, total)}>
            {data || 0}
          </Text>
        ))
      : eachSide
        ? roundsData.map((data, i) => (
          <React.Fragment key={i}>
            <Text key={i} $color={getColor(data.right, (nextRoundsData ?? [])[i].right, index, total)}>
              {timeToHms(data.right, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours }) || 0}
            </Text>
            <Text key={i} $color={getColor(data.left, (nextRoundsData ?? [])[i].left,  index, total)}>
              {timeToHms(data.left, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours }) || 0}
            </Text>
          </React.Fragment>
        ))
        : roundsData.map((data, i) => (
          <Text key={i} $color={getColor(data, (nextRoundsData ?? [])[i], index, total)}>
            {timeToHms(data, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours }) || 0}
          </Text>
        ))}
  </Body>
)

export default HistoryItemBody
