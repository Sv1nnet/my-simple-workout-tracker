import routes from 'app/constants/end_points'
import { Collapse, List, Tag, Typography } from 'antd'
import classes from './style.module.scss'
import Description, { DescriptionProps } from './components/description/Description'
import { timeToHms } from 'app/utils/time'
import Title from './components/title/Title'
import { useEffect } from 'react'
import { SwipeableDirection, useSwipeableContext } from 'app/components/swipeable/Swipeable'
import dayjs from 'dayjs'
import { WorkoutListExercise } from 'app/store/slices/workout/types'
import { MuscleGroup } from 'app/store/slices/exercise/types'
import {
  HeaderContainer,
  ImageContainer,
  StyledBreakText,
  StyledCheckbox,
  StyledCollapse,
  StyledPanel,
  StyledTagsPanel,
  TagsContainer,
} from './components'

export type SwipeableContentProps = {
  intl: Record<string, any>;
  onCollapse: (activeKeys: string[]) => void;
  isSelectionEnabled: boolean;
  isSelected: boolean;
  title: string;
  description: string;
  muscleGroups: MuscleGroup[];
  exercises: WorkoutListExercise<number | dayjs.Dayjs>[];
  payloadDictionary: DescriptionProps['payloadDictionary'];
  workoutDictionary: DescriptionProps['workoutDictionary'];
  isOpen: boolean;
  setIsSelectionDisabled: (shouldDisable: boolean) => void;
  itemImagePlaceholder: string;
}

const SwipeableContent = ({
  intl,
  onCollapse,
  isSelectionEnabled,
  isSelected,
  title,
  description,
  muscleGroups,
  exercises,
  payloadDictionary,
  workoutDictionary,
  isOpen,
  setIsSelectionDisabled,
  itemImagePlaceholder,
}: SwipeableContentProps) => {
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
        $isSelected={isSelected}
      >
        <StyledPanel key="exercises" className="panel-header" header={(
          <HeaderContainer>
            <div>
              {!!muscleGroups?.length && (
                <Collapse ghost activeKey={!isOpen ? 'muscleGroups' : undefined}>
                  <StyledTagsPanel key='muscleGroups' header={null}>
                    <TagsContainer>
                      {muscleGroups.map(muscleGroup => (
                        <Tag key={muscleGroup?.id}>{muscleGroup?.title}</Tag>
                      ))}
                    </TagsContainer>
                  </StyledTagsPanel>
                </Collapse>
              )}
              <Typography.Title style={{ marginBottom: '0' }} level={3}>{title}</Typography.Title>
            </div>
          </HeaderContainer>
        )}>
          {/* render every exercise */}
          {exercises.map(({
            _id: exerciseId,
            exercise: { title: exerciseTitle, repeats, time, weight, mass_unit, image, muscle_groups },
            rounds,
            round_break,
            break: interExercisesBreak,
            break_enabled,
          }) => (
            <div className={classes.exerciseItem} key={exerciseId as string}>
              {!!muscle_groups?.length && (
                <TagsContainer $marginBottom={6}>
                  {muscle_groups?.map(muscleGroup => (
                    <Tag key={muscleGroup?.id}>{muscleGroup?.archived ? `${muscleGroup?.title} (${intl.rest?.muscle_group?.state?.archived})` : muscleGroup?.title}</Tag>
                  ))}
                </TagsContainer>
              )}
              <List.Item.Meta
                avatar={(
                  <ImageContainer>
                    <img src={image?.url
                      ? image.url.startsWith('data:image/')
                        ? image.url
                        : `${routes.base}${image.url}`
                      : itemImagePlaceholder}
                    />
                  </ImageContainer>
                )}
                title={(
                  <Title
                    title={exerciseTitle}
                    repeats={repeats}
                    time={time}
                    weight={weight}
                    massUnit={mass_unit}
                    payloadDictionary={payloadDictionary}
                  />
                )}
                description={
                  <Description
                    rounds={rounds}
                    round_break={round_break}
                    payloadDictionary={payloadDictionary}
                    workoutDictionary={workoutDictionary}
                  />
                }
              />
              {break_enabled && <StyledBreakText>{workoutDictionary.input_labels.break}: {timeToHms(
                interExercisesBreak,
                {
                  hms: [
                    payloadDictionary.time.hour.short,
                    payloadDictionary.time.minute.short,
                    payloadDictionary.time.second.short,
                  ],
                },
              ) || `0${payloadDictionary.time.second.short}`}</StyledBreakText>}
            </div>
          ))}
        </StyledPanel>
      </StyledCollapse>
    
      {isSelectionEnabled && <StyledCheckbox checked={isSelected} />}

      {description && <Typography.Text style={{ marginTop: '6px', display: 'inline-block' }}>{description}</Typography.Text>}
    </>
  )
}

export default SwipeableContent
