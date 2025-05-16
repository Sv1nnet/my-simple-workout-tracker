import routes from 'app/constants/end_points'
import { List, Image as AntImage } from 'antd'
import itemImagePlaceholder from 'constants/item_image_placeholder'
import { ImageContainer, StyledCheckbox, StyledTag, TagsContainer, Title, InnerContainer } from './components'
import { MuscleGroup } from 'app/store/slices/muscleGroup/types'
import { Image } from 'app/store/slices/exercise/types'
import { useEffect } from 'react'
import { SwipeableDirection, useSwipeableContext } from 'app/components/swipeable/Swipeable'

export type SwipeableContentProps = {
  muscle_groups: MuscleGroup[]
  image: Image
  selected: boolean
  isSelectionEnabled: boolean
  title: string
  repeats: number
  time: number
  weight: number
  mass_unit: string
  payloadDictionary: Record<string, string>
  setIsSelectionDisabled: (isDisabled: boolean) => void
}

const SwipeableContent = ({
  muscle_groups,
  image,
  selected,
  isSelectionEnabled,
  title,
  repeats,
  time,
  weight,
  mass_unit,
  payloadDictionary,
  setIsSelectionDisabled,
}) => {
  const { isSwiping, direction } = useSwipeableContext()

  useEffect(() => {
    setIsSelectionDisabled(direction !== SwipeableDirection.NONE || isSwiping)
  }, [ isSwiping, direction ])

  return (
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
            {isSelectionEnabled && <StyledCheckbox checked={selected} />}
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
  )
}

export default SwipeableContent
