import React, { FC, useMemo } from 'react'
import { Collapse, Tag } from 'antd'
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
  StyledTagsPanel,
  StyledText,
  TagsContainer,
  WorkoutTitle,
} from './components/styled'
import { useToggle } from 'app/hooks'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

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
  muscle_groups: _muscle_groups,
  date,
  workout_title,
  results,
  description,
  selectionEnabled,
  selected,
  activityDictionary,
  loadActivity,
  exercisePayloadDictionary,
}) => {
  const { intl } = useIntlContext()
  const { state: isOpen, setState: setIsOpen } = useToggle(false)

  const muscleGroups = useMemo(
    () => (_muscle_groups || []).map(
      muscleGroup => muscleGroup.archived ? {
        ...muscleGroup,
        title: `${muscleGroup.title} (${intl.rest?.muscle_group?.state?.archived})`,
      } : muscleGroup,
    ),
    [ _muscle_groups ],
  )

  const handleCollapse = (activeKeys: string[]) => {
    setIsOpen(!!activeKeys.length)
  }

  return (
    <>
      <Collapse
        ghost
        onChange={handleCollapse}
        style={{ width: '100%' }}
        expandIconPosition="start"
        collapsible={selectionEnabled ? 'disabled' : undefined}
      >
        <StyledPanel key="exercises" header={(
          <HeaderContainer>
            <div>
              <Collapse ghost activeKey={!isOpen ? 'muscleGroups' : undefined}>
                <StyledTagsPanel key='muscleGroups' header={null}>
                  <TagsContainer $isInTitle>
                    {muscleGroups.map(muscleGroup => (
                      <Tag key={muscleGroup?.id}>{muscleGroup?.title}</Tag>
                    ))}
                  </TagsContainer>
                </StyledTagsPanel>
              </Collapse>
              <DateOfActivity>{dayjs(date).format('DD.MM.YYYY')}</DateOfActivity>
              <WorkoutTitle level={3}>{workout_title}</WorkoutTitle>
            </div>
            <InspectButton onClick={loadActivity} loading={loadingActivityId === id || isLoading} id={id} href={`/activities/${id}`} />
          </HeaderContainer>
        )}>
          {/* render every exercise */}
          {results.map(({
            exercise_title,
            muscle_groups,
            rounds,
            type,
            hours,
            note,
            details,
            id_in_workout,
          }) => (
            <React.Fragment key={id_in_workout}>
              {!!muscle_groups?.length && (
                <TagsContainer>
                  {muscle_groups?.map(muscleGroup => (
                    <Tag key={muscleGroup?.id}>{muscleGroup?.archived ? `${muscleGroup?.title} (${intl.rest?.muscle_group?.state?.archived})` : muscleGroup?.title}</Tag>
                  ))}
                </TagsContainer>
              )}
              <StyledListItemMeta
                key={id_in_workout}
                title={(
                  <div style={{ marginTop: !!muscle_groups?.length ? 0 : 2 }}>
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
            </React.Fragment>
          ))}
        </StyledPanel>
      </Collapse>
      {selectionEnabled && <StyledCheckbox checked={selected} />}
      {description && <Description>{description}</Description>}
    </>
  )
}

export default ActivityItem
