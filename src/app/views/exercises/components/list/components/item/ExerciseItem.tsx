import routes from 'app/constants/end_points'
import { InspectButton } from 'app/components/list_buttons'
import { ExerciseForm, Image } from 'app/store/slices/exercise/types'
import getWordByNumber from 'app/utils/getWordByNumber'
import { timeToHms } from 'app/utils/time'
import { Checkbox, List, Typography, Image as AntImage, Tag } from 'antd'
import itemImagePlaceholder from 'constants/item_image_placeholder'
import { FC } from 'react'
import styled from 'styled-components'

const { Title: TitleAnt, Text } = Typography

const LoadType = styled.div`
  text-align: right;
  width: 100%;
`

const ImageContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 75px;
  height: 75px;
  background-color: #f5f5f5;
  & a {
    margin: 0 auto;
  }
`

const StyledCheckbox = styled(Checkbox)`
  position: absolute;
  z-index: 100;
  top: -3px;
  left: 0;
`

const StyledTitle = styled(TitleAnt)`
  &.ant-typography {
    margin-bottom: 0;
  }
`

const TagsContainer = styled.div`
  width: 100%;
`

const StyledTag = styled(Tag)`
  margin-bottom: 6px;
`

const Title = ({ id, loadExercise, loadingExerciseId, isLoading, title, repeats, time, weight, massUnit = 'kg', payloadDictionary }) => {
  repeats = repeats ? `${repeats} ${getWordByNumber(payloadDictionary.repeats.short, repeats)}` : null
  time = time
    ? timeToHms(
      time,
      {
        hms: [
          payloadDictionary.time.hour.short,
          payloadDictionary.time.minute.short,
          payloadDictionary.time.second.short,
        ],
      },
    )
    : null
  weight = weight ? `${weight} ${payloadDictionary.mass_unit[massUnit][0]}` : null

  return (
    <div>
      <LoadType>
        <Text type="secondary">{[ repeats, time, weight ].filter(Boolean).join(' / ') || <span>&nbsp;</span>}</Text>
      </LoadType>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <StyledTitle level={4}>{title}</StyledTitle>
        <InspectButton onClick={loadExercise} id={id} loading={loadingExerciseId === id || isLoading} href={`/exercises/${id}`} />
      </div>
    </div>
  )
}

interface IExerciseForm extends Omit<ExerciseForm, 'muscle_groups'> {
  loadingExerciseId: string | null;
  payloadDictionary: object;
  selectionEnabled: boolean;
  selected: boolean;
  image: Image;
  muscle_groups: { id: string, title: string }[];
  loadExercise: (id: string) => void;
  isLoading?: boolean;
}

const ExerciseItem: FC<IExerciseForm> = ({
  id,
  loadingExerciseId,
  isLoading,
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
}) => (
  <div style={{ display: 'flex', flex: 1, alignItems: 'start', maxWidth: '100%', flexWrap: 'wrap' }}>
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
          id={id}
          loadExercise={loadExercise}
          isLoading={isLoading}
          title={title}
          repeats={repeats}
          time={time}
          weight={weight}
          massUnit={mass_unit}
          loadingExerciseId={loadingExerciseId}
          payloadDictionary={payloadDictionary}
        />
      )}
    />
  </div>
)

export default ExerciseItem
