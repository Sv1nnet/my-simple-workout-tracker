import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Spin } from 'antd'
import { FC, HTMLProps } from 'react'

const LoaderContainer = styled.div`
position: absolute;
left: 0;
top: 0;
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

export interface ITabLabel extends Omit<HTMLProps<HTMLSpanElement>, 'onClick'> {
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
      <span {...rest} onClick={handleLabelClick}>{label}</span>
      {loading && (
        <LoaderContainer {...loaderProps}>
          <StyledSpinner />
        </LoaderContainer>
      )}
    </>
  )
}
TabLabel.propTypes = {
  loading: PropTypes.bool,
  label: PropTypes.string,
}

export default TabLabel
