import { Component, PropsWithChildren } from 'react'
import styled from 'styled-components'
import { Button, Typography } from 'antd'
import { IIntelContext, withIntlContext } from 'app/contexts/intl/IntContextProvider'
import Face from './components/Face'

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: white;
`

const ContentContainer = styled.div`
  margin: auto;
  max-width: 375px;
  padding: 15px;
  text-align: center;
`

const ButtonWrapper = styled.div`
  padding: 15px;
  box-sizing: border-box;
`

class ErrorBoundary extends Component<PropsWithChildren<{ intlCtx: IIntelContext }>, { hasError: boolean }> {
  static getDerivedStateFromError() {
    return { hasError: true }
  }

  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  handleRefreshPage = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ContentContainer>
            <Face />
            <Typography.Text>
              {this.props.intlCtx.intl.error_boundaries?.main?.text}
            </Typography.Text>
          </ContentContainer>
          <ButtonWrapper>
            <Button block size="large" type="primary" onClick={this.handleRefreshPage}>
              {this.props.intlCtx.intl.error_boundaries?.main?.button}
            </Button>
          </ButtonWrapper>
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}

export default withIntlContext(ErrorBoundary)