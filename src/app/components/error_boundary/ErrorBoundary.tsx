import { Component, PropsWithChildren } from 'react'
import { Button, Typography } from 'antd'
import { IIntlContextValue, withIntlContext } from 'app/contexts/intl/IntContextProvider'
import Face from './components/Face'
import { ButtonWrapper, ContentContainer, ErrorContainer } from './components/styled'


class ErrorBoundary extends Component<PropsWithChildren<{ intlCtx: IIntlContextValue }>, { hasError: boolean }> {
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