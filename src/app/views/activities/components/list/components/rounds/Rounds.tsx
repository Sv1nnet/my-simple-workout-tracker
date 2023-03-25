import styled from 'styled-components'
import { isExerciseTimeType, timeToHms } from '@/src/app/utils/time'
import { Typography } from 'antd'
import { StyledText } from '../item/ActivityItem'

const RoundsUl = styled.ul`
  margin: 0;
  padding: 0;

  li {
    display: inline-block;
    margin-right: 5px;
    padding-right: 5px;
    border-right: 2px solid lightgrey;
    list-style: none;
  }
`
const SideRoundsContainer = styled.div`
  display: flex;
  align-items: center;
`

const RoundCount = styled(Typography.Text)`
  color: #a5a3a3;
`

const Rounds = ({ rounds, type, hours, activityDictionary }) => (
  <RoundsUl>
    {rounds.map((round, i) => (
      <li key={i}>
        {typeof round === 'number' || typeof round === 'string'
          ? isExerciseTimeType(type)
            ? (
              <Typography.Text>
                <RoundCount>{i + 1}:</RoundCount> {timeToHms(round, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours })}
              </Typography.Text>
            )
            : <Typography.Text><RoundCount>{i + 1}:</RoundCount> {round}</Typography.Text>
          : isExerciseTimeType(type)
            ? (
              <SideRoundsContainer>
                <Typography.Text style={{ marginRight: 5 }}>
                  <RoundCount>{i + 1}</RoundCount>.
                </Typography.Text>
                <div>
                  <StyledText>{activityDictionary.side_labels.right.short}: {timeToHms(round.right, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours })}</StyledText>
                  <StyledText>{activityDictionary.side_labels.left.short}: {timeToHms(round.left, { hms: ':', zeroIncluded: true, leadingZero: true, cutHours: !hours })}</StyledText>
                </div>
              </SideRoundsContainer>
            )
            : (
              <SideRoundsContainer>
                <Typography.Text style={{ marginRight: 5 }}>
                  <RoundCount>{i + 1}.</RoundCount>
                </Typography.Text>
                <div>
                  <StyledText>{activityDictionary.side_labels.right.short}: {round.right}</StyledText>
                  <StyledText>{activityDictionary.side_labels.left.short}: {round.left}</StyledText>
                </div>
              </SideRoundsContainer>
            )}
      </li>
    ))}
  </RoundsUl>
)

export default Rounds