import { Typography } from 'antd'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import styled from 'styled-components'

const TextContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

export type NoDataTextProps = {
  children?: React.ReactNode
}

const NoDataText = ({ children }: NoDataTextProps) => {
  const { intl } = useIntlContext()

  return (
    <TextContainer>
      <Typography.Text type='secondary'>{children || intl.common.empty_list}</Typography.Text>
    </TextContainer>
  )
}

export default NoDataText
