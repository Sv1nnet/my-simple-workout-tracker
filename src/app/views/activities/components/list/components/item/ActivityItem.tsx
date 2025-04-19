import React, { FC, useMemo, useState } from 'react'
import { Collapse, Tag } from 'antd'
import dayjs from 'dayjs'
import ExerciseDetails from '../exercise_details/ExerciseDetails'
import Rounds from '../rounds/Rounds'
import { ActivityListItem } from 'app/store/slices/activity/types'
import {
  DateOfActivity,
  Description,
  ExerciseTitle,
  Container,
  StyledCheckbox,
  StyledListItemMeta,
  StyledPanel,
  StyledTagsPanel,
  StyledText,
  StyledCollapse,
  TagsContainer,
  WorkoutTitle,
  StyledActionIcon,
} from './components/styled'
import { useToggle } from 'app/hooks'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { Swipable, SwipeActions } from 'app/components'
import { SwipableDirection } from 'app/components/swipable/Swipable'

export type ActivityItemProps = ActivityListItem & {
  exercisePayloadDictionary: any;
  activityDictionary: any;
  selectionEnabled: boolean;
  selected: boolean;
  loadingActivityId: string | null;
  loadActivity: (id: string) => void;
  listEl: HTMLElement | null;
  isLoading?: boolean;
}

const ActivityItem: FC<ActivityItemProps> = ({
  id,
  muscle_groups: _muscle_groups,
  date,
  workout_title,
  results,
  description,
  selectionEnabled,
  selected,
  activityDictionary,
  loadActivity,
  listEl,
  exercisePayloadDictionary,
}) => {
  const [ shouldEditActivity, setShouldEditActivity ] = useState(false)

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

  const handleSwipedOnMaxDistance = (
    { isOnMaxDistance, direction }: { isOnMaxDistance: boolean, direction: SwipableDirection, pointerPos: number, delta: number },
  ) => {
    setShouldEditActivity(isOnMaxDistance && direction === SwipableDirection.RIGHT)
  }

  const handleRelease = (
    { isOnMaxDistance, direction }: { isOnMaxDistance: boolean, direction: SwipableDirection, pointerPos: number, delta: number },
  ) => {
    if (isOnMaxDistance && direction === SwipableDirection.RIGHT) {
      loadActivity(id)
    }
  }

  return (
    <Container>
      <SwipeActions
        leftAction={
          <SwipeActions.Left
            isActive={shouldEditActivity}
            icon={<StyledActionIcon />}
          />
        }
      />
      <Swipable
        direction={selectionEnabled ? SwipableDirection.NONE : SwipableDirection.RIGHT}
        maxDistance={90}
        onMaxDistance={handleSwipedOnMaxDistance}
        onRelease={handleRelease}
        scrollableContainer={listEl}
      >
        <StyledCollapse
          ghost
          onChange={handleCollapse}
          expandIconPosition="start"
          collapsible={selectionEnabled ? 'disabled' : undefined}
        >
          <StyledPanel key="exercises" className="panel-header" header={(
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
        </StyledCollapse>
        {selectionEnabled && <StyledCheckbox checked={selected} />}
        {description && <Description>{description}</Description>}
      </Swipable>
    </Container>
  )
}

export default ActivityItem
