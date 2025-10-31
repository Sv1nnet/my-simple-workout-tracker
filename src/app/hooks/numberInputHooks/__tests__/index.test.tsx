import { renderHook } from '@testing-library/react'
import { useFixNumber } from '../index'

describe('useFixNumber hook', () => {
  it('should handle decimal points correctly', () => {
    const { result } = renderHook(() => useFixNumber({ isCommaDecimalPoint: true }))

    expect(result.current('123,45')).toBe('123,45')
    expect(result.current('123.45')).toBe('123,45')
    expect(result.current('123.')).toBe('123')
    expect(result.current('123,')).toBe('123')
  })

  it('should handle negative numbers', () => {
    const { result } = renderHook(() => useFixNumber())

    expect(result.current('--1')).toBe('-1')
  })

  it('should handle zero cases', () => {
    const { result } = renderHook(() => useFixNumber())

    expect(result.current('')).toBe('')
    expect(result.current('-')).toBe('0')
    expect(result.current('.')).toBe('0')
    expect(result.current(',')).toBe('0')
    expect(result.current('-.')).toBe('0')
    expect(result.current('-,')).toBe('0')
  })

  it('should handle integer conversion', () => {
    const { result } = renderHook(() => useFixNumber({ int: true }))

    expect(result.current('123.45')).toBe('123')
    expect(result.current('123,45')).toBe('123')
  })

  it('should handle max digits after point', () => {
    const { result } = renderHook(() => useFixNumber({ maxDigitsAfterPoint: 2 }))

    expect(result.current('123.456')).toBe('123.45')
    expect(result.current('123,456')).toBe('123.45')
  })

  it('should handle positive/negative restrictions', () => {
    const { result } = renderHook(() => useFixNumber({ onlyPositive: true }))

    expect(result.current('-123')).toBe('123')

    const { result: result2 } = renderHook(() => useFixNumber({ onlyNegative: true }))

    expect(result2.current('123')).toBe('-123')
  })
})
