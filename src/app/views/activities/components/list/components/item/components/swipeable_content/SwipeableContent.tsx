import React, { useEffect } from 'react'
import { Collapse, Tag } from 'antd'
import dayjs from 'dayjs'
import {
  ExerciseDetails,
  Rounds,
  DateOfActivity,
  Description,
  ExerciseTitle,
  StyledCheckbox,
  StyledListItemMeta,
  StyledPanel,
  StyledTagsPanel,
  StyledText,
  StyledCollapse,
  TagsContainer,
  WorkoutTitle,
} from './components'
import { SwipeableDirection, useSwipeableContext } from 'app/components/swipeable/Swipeable'
import { ActivityListItem } from 'app/store/slices/activity/types'
import { DescriptionProps } from 'app/views/workouts/components/list/components/item/components'
import { selectSettings } from 'app/store/slices/settings'
import { useAppSelector } from 'app/hooks'
import { toLbs } from 'app/utils/massUnits'

export type SwipeableContentProps = {
  isSelectionEnabled: boolean;
  isSelected: boolean;
  description: string;
  muscleGroups: ActivityListItem['muscle_groups'];
  isOpen: boolean;
  setIsSelectionDisabled: (shouldDisable: boolean) => void;
  onCollapse: (activeKeys: string[]) => void;
  selected: boolean;
  date: string;
  workout_title: string;
  results: ActivityListItem['results'];
  exercisePayloadDictionary: DescriptionProps['payloadDictionary'];
  activityDictionary: DescriptionProps['workoutDictionary'];
  intl: Record<string, any>;
}

const SwipeableContent = ({
  isSelectionEnabled,
  description,
  muscleGroups,
  isOpen,
  setIsSelectionDisabled,
  onCollapse,
  selected,
  date,
  workout_title,
  results,
  exercisePayloadDictionary,
  activityDictionary,
  intl,
}) => {
  const { units } = useAppSelector(selectSettings)
  const { isSwiping, direction } = useSwipeableContext()

  useEffect(() => {
    setIsSelectionDisabled(direction !== SwipeableDirection.NONE || isSwiping)
  }, [ isSwiping, direction ])

  return (
    <>
      <StyledCollapse
        ghost
        onChange={onCollapse}
        expandIconPosition="start"
        collapsible={isSelectionEnabled ? 'disabled' : undefined}
        $isSelected={selected}
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
                    <ExerciseDetails
                      {...details}
                      weight={units === 'lb' ? toLbs(details.weight) : details.weight}
                      repeats={details.repeats}
                      time={details.time}
                      mass_unit={units}
                      payloadDictionary={exercisePayloadDictionary}
                    />
                  </div>
                )}
                description={(
                  <div style={{ marginTop: 4 }}>
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
      {isSelectionEnabled && <StyledCheckbox checked={selected} />}
      {description && <Description>{description}</Description>}
    </>
  )
}

export default SwipeableContent