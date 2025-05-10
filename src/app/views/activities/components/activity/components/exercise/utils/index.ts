import { isNull, isNumber } from 'app/utils/typeCheckers'

export const getIsAllResultsFilled = (form, exercise, exerciseIndex) => {
  const allResults = form.getFieldValue([ 'results', exerciseIndex, 'rounds' ])

  if (!allResults) return false

  if (exercise.each_side) {
    return allResults.every(result => (
      result?.right !== '' &&
      !isNull(result?.right) &&
      isNumber(+result?.right) &&
      result?.left !== '' &&
      !isNull(result?.left) &&
      isNumber(+result?.left)
    ))
  }

  return allResults.every(result => (
    result !== '' &&
    !isNull(result) &&
    isNumber(+result)
  ))
}

export const getIsAllResultWithoutPenultimateFilled = (form, exercise, exerciseIndex, isAllResultsFilled) => {
  if (isAllResultsFilled) return true

  const allResults = form.getFieldValue([ 'results', exerciseIndex, 'rounds' ])

  if (!allResults) return false

  const allResultsLength = allResults.length
  const allResultsWithoutLast = allResults.slice(0, allResultsLength - 1)

  if (exercise.each_side) {
    return allResultsWithoutLast.every(result => (
      result?.right !== '' &&
        !isNull(result?.right) &&
        isNumber(+result?.right) &&
        result?.left !== '' &&
        !isNull(result?.left) &&
        isNumber(+result?.left)
    ))
  }

  return allResultsWithoutLast.every(result => (
    result !== '' &&
      !isNull(result) &&
      isNumber(+result)
  ))
}
