import { FC } from 'react'
import { Collapse } from 'antd'
import dayjs from 'dayjs'
import ExerciseDetails from '../exercise_details/ExerciseDetails'
import Rounds from '../rounds/Rounds'
import { ActivityListItem } from 'app/store/slices/activity/types'
import { InspectButton } from 'app/components/list_buttons'
import {
  DateOfActivity,
  Description,
  ExerciseTitle,
  HeaderContainer,
  StyledCheckbox,
  StyledListItemMeta,
  StyledPanel,
  StyledText,
  WorkoutTitle,
} from './components/styled'

export type ActivityItemProps = ActivityListItem & {
  exercisePayloadDictionary: any;
  activityDictionary: any;
  selectionEnabled: boolean;
  selected: boolean;
  loadingActivityId: string | null;
  loadActivity: (id: string) => void;
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
  loadActivity,
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
          <InspectButton onClick={loadActivity} loading={loadingActivityId === id || isLoading} id={id} href={`/activities/${id}`} />
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
