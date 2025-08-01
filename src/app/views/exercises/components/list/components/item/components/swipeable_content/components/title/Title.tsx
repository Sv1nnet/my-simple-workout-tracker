import { StyledTitle } from './components'

export type TitleProps = {
  title: string
  payloadDictionary: Record<string, { [key: string]: any }>
}

const Title = ({ title }: TitleProps) => (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <StyledTitle level={4}>{title}</StyledTitle>
  </div>
)

export default Title