import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Spin } from 'antd'

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

const TabLabel = ({ loading, label }) => (
  <>
    <span>{label}</span>
    {loading && (
      <LoaderContainer>
        <StyledSpinner />
      </LoaderContainer>
    )}
  </>
)
TabLabel.propTypes = {
  loading: PropTypes.bool,
  label: PropTypes.string,
}

export default TabLabel
