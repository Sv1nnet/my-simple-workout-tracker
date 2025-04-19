import routes from 'app/constants/end_points'
import { ExerciseForm, Image } from 'app/store/slices/exercise/types'
import { List, Image as AntImage } from 'antd'
import itemImagePlaceholder from 'constants/item_image_placeholder'
import { FC, useState } from 'react'
import { ImageContainer, StyledCheckbox, StyledTag, TagsContainer, Title, Container, InnerContainer, StyledActionIcon } from './components'
import { Swipable, SwipeActions } from 'app/components'
import { SwipableDirection } from 'app/components/swipable/Swipable'

interface IExerciseForm extends Omit<ExerciseForm, 'muscle_groups'> {
  loadingExerciseId: string | null;
  listEl: HTMLElement | null;
  payloadDictionary: Record<string, { [key: string]: any }>;
  selectionEnabled: boolean;
  selected: boolean;
  image: Image;
  muscle_groups: { id: string, title: string }[];
  loadExercise: (id: string) => void;
  isLoading?: boolean;
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
}) => {
  const [ shouldEditExercise, setShouldEditExercise ] = useState(false)
  
  const handleSwipedOnMaxDistance = (
    { isOnMaxDistance, direction }: { isOnMaxDistance: boolean, direction: SwipableDirection, pointerPos: number, delta: number },
  ) => {
    setShouldEditExercise(isOnMaxDistance && direction === SwipableDirection.RIGHT)
  }

  const handleRelease = (
    { isOnMaxDistance, direction }: { isOnMaxDistance: boolean, direction: SwipableDirection, pointerPos: number, delta: number },
  ) => {
    if (isOnMaxDistance) {
      if (direction === SwipableDirection.RIGHT) {
        loadExercise(id)
      }
    }
  }

  return (
    <Container>
      <SwipeActions
        leftAction={<SwipeActions.Left isActive={shouldEditExercise} icon={<StyledActionIcon />} />}
      />
      <Swipable
        direction={selectionEnabled ? SwipableDirection.NONE : SwipableDirection.RIGHT}
        maxDistance={90}
        onMaxDistance={handleSwipedOnMaxDistance}
        onRelease={handleRelease}
        scrollableContainer={listEl}
        style={{ width: '100%' }}
      >
        <InnerContainer>
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
      </Swipable>
    </Container>
  )
}

export default ExerciseItem
