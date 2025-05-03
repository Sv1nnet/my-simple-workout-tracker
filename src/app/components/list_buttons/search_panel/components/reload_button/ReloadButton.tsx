import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Spin } from 'antd'
import { styled } from 'styled-components'

export const StyledButton = styled(Button)`
  margin-left: 5px;
  flex-shrink: 0;
  flex-basis: 46px;
  height: 40px;
`

export interface ReloadButtonProps {
  loading: boolean,
  refetch: () => void,
}

const ReloadButton = ({ loading, refetch }: ReloadButtonProps) => loading
  ? (
    <StyledButton>
      <Spin size="small" indicator={<LoadingOutlined />} />
    </StyledButton>
  )
  : (
    <StyledButton onClick={refetch}>
      <ReloadOutlined />
    </StyledButton>
  )

export default ReloadButton
