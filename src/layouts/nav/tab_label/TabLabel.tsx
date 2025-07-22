import styled from 'styled-components'
import { Spin } from 'antd'
import { FC, HTMLProps, ReactNode } from 'react'

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

const Label = styled.div`
  text-align: center;
  height: 100%;
  align-items: center;
  flex-grow: 1;
  display: grid;
  border-top: 2px solid var(--nav-border-color);
  font-size: 40px;
`

export interface ITabLabel extends Omit<HTMLProps<HTMLDivElement>, 'onClick' | 'label'> {
  label: ReactNode;
  tab: string;
  loading?: boolean;
  loaderProps?: object;
  onClick?: Function;
}

const TabLabel: FC<ITabLabel> = ({ loading, label, loaderProps, tab, onClick, ...rest }) => {
  const handleLabelClick = (e: React.MouseEvent<HTMLDivElement>) => onClick?.(tab, e)

  return (
    <>
      <Label {...rest} onClick={handleLabelClick}>{label}</Label>
      {loading && (
        <LoaderContainer {...loaderProps}>
          <StyledSpinner />
        </LoaderContainer>
      )}
    </>
  )
}

export default TabLabel
