import { Component, PropsWithChildren } from 'react'
import styled from 'styled-components'
import { Button, Typography } from 'antd'
import { theme } from 'src/styles/vars'
import { IIntelContext, withIntlContext } from 'app/contexts/intl/IntContextProvider'

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

const SmileBody = styled.div`
  position: relative;
  margin: -50px auto 50px;
  width: 200px;
  height: 200px;
  border: 10px solid ${theme.primaryColor};
  border-radius: 50%;
`
const SmileEyeContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 50px;
  padding: 0 10px;
`

const SmileEye = styled.div`
  width: 20px;
  height: 20px;
  background: ${theme.primaryColor};
  border-radius: 50%;
`

const SmileMouth = styled.div`
  margin: auto;
  margin-top: 50px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: ${theme.primaryColor};
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
            <SmileBody>
              <SmileEyeContainer>
                <SmileEye />
                <SmileEye />
              </SmileEyeContainer>
              <SmileMouth />
            </SmileBody>
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