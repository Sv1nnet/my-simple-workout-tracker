import styled from 'styled-components'
import { Spin } from 'antd'
import { FC, HTMLProps } from 'react'
import { theme } from 'src/styles/vars'

const LoaderContainer = styled.div`
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, .8);
`

const StyledSpinner = styled(Spin)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

const Text = styled.div`
  text-align: center;
  height: 100%;
  align-items: center;
  flex-grow: 1;
  display: grid;
  border-top: 2px solid ${theme.borderColorBase};
`

export interface ITabLabel extends Omit<HTMLProps<HTMLDivElement>, 'onClick'> {
  label: string;
  tab: string;
  loading?: boolean;
  loaderProps?: object;
  onClick?: Function;
}

const TabLabel: FC<ITabLabel> = ({ loading, label, loaderProps, tab, onClick, ...rest }) => {
  const handleLabelClick = (e) => {
    if (typeof onClick === 'function') onClick(tab, e)
  }

  return (
    <>
      <Text {...rest} onClick={handleLabelClick}>{label}</Text>
      {loading && (
        <LoaderContainer {...loaderProps}>
          <StyledSpinner />
        </LoaderContainer>
      )}
    </>
  )
}

export default TabLabel
