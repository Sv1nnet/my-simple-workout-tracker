import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Image } from 'app/store/slices/exercise/types'
import { WorkoutListItem } from 'app/store/slices/workout/types'
import { FC, useMemo, useState } from 'react'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import {
  Container,
  StyledRightActionIcon,
  StyledActionIcon,
  ActionText,
  ActionContainer,
  SwipeableContent,
} from './components'
import { Swipeable, SwipeActions } from 'app/components'
import { SwipeableDirection } from 'app/components/swipeable/Swipeable'
import { setCachedActivity } from 'app/store/slices/activity'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { routes as clientRoutes } from 'src/router'
import { useAppDispatch } from 'app/hooks'
import { getResultsFromWorkoutList } from 'app/views/activities/components/activity/utils'

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
  isSelectionEnabled: boolean;
  isSelected: boolean;
  image: Image;
  setIsSelectionDisabled: (shouldDisable: boolean) => void;
  loadWorkout: (id: string) => void;
  listEl: HTMLElement | null;
  actionLabels: { edit: string, start: string };
  itemImagePlaceholder: string;
  isLoading?: boolean;
}

const WorkoutItem: FC<IWorkout> = ({
  id,
  title,
  exercises,
  muscle_groups: _muscle_groups,
  isSelectionEnabled,
  description,
  isSelected,
  payloadDictionary,
  workoutDictionary,
  loadWorkout,
  listEl,
  actionLabels,
  setIsSelectionDisabled,
  itemImagePlaceholder,
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
        isDisabled={isSelectionEnabled}
        direction={SwipeableDirection.BOTH}
        maxDistance={80}
        moveToInitialOnMaxRelease={false}
        onMaxDistance={handleSwipedOnMaxDistance}
        onRelease={handleRelease}
        scrollableContainer={listEl}
      >
        <SwipeableContent
          intl={intl}
          itemImagePlaceholder={itemImagePlaceholder}
          onCollapse={handleCollapse}
          isSelectionEnabled={isSelectionEnabled}
          isSelected={isSelected}
          title={title}
          description={description}
          muscleGroups={muscleGroups}
          exercises={exercises}
          payloadDictionary={payloadDictionary}
          workoutDictionary={workoutDictionary}
          isOpen={isOpen}
          setIsSelectionDisabled={setIsSelectionDisabled}
        />
      </Swipeable>
    </Container>
  )
}

export default WorkoutItem
