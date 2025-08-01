import { StyledTitle } from './components'
import { FC } from 'react'
import { Dayjs } from 'dayjs'

export interface ITitle {
  title: string
  repeats: number | string
  time: number | string | Dayjs
  weight: number | string
  massUnit: string
  payloadDictionary: Record<string, { [key: string]: any }>
}

const Title: FC<ITitle> = ({ title }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <StyledTitle level={4}>{title}</StyledTitle>
  </div>
)

export default Title