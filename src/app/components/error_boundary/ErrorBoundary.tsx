import { Component, PropsWithChildren } from 'react'
import { Button, Typography } from 'antd'
import { IIntlContextValue, withIntlContext } from 'app/contexts/intl/IntContextProvider'
// import Face from './components/Face'
import { ButtonWrapper, ContentContainer, ErrorContainer } from './components/styled'

class ErrorBoundary extends Component<PropsWithChildren<{ intlCtx: IIntlContextValue }>, { hasError: boolean, errorText: string }> {
  
  static getDerivedStateFromError() {
    return { hasError: true, errorText: '' }
  }
  
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorText: '' }
  }

  state = { hasError: false, errorText: '' }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // alert(error.message + ' ' + JSON.stringify(errorInfo))
    this.setState({ hasError: true, errorText: (error as { message: string }).message as string + ' ' + JSON.stringify(errorInfo as object) })

  }

  handleRefreshPage = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ContentContainer style={{ maxHeight: '500px', overflow: 'auto' }}>
            {/* <Face /> */}
            <Typography.Text>
              {/* {this.props.intlCtx.intl.error_boundaries?.main?.text} */}
              {this.state.errorText}
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