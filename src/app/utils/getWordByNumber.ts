const getWordByNumber = (words: string[], num: number | string, lang = 'ru') => {
  const floatNum = parseFloat(`${num}`)
  num = parseInt(`${num}`, 10)
  if (num !== floatNum) return words[1] ?? words[0]
  if (Number.isNaN(num)) throw new TypeError('Number argument (num) is NaN')

  num = Math.abs(num)
  if (lang !== 'ru') return num === 1 ? words[0] : words[1]

  // Define index in a words array
  const _0 = num % 10 === 1 && num % 100 !== 11 ? 0 : false
  const _1 = _0 === false && (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20)) ? 1 : false
  const _2 = _1 === false ? 2 : false
  const wordIndex = _0 !== false ? _0 : (_1 || _2)

  return words[Number(wordIndex)] ?? words[0]
}

export default getWordByNumber
