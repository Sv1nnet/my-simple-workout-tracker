import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { ExerciseForm, Image } from 'app/store/slices/exercise/types'
import { FC, useState } from 'react'
import { Container, StyledActionIcon, ActionText, ActionContainer, SwipeableContent } from './components'
import { Swipeable, SwipeActions } from 'app/components'
import { SwipeableDirection } from 'app/components/swipeable/Swipeable'

export interface IExerciseForm extends Omit<ExerciseForm, 'muscle_groups'> {
  loadingExerciseId: string | null;
  listEl: HTMLElement | null;
  payloadDictionary: Record<string, { [key: string]: any }>;
  isSelectionEnabled: boolean;
  selected: boolean;
  image: Image;
  muscle_groups: { id: string, title: string }[];
  loadExercise: (id: string) => void;
  isLoading?: boolean;
  actionLabels: { edit: string };
  setIsSelectionDisabled: (isDisabled: boolean) => void;
}

const ExerciseItem: FC<IExerciseForm> = ({
  id,
  listEl,
  title,
  repeats,
  time,
  weight,
  mass_unit,
  muscle_groups,
  image,
  isSelectionEnabled,
  selected,
  loadExercise,
  payloadDictionary,
  actionLabels,
  setIsSelectionDisabled,
}) => {
  const [ shouldEditExercise, setShouldEditExercise ] = useState(false)
  
  const handleSwipedOnMaxDistance = (
    { isOnMaxDistance, direction }: { isOnMaxDistance: boolean, direction: SwipeableDirection, pointerPos: number, delta: number },
  ) => {
    setShouldEditExercise(isOnMaxDistance && direction === SwipeableDirection.RIGHT)

    if (isOnMaxDistance) Haptics.impact({ style: ImpactStyle.Light })
  }

  const handleRelease = (
    { isOnMaxDistance, direction }: { isOnMaxDistance: boolean, direction: SwipeableDirection, pointerPos: number, delta: number },
  ) => {
    if (isOnMaxDistance) {
      if (direction === SwipeableDirection.RIGHT) {
        loadExercise(id)
      }
    }
  }

  return (
    <Container>
      <SwipeActions
        leftAction={(
          <SwipeActions.Left isActive={shouldEditExercise}>
            <ActionContainer>
              <StyledActionIcon />
              <ActionText>{actionLabels.edit}</ActionText>
            </ActionContainer>
          </SwipeActions.Left>
        )}
      />
      <Swipeable
        isDisabled={isSelectionEnabled}
        direction={SwipeableDirection.RIGHT}
        maxDistance={80}
        moveToInitialOnMaxRelease={false}
        onMaxDistance={handleSwipedOnMaxDistance}
        onRelease={handleRelease}
        scrollableContainer={listEl}
        style={{ width: '100%' }}
      >
        <SwipeableContent
          muscle_groups={muscle_groups}
          image={image}
          selected={selected}
          isSelectionEnabled={isSelectionEnabled}
          setIsSelectionDisabled={setIsSelectionDisabled}
          title={title}
          repeats={repeats}
          time={time}
          weight={weight}
          mass_unit={mass_unit}
          payloadDictionary={payloadDictionary}
        />
      </Swipeable>
    </Container>
  )
}

export default ExerciseItem
