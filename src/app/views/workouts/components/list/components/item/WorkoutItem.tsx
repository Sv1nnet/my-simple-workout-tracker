import routes from 'app/constants/end_points'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Image } from 'app/store/slices/exercise/types'
import { WorkoutListItem } from 'app/store/slices/workout/types'
import { timeToHms } from 'app/utils/time'
import { Collapse, List, Typography, Tag } from 'antd'
import itemImagePlaceholder from 'constants/item_image_placeholder'
import { FC, useMemo, useState } from 'react'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import {
  Description,
  HeaderContainer,
  ImageContainer,
  StyledBreakText,
  StyledCheckbox,
  StyledCollapse,
  StyledTagsPanel,
  TagsContainer,
  Title,
  Container,
  StyledRightActionIcon,
  StyledActionIcon,
  ActionText,
  ActionContainer,
} from './components'
import { StyledPanel } from './components'
import { Swipeable, SwipeActions } from 'app/components'
import { SwipeableDirection } from 'app/components/swipeable/Swipeable'
import { setCachedActivity } from 'app/store/slices/activity'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { routes as clientRoutes } from 'src/router'
import { useAppDispatch } from 'app/hooks'
import { getResultsFromWorkoutList } from 'app/views/activities/components/activity/utils'
import classes from './style.module.scss'

export interface IWorkout extends WorkoutListItem {
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
  listEl: HTMLElement | null;
  actionLabels: { edit: string, start: string };
  isLoading?: boolean;
}

const WorkoutItem: FC<IWorkout> = ({
  id,
  title,
  exercises,
  muscle_groups: _muscle_groups,
  selectionEnabled,
  description,
  selected,
  payloadDictionary,
  workoutDictionary,
  loadWorkout,
  listEl,
  actionLabels,
}) => {
  const [ shouldStartActivity, setShouldStartActivity ] = useState(false)
  const [ shouldEditActivity, setShouldEditActivity ] = useState(false)
  const [ isOpen, setIsOpen ] = useState(false)

  const navigate = useNavigate()
  const { intl } = useIntlContext()
  const dispatch = useAppDispatch()

  const muscleGroups = useMemo(
    () => (_muscle_groups || []).map(
      muscleGroup => muscleGroup.archived ? {
        ...muscleGroup,
        title: `${muscleGroup.title} (${intl.rest?.muscle_group?.state?.archived})`,
      } : muscleGroup,
    ),
    [ _muscle_groups, intl ],
  )

  const handleCollapse = (activeKeys: string[]) => {
    setIsOpen(!!activeKeys.length)
  }

  const handleSwipedOnMaxDistance = (
    { isOnMaxDistance, direction }: { isOnMaxDistance: boolean, direction: SwipeableDirection, pointerPos: number, delta: number },
  ) => {
    setShouldStartActivity(isOnMaxDistance && direction === SwipeableDirection.LEFT)
    setShouldEditActivity(isOnMaxDistance && direction === SwipeableDirection.RIGHT)

    if (isOnMaxDistance) Haptics.impact({ style: ImpactStyle.Light })
  }

  const handleRelease = (
    { isOnMaxDistance, direction }: { isOnMaxDistance: boolean, direction: SwipeableDirection, pointerPos: number, delta: number },
  ) => {
    if (isOnMaxDistance) {
      if (direction === SwipeableDirection.LEFT) {
        dispatch(setCachedActivity({
          data: {
            date: dayjs(),
            workout_id: id,
            results: getResultsFromWorkoutList([
              {
                id,
                exercises,
                title,
                muscle_groups: _muscle_groups,
                description,
              },
            ], id),
            description: '',
          },
          shouldSaveToLocalStorage: true,
        }))
        navigate(clientRoutes.activities.create())
        return
      }

      if (direction === SwipeableDirection.RIGHT) {
        loadWorkout(id)
      }
    }
  }

  return (
    <Container>
      <SwipeActions
        leftAction={
          <SwipeActions.Left isActive={shouldEditActivity}>
            <ActionContainer>
              <StyledActionIcon />
              <ActionText>{actionLabels.edit}</ActionText>
            </ActionContainer>
          </SwipeActions.Left>
        }
        rightAction={
          <SwipeActions.Right isActive={shouldStartActivity}>
            <ActionContainer>
              <StyledRightActionIcon />
              <ActionText $marginTop={-5}>{actionLabels.start}</ActionText>
            </ActionContainer>
          </SwipeActions.Right>
        }
      />
      <Swipeable
        direction={selectionEnabled ? SwipeableDirection.NONE : SwipeableDirection.BOTH}
        maxDistance={80}
        moveToInitialOnMaxRelease={false}
        onMaxDistance={handleSwipedOnMaxDistance}
        onRelease={handleRelease}
        scrollableContainer={listEl}
      >
        <StyledCollapse
          ghost
          onChange={handleCollapse}
          expandIconPosition="start"
          collapsible={selectionEnabled ? 'disabled' : undefined}
          $isSelected={selected}
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
              </div>
            ))}
          </StyledPanel>
        </StyledCollapse>
    
        {selectionEnabled && <StyledCheckbox checked={selected} />}

        {description && <Typography.Text style={{ marginTop: '6px', display: 'inline-block' }}>{description}</Typography.Text>}
      </Swipeable>
    </Container>
  )
}

export default WorkoutItem
