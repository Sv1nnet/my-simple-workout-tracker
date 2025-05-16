import { useMemo, useState } from 'react'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { ActivityListItem } from 'app/store/slices/activity/types'
import {
  Container,
  StyledActionIcon,
  ActionContainer,
  ActionText,
  SwipeableContent,
} from './components'
import { useToggle } from 'app/hooks'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { Swipeable, SwipeActions } from 'app/components'
import { SwipeableDirection } from 'app/components/swipeable/Swipeable'

export type ActivityItemProps = ActivityListItem & {
  exercisePayloadDictionary: any;
  activityDictionary: any;
  isSelectionEnabled: boolean;
  selected: boolean;
  loadingActivityId: string | null;
  loadActivity: (id: string) => void;
  setIsSelectionDisabled: (isDisabled: boolean) => void;
  listEl: HTMLElement | null;
  isLoading?: boolean;
}

const ActivityItem = ({
  id,
  muscle_groups: _muscle_groups,
  date,
  workout_title,
  results,
  description,
  isSelectionEnabled,
  selected,
  activityDictionary,
  loadActivity,
  listEl,
  exercisePayloadDictionary,
  setIsSelectionDisabled,
}: ActivityItemProps) => {
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
    { isOnMaxDistance, direction }: { isOnMaxDistance: boolean, direction: SwipeableDirection, pointerPos: number, delta: number },
  ) => {
    if (isOnMaxDistance && direction === SwipeableDirection.RIGHT) {
      setShouldEditActivity(true)
      return Haptics.impact({ style: ImpactStyle.Light })
    }

    setShouldEditActivity(false)
  }

  const handleRelease = (
    { isOnMaxDistance, direction }: { isOnMaxDistance: boolean, direction: SwipeableDirection, pointerPos: number, delta: number },
  ) => {
    if (isOnMaxDistance && direction === SwipeableDirection.RIGHT) {
      loadActivity(id)
    }
  }

  return (
    <Container>
      <SwipeActions
        leftAction={
          <SwipeActions.Left
            isActive={shouldEditActivity}
          >
            <ActionContainer>
              <StyledActionIcon />
              <ActionText>{intl?.pages?.activities?.action_labels?.edit}</ActionText>
            </ActionContainer>
          </SwipeActions.Left>
        }
      />
      <Swipeable
        direction={isSelectionEnabled ? SwipeableDirection.NONE : SwipeableDirection.RIGHT}
        maxDistance={80}
        moveToInitialOnMaxRelease={false}
        onMaxDistance={handleSwipedOnMaxDistance}
        onRelease={handleRelease}
        scrollableContainer={listEl}
      >
        <SwipeableContent
          isSelectionEnabled={isSelectionEnabled}
          selected={selected}
          description={description}
          muscleGroups={muscleGroups}
          results={results}
          exercisePayloadDictionary={exercisePayloadDictionary}
          activityDictionary={activityDictionary}
          isOpen={isOpen}
          date={date}
          workout_title={workout_title}
          setIsSelectionDisabled={setIsSelectionDisabled}
          onCollapse={handleCollapse}
          intl={intl}
        />
      </Swipeable>
    </Container>
  )
}

export default ActivityItem
