import routes from '@/src/app/constants/end_points'
import { Image } from '@/src/app/store/slices/exercise/types'
import { WorkoutListItem } from '@/src/app/store/slices/workout/types'
import getWordByNumber from '@/src/app/utils/getWordByNumber'
import { timeToHms } from '@/src/app/utils/time'
import { Collapse, Checkbox, List, Typography } from 'antd'
import itemImagePlaceholder from 'constants/item_image_placeholder'
import React, { FC } from 'react'
import styled from 'styled-components'
import { InspectButton } from 'app/components/list_buttons'

const { Panel } = Collapse
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
  top: 19px;
  left: 15px;
  z-index: 1;
`

const StyledPanel = styled(Panel)`
  &.ant-collapse-item > .ant-collapse-header {
    padding: 0;

    & .ant-collapse-arrow {
      vertical-align: -7px;
    }
  }
`

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`

const StyledDescription = ({ rounds, round_break, payloadDictionary, workoutDictionary }) => (
  <div>
    <Typography.Text>{workoutDictionary.input_labels.rounds}: {rounds}</Typography.Text>
    &nbsp;|&nbsp;
    <Typography.Text>{workoutDictionary.input_labels.round_break}: {round_break
      ? timeToHms(
        round_break,
        {
          hms: [
            payloadDictionary.time.hour.short,
            payloadDictionary.time.minute.short,
            payloadDictionary.time.second.short,
          ],
        },
      )
      : `0${payloadDictionary.time.second.short}`}</Typography.Text>
  </div>
)

const StyledTitle = ({ title, repeats, time, weight, massUnit = 'kg', payloadDictionary }) => {
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
      <Title style={{ marginBottom: '0' }} level={4}>{title}</Title>
    </div>
  )
}

interface IWorkout extends WorkoutListItem {
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
}

const WorkoutItem: FC<IWorkout> = ({
  id,
  title,
  exercises,
  loadingWorkoutId,
  selectionEnabled,
  description,
  selected,
  payloadDictionary,
  workoutDictionary,
}) => (
  <>
    <Collapse style={{ width: '100%' }} ghost expandIconPosition="left" collapsible={selectionEnabled ? 'disabled' : undefined}>
      <StyledPanel key="exercises" header={(
        <HeaderContainer>
          <Typography.Title level={3}>{title}</Typography.Title>
          <InspectButton loading={loadingWorkoutId === id} href={`/workouts/${id}`} />
        </HeaderContainer>
      )}>
        {/* render every exercise */}
        {exercises.map(({
          _id: exerciseId,
          exercise: { title: exerciseTitle, repeats, time, weight, mass_unit, image },
          rounds,
          round_break,
          break: interExercisesBreak,
          break_enabled,
        }) => (
          <React.Fragment key={exerciseId as string}>
            <List.Item.Meta
              avatar={(
                <ImageContainer>
                  <img src={image?.url ? `${routes.base}${image.url}` : itemImagePlaceholder}/>
                </ImageContainer>
              )}
              title={(
                <StyledTitle
                  title={exerciseTitle}
                  repeats={repeats}
                  time={time}
                  weight={weight}
                  massUnit={mass_unit}
                  payloadDictionary={payloadDictionary}
                />
              )}
              description={<StyledDescription rounds={rounds} round_break={round_break} payloadDictionary={payloadDictionary} workoutDictionary={workoutDictionary} />}
              style={{ flexBasis: '100%', marginBottom: '6px' }}
            />
            {break_enabled && <Typography.Title level={5} style={{ width: '100%' }}>{workoutDictionary.input_labels.break}: {timeToHms(
              interExercisesBreak,
              {
                hms: [
                  payloadDictionary.time.hour.short,
                  payloadDictionary.time.minute.short,
                  payloadDictionary.time.second.short,
                ],
              },
            ) || `0${payloadDictionary.time.second.short}`}</Typography.Title>}
          </React.Fragment>
        ))}
      </StyledPanel>
    </Collapse>
    
    {selectionEnabled && <StyledCheckbox checked={selected} />}

    {description && <Typography.Text style={{ marginTop: '6px', display: 'inline-block' }}>{description}</Typography.Text>}
  </>
)

export default WorkoutItem
