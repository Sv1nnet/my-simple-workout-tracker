import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react-hooks'
import { useFixNumber, useValidateNumber } from '../numberInputHooks'

describe('useFixNumber', () => {
  const testCases = [
    { input: '001', options: { cutZeroes: true }, expected: '1' },
    { input: '-,123', options: {}, expected: '-0.123' },
    { input: '123,', options: {}, expected: '123' },
    { input: '-,', options: {}, expected: '0' },
    { input: '123.456', options: { maxDigitsAfterPoint: 2 }, expected: '123.45' },
    { input: '-123', options: { onlyPositive: true }, expected: '123' },
    { input: '123', options: { onlyNegative: true }, expected: '-123' },
    { input: 'abc123', options: {}, expected: '123' },
    { input: 'abc123.2300', options: { cutZeroes: true, isCommaDecimalPoint: true }, expected: '123,23' },
    { input: '12.34.56', options: {}, expected: '12.34' },
    { input: '00123', options: { cutLeadingZeroes: true }, expected: '123' },
    { input: '0.1230', options: { cutEndingZeroes: true }, expected: '0.123' },
    { input: '123.', options: {}, expected: '123' },
    { input: '.123', options: {}, expected: '0.123' },
    { input: '-.123', options: {}, expected: '-0.123' },
    { input: '123,456', options: { int: true }, expected: '123' },
    { input: '-123,456', options: { int: true, onlyPositive: true }, expected: '123' },
  ]

  it('should return a function', () => {
    const { result } = renderHook(() => useFixNumber({
      cutZeroes: true,
      cutEndingZeroes: true,
      cutLeadingZeroes: true,
      onlyPositive: true,
      onlyNegative: true,
    }))

    expect(result.current).toBeInstanceOf(Function)
  })
  
  testCases.forEach(({ input, expected, options }) => {
    it(`should format '${input}' to '${expected}' with config: ${JSON.stringify(options)}`, () => {
      const { result } = renderHook(() => useFixNumber(options))
        
      let fixedNumber
      act(() => {
        fixedNumber = result.current(input)
      })
  
      expect(fixedNumber).toBe(expected)
    })
  })
})

describe('useValidateNumber', () => {
  const testCases = [
    { input: '123', options: { int: true }, expected: true },
    { input: '123.45', options: { int: true }, expected: false },
    { input: '123.45', options: { maxDigitsAfterPoint: 2 }, expected: true },
    { input: '123.456', options: { maxDigitsAfterPoint: 2 }, expected: false },
    { input: '-123', options: { onlyPositive: true }, expected: false },
    { input: '123', options: { onlyPositive: true }, expected: true },
    { input: '123', options: { onlyNegative: true }, expected: false },
    { input: '-123', options: { onlyNegative: true }, expected: true },
    { input: '123', options: { max: 100 }, expected: false },
    { input: '99', options: { max: 100 }, expected: true },
    { input: '101', options: { maxExcluding: true, max: 100 }, expected: false },
    { input: '101.11', options: { maxExcluding: true, max: 101.11 }, expected: false },
    { input: '101.11', options: { maxExcluding: true, max: 101.11 }, expected: false },
    { input: '101.11', options: { maxExcluding: true, int: true, max: 101.12 }, expected: false },
    { input: '100', options: { maxExcluding: true, max: 100 }, expected: false },
    { input: '99', options: { maxExcluding: true, max: 100 }, expected: true },
    { input: '50', options: { min: 100 }, expected: false },
    { input: '150', options: { min: 100 }, expected: true },
    { input: '100', options: { minExcluding: true, min: 100 }, expected: false },
    { input: '101', options: { minExcluding: true, min: 100 }, expected: true },
    { input: '101.11', options: { minExcluding: true, min: 101.11 }, expected: false },
  ]

  it('should return a function', () => {
    const { result } = renderHook(() => useValidateNumber({}))
    expect(result.current).toBeInstanceOf(Function)
  })

  testCases.forEach(({ input, options, expected }) => {
    it(`validates "${input}" with options ${JSON.stringify(options)} as ${expected}`, () => {
      const { result } = renderHook(() => useValidateNumber(options))
        
      let isValid
      act(() => {
        isValid = result.current(input)
      })
  
      expect(isValid).toBe(expected)
    })
  })
})

