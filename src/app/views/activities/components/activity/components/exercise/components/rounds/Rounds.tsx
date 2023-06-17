import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { HistoryResult, Round as TRound } from 'app/store/slices/activity/types'
import { ExerciseType } from 'app/store/slices/exercise/types'
import { FC } from 'react'
import { getComparator } from 'app/views/activities/components/activity/utils'
import { RoundsTable, THeadCell } from './components/styled'
import Round from './components/round/Round'
import { CacheFormData } from '../../../../types'

export interface IRounds {
  loaderDictionary: {
    previous_loading: string,
  };
  isFormItemDisabled: boolean;
  isLoading: boolean;
  form;
  history: HistoryResult;
  rounds: TRound[];
  hours: boolean;
  exerciseIndex: number;
  eachSide: boolean;
  historyDisplayMode: 'table' | 'chart';
  type: ExerciseType;
  isTimeType: boolean;
  onResultClick: Function;
  cacheFormData: CacheFormData;
}

const Rounds: FC<IRounds> = ({
  cacheFormData,
  loaderDictionary,
  isFormItemDisabled,
  isLoading,
  form,
  history,
  onResultClick,
  rounds,
  hours,
  exerciseIndex,
  eachSide,
  historyDisplayMode,
  type,
  isTimeType,
}) => {
  const { side_labels, rounds_section_headers } = useIntlContext().intl.pages.activities

  const comparator = getComparator(type)

  return (
    <RoundsTable style={{ tableLayout: 'fixed' }}>
      <thead>
        <tr>
          <THeadCell>{rounds_section_headers.rounds}</THeadCell>
          <THeadCell $isTimeType={isTimeType} $isHours={hours} $eachSide={eachSide}>{rounds_section_headers.results}</THeadCell>
          <THeadCell $previous>{rounds_section_headers.previous}</THeadCell>
        </tr>
      </thead>
      <tbody>
        {rounds.map((_, i) => (
          <Round
            onResultClick={onResultClick}
            isFormItemDisabled={isFormItemDisabled}
            loaderDictionary={loaderDictionary}
            sideLabels={side_labels}
            comparator={comparator}
            historyDisplayMode={historyDisplayMode}
            hours={hours}
            key={i}
            totalRounds={rounds.length}
            form={form}
            isLoading={isLoading}
            eachSide={eachSide}
            isTimeType={isTimeType}
            exerciseIndex={exerciseIndex}
            round={i}
            history={history}
            cacheFormData={cacheFormData}
          />
        ))}
      </tbody>
    </RoundsTable>
  )
}

export default Rounds
