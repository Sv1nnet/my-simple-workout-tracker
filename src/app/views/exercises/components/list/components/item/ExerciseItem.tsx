import routes from '@/src/app/constants/end_points'
import { ExerciseForm, Image } from '@/src/app/store/slices/exercise/types'
import getWordByNumber from '@/src/app/utils/getWordByNumber'
import { timeToHms } from '@/src/app/utils/time'
import { LoadingOutlined } from '@ant-design/icons'
import { Checkbox, List, Spin, Typography } from 'antd'
import itemImagePlaceholder from 'constants/item_image_placeholder'
import Link from 'next/link'
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
  & img {
    max-height: 75px;
    max-width: 75px;
  }
`

const StyledCheckbox = styled(Checkbox)`
  position: absolute;
  top: -3px;
  left: 0;
`

const StyledTitle = ({ id, isLoading, title, repeats, time, weight, massUnit = 'kg', payloadDictionary, selectionEnabled }) => {
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

  return selectionEnabled || isLoading
    ? (
      <div>
        <LoadType>
          <Text type="secondary">{[ repeats, time, weight ].filter(Boolean).join(' / ') || <span>&nbsp;</span>}</Text>
        </LoadType>
        <Title level={4}>{title}</Title>
      </div>
    )
    : (
      <Link href={`/exercises/${id}`}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a>
          <LoadType>
            <Text type="secondary">{[ repeats, time, weight ].filter(Boolean).join(' / ') || <span>&nbsp;</span>}</Text>
          </LoadType>
          <Title level={4}>{title}</Title>
        </a>
      </Link>
    )
}

const ExerciseImage = ({ id, isLoading, selectionEnabled, image }) => (selectionEnabled || isLoading)
  ? isLoading
    ? (
      <Spin indicator={<LoadingOutlined />}>
        <img
          src={image?.url ? `${routes.base}${image.url}` : itemImagePlaceholder}
        />
      </Spin>
    )
    : (
      <img
        src={image?.url ? `${routes.base}${image.url}` : itemImagePlaceholder}
      />
    )
  
  : (
    <Link href={`/exercises/${id}`}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a>
        <img
          src={image?.url ? `${routes.base}${image.url}` : itemImagePlaceholder}
        />
      </a>
    </Link>
  )

interface IExerciseForm extends ExerciseForm {
  payloadDictionary: object;
  selectionEnabled: boolean;
  selected: boolean;
  image: Image;
  isLoading?: boolean;
}

const ExerciseItem: FC<IExerciseForm> = ({ id, isLoading, title, repeats, time, weight, mass_unit, image, selectionEnabled, selected, payloadDictionary }) => (
  <List.Item.Meta
    avatar={(
      <ImageContainer>
        {selectionEnabled && <StyledCheckbox checked={selected} />}
        <ExerciseImage isLoading={isLoading} selectionEnabled={selectionEnabled} id={id} image={image} />
      </ImageContainer>
    )}
    title={(
      <StyledTitle
        id={id}
        isLoading={isLoading}
        title={title}
        repeats={repeats}
        time={time}
        weight={weight}
        massUnit={mass_unit}
        payloadDictionary={payloadDictionary}
        selectionEnabled={selectionEnabled}
      />
    )}
  />
)

export default ExerciseItem
