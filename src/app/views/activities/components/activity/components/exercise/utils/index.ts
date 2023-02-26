export const getIsAllResultsFilled = (form, exercise, exerciseIndex) => {
  const allResults = form.getFieldValue([ 'results', exerciseIndex, 'rounds' ])

  if (!allResults) return false

  if (exercise.each_side) {
    return allResults.every(result => (
      result?.right !== '' &&
      result?.right !== null &&
      typeof +result?.right === 'number' &&
      result?.left !== '' &&
      result?.left &&
      typeof +result?.left === 'number'
    ))
  }

  return allResults.every(result => (
    result !== '' &&
    result !== null &&
    typeof +result === 'number' &&
    typeof +result === 'number'
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
        result?.right !== null &&
        typeof +result?.right === 'number' &&
        result?.left !== '' &&
        result?.left &&
        typeof +result?.left === 'number'
    ))
  }

  return allResultsWithoutLast.every(result => (
    result !== '' &&
      result !== null &&
      typeof +result === 'number' &&
      typeof +result === 'number'
  ))
}
