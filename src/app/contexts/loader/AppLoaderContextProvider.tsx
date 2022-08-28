import { createContext, FC, useCallback, useState } from 'react'
import styled from 'styled-components'
import { Spin, SpinProps } from 'antd'

export interface IContextValue {
  loading: boolean;
  forceStopLoader: (props?: SpinProps) => void;
  runLoader: (id: number | string, props?: SpinProps) => void;
  stopLoaderById: (id: number | string, props?: SpinProps) => void;
}

export const AppLoaderContext = createContext<IContextValue>({ loading: false, forceStopLoader: () => {}, stopLoaderById: () => {}, runLoader: () => {} })

const StyledSpin = styled(Spin)`
  position: fixed;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(255, 255, 255, .6);
  z-index: 999;

  & .ant-spin-dot.ant-spin-dot-spin {
    top: 40%;
  }
`

const SpinContainer = styled.div`
  display: ${({ $show }) => $show ? 'block' : 'none'};
  position: fixed;
  top: 72px;
  left: 0;
  height: 100%;
  z-index: 999;
  width: 100%;

  & .ant-spin-nested-loading {
    height: 100%;
    width: 100%;

    & > div {
      height: 100%;
      width: 100%;

      & > ${StyledSpin} {
        max-height: 100%;

        & > .ant-spin-dot.ant-spin-dot-spin, & > .ant-spin-text {
          top: calc(50% - 72px);
        }
      }
    }
  }
`

export interface IAppLoader {
  loaderProps?: SpinProps;
}

const AppLoaderProvider: FC<IAppLoader> = ({ children, loaderProps: _loaderProps }) => {
  const [ loading, setLoading ] = useState(false)
  const [ loaderRunnerId, setLoaderRunnerId ] = useState(null)
  const [ loaderProps, setLoaderProps ] = useState<SpinProps>(_loaderProps)

  const runLoader = useCallback((id, props = {}) => {
    setLoading(true)
    setLoaderProps(props)
    setLoaderRunnerId(id)
  }, [])

  const stopLoaderById = useCallback((id, props = {}) => {
    if (id !== loaderRunnerId) return

    setLoaderRunnerId(null)
    setLoading(false)
    setLoaderProps(props)
  }, [ loaderRunnerId ])

  const forceStopLoader = useCallback((props = {}) => {
    setLoading(false)
    setLoaderProps(props)
    setLoaderRunnerId(null)
  }, [])

  return (
    <AppLoaderContext.Provider value={{ loading, runLoader, stopLoaderById, forceStopLoader }}>
      <SpinContainer $show={loading}>
        <StyledSpin size="large" {...loaderProps} spinning={loading}>
          <span />
        </StyledSpin>
      </SpinContainer>
      {children}
    </AppLoaderContext.Provider>
  )
}

AppLoaderProvider.defaultProps = {
  loaderProps: {},
}

export default AppLoaderProvider
