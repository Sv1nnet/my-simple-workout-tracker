import routes from 'app/constants/end_points'
import { InspectButton } from 'app/components/list_buttons'
import { ExerciseForm, Image } from 'app/store/slices/exercise/types'
import getWordByNumber from 'app/utils/getWordByNumber'
import { timeToHms } from 'app/utils/time'
import { Checkbox, List, Typography, Image as AntImage } from 'antd'
import itemImagePlaceholder from 'constants/item_image_placeholder'
import { FC } from 'react'
import styled from 'styled-components'

const { Title, Text } = Typography

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

const StyledTitle = ({ id, loadExercise, loadingExerciseId, isLoading, title, repeats, time, weight, massUnit = 'kg', payloadDictionary }) => {
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
        <Title level={4}>{title}</Title>
        <InspectButton onClick={loadExercise} id={id} loading={loadingExerciseId === id || isLoading} href={`/exercises/${id}`} />
      </div>
    </div>
  )
}

interface IExerciseForm extends ExerciseForm {
  loadingExerciseId: string | null;
  payloadDictionary: object;
  selectionEnabled: boolean;
  selected: boolean;
  image: Image;
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
  image,
  selectionEnabled,
  selected,
  loadExercise,
  payloadDictionary,
}) => (
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
      <StyledTitle
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
)

export default ExerciseItem
