import { createContext, FC, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Spin, SpinProps } from 'antd'

const initialContextValue = { loading: false, forceStopLoader: () => {}, stopLoaderById: () => {}, runLoader: () => {} }

export interface IAppLoaderContextValue {
  loading: boolean;
  forceStopLoader: (props?: SpinProps) => void;
  runLoader: (id: number | string, props?: SpinProps) => void;
  stopLoaderById: (id: number | string, props?: SpinProps) => void;
}

export const AppLoaderContext = createContext<IAppLoaderContextValue>(initialContextValue)

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

const SpinContainer = styled.div<{ $show: boolean; }>`
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
  children?: ReactNode;
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

  const value = useMemo(
    () => ({ loading, runLoader, stopLoaderById, forceStopLoader }),
    [ loading, runLoader, stopLoaderById, forceStopLoader ],
  )

  return (
    <AppLoaderContext.Provider value={value}>
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

export const useAppLoaderContext = (): IAppLoaderContextValue => {
  const context = useContext(AppLoaderContext)

  if (!context) {
    console.warn('AppLoaderContext is not provided')
    return initialContextValue
  }

  return context
}
