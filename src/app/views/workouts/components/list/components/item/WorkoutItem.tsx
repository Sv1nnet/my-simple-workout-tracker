import routes from 'app/constants/end_points'
import { Image } from 'app/store/slices/exercise/types'
import { WorkoutListItem } from 'app/store/slices/workout/types'
import { timeToHms } from 'app/utils/time'
import { Collapse, List, Typography, Tag } from 'antd'
import itemImagePlaceholder from 'constants/item_image_placeholder'
import React, { FC, useMemo } from 'react'
import { InspectButton } from 'app/components/list_buttons'
import { useToggle } from 'app/hooks'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { Description, HeaderContainer, ImageContainer, StyledBreakText, StyledCheckbox, StyledTagsPanel, TagsContainer, Title } from './components'
import { StyledPanel } from './components'

interface IWorkout extends WorkoutListItem {
  payloadDictionary: {
    time: {
      hour: {
        short: string
      },
      minute: {
        short: string
      },
      second: {
        short: string
      },
    }
  };
  loadingWorkoutId: string | null;
  workoutDictionary: any;
  selectionEnabled: boolean;
  selected: boolean;
  image: Image;
  loadWorkout: (id: string) => void;
  isLoading?: boolean;
}

const WorkoutItem: FC<IWorkout> = ({
  id,
  title,
  exercises,
  muscle_groups: _muscle_groups,
  loadingWorkoutId,
  selectionEnabled,
  description,
  selected,
  payloadDictionary,
  workoutDictionary,
  loadWorkout,
  isLoading,
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
            <InspectButton onClick={loadWorkout} id={id} loading={loadingWorkoutId === id || isLoading} href={`/workouts/${id}`} />
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
            <React.Fragment key={exerciseId as string}>
              {!!muscle_groups?.length && (
                <TagsContainer style={{ marginBottom: '6px' }}>
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
                      : itemImagePlaceholder}/>
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
                description={<Description rounds={rounds} round_break={round_break} payloadDictionary={payloadDictionary} workoutDictionary={workoutDictionary} />}
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
            </React.Fragment>
          ))}
        </StyledPanel>
      </Collapse>
    
      {selectionEnabled && <StyledCheckbox checked={selected} />}

      {description && <Typography.Text style={{ marginTop: '6px', display: 'inline-block' }}>{description}</Typography.Text>}
    </>
  )
}

export default WorkoutItem
