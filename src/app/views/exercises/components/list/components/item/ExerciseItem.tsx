import routes from 'app/constants/end_points'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { ExerciseForm, Image } from 'app/store/slices/exercise/types'
import { List, Image as AntImage } from 'antd'
import itemImagePlaceholder from 'constants/item_image_placeholder'
import { FC, useState } from 'react'
import { ImageContainer, StyledCheckbox, StyledTag, TagsContainer, Title, Container, InnerContainer, StyledActionIcon, ActionText, ActionContainer } from './components'
import { Swipeable, SwipeActions } from 'app/components'
import { SwipeableDirection } from 'app/components/swipeable/Swipeable'

export interface IExerciseForm extends Omit<ExerciseForm, 'muscle_groups'> {
  loadingExerciseId: string | null;
  listEl: HTMLElement | null;
  payloadDictionary: Record<string, { [key: string]: any }>;
  selectionEnabled: boolean;
  selected: boolean;
  image: Image;
  muscle_groups: { id: string, title: string }[];
  loadExercise: (id: string) => void;
  isLoading?: boolean;
  actionLabels: { edit: string };
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
  selectionEnabled,
  selected,
  loadExercise,
  payloadDictionary,
  actionLabels,
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
        direction={selectionEnabled ? SwipeableDirection.NONE : SwipeableDirection.RIGHT}
        maxDistance={80}
        moveToInitialOnMaxRelease={false}
        onMaxDistance={handleSwipedOnMaxDistance}
        onRelease={handleRelease}
        scrollableContainer={listEl}
        style={{ width: '100%' }}
      >
        <InnerContainer $isSelected={selected}>
          {!!muscle_groups.length && (
            <TagsContainer>
              {muscle_groups.map(muscleGroup => (
                <StyledTag key={muscleGroup.id}>{muscleGroup.title}</StyledTag>
              ))}
            </TagsContainer>
          )}
          <List.Item.Meta
            avatar={(
              <ImageContainer>
                {selectionEnabled && <StyledCheckbox checked={selected} />}
                <AntImage
                  style={{
                    maxWidth: 75,
                    maxHeight: 75,
                  }}
                  src={image?.url
                    ? image.url.startsWith('data:image/')
                      ? image.url
                      : `${routes.base}${image.url}`
                    : itemImagePlaceholder}
                />
              </ImageContainer>
            )}
            title={(
              <Title
                title={title}
                repeats={repeats}
                time={time}
                weight={weight}
                massUnit={mass_unit}
                payloadDictionary={payloadDictionary}
              />
            )}
          />
        </InnerContainer>
      </Swipeable>
    </Container>
  )
}

export default ExerciseItem
