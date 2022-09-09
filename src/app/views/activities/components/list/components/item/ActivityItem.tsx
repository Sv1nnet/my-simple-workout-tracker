import React, { FC } from 'react'
import { Collapse, Checkbox, List, Typography } from 'antd'
import styled from 'styled-components'
import dayjs from 'dayjs'
import ExerciseDetails from '../exercise_details/ExerciseDetails'
import Rounds from '../rounds/Rounds'
import { ActivityListItem } from '@/src/app/store/slices/activity/types'
import { InspectButton } from '@/src/app/components/list_buttons'

const { Panel } = Collapse
const { Title, Text } = Typography

const StyledCheckbox = styled(Checkbox)`
  position: absolute;
  top: 25px;
  left: 16px;
  z-index: 1;
`

const StyledPanel = styled(Panel)`
  &.ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    padding: 0 0 0 32px;
  }

  &.ant-collapse-item > .ant-collapse-header {
    padding: 0;
    padding-left: 7px;

    & .ant-collapse-arrow {
      vertical-align: -16px;
    }
  }
`

const DateOfActivity = styled(Text)`
  display: block;
  line-height: 1;
`

const WorkoutTitle = styled(Title)`
  text-align: left !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  line-height: 1 !important;
`

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`

const ExerciseTitle = styled(Text)`
  margin-bottom: 0;
  font-size: 18px;
`

const StyledListItemMeta = styled(List.Item.Meta)`
  flex-basis: 100%;
  margin-top: 6px;
  margin-bottom: 6px;
`

const Description = styled(Typography.Text)`
  margin-top: 6px;
  padding-left: 32px;
  display: inline-block;
`

export const StyledText = styled(Typography.Text)`
  display: block;
  line-height: 1;
`


export type ActivityItemProps = ActivityListItem & {
  exercisePayloadDictionary: any;
  activityDictionary: any;
  selectionEnabled: boolean;
  selected: boolean;
  loadingActivityId: string | null;
  isLoading?: boolean;
}

const ActivityItem: FC<ActivityItemProps> = ({
  id,
  loadingActivityId,
  isLoading,
  date,
  workout_title,
  results,
  description,
  selectionEnabled,
  selected,
  activityDictionary,
  exercisePayloadDictionary,
}) => (
  <>
    <Collapse style={{ width: '100%' }} ghost expandIconPosition="left" collapsible={selectionEnabled ? 'disabled' : undefined}>
      <StyledPanel key="exercises" header={(
        <HeaderContainer>
          <div>
            <DateOfActivity>{dayjs(date).format('DD.MM.YYYY')}</DateOfActivity>
            <WorkoutTitle level={3}>{workout_title}</WorkoutTitle>
          </div>
          <InspectButton loading={loadingActivityId === id || isLoading} href={`/activities/${id}`} />
        </HeaderContainer>
      )}>
        {/* render every exercise */}
        {results.map(({
          exercise_title,
          rounds,
          type,
          hours,
          note,
          details,
          id_in_workout,
        }) => (
          <StyledListItemMeta
            key={id_in_workout}
            title={(
              <div>
                <ExerciseTitle>{exercise_title}</ExerciseTitle>
                <ExerciseDetails {...details} payloadDictionary={exercisePayloadDictionary} />
              </div>
            )}
            description={(
              <div>
                <Rounds rounds={rounds} type={type} hours={hours} activityDictionary={activityDictionary} />
                {note && (
                  <div style={{ marginTop: 8 }}>
                    <StyledText type="secondary">{activityDictionary.input_labels.note}: </StyledText>
                    <StyledText type="secondary">{note}</StyledText>
                  </div>
                )}
              </div>
            )}
          />
        ))}
      </StyledPanel>
    </Collapse>
    {selectionEnabled && <StyledCheckbox checked={selected} />}
    {description && <Description>{description}</Description>}
  </>
)

export default ActivityItem
