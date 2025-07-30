import { createContext, FC, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { Spin, SpinProps } from 'antd'

const initialContextValue = { loading: false, forceStopLoader: () => {}, stopLoaderById: () => {}, runLoader: () => {}, forceRunLoader: () => {} }

export interface IAppLoaderContextValue {
  loading: boolean;
  runLoader: (id: number | string, props?: IAppLoader['loaderProps']) => void;
  forceRunLoader: (id: number | string, props?: IAppLoader['loaderProps']) => void;
  forceStopLoader: (props?: IAppLoader['loaderProps']) => void;
  stopLoaderById: (id: number | string, props?: IAppLoader['loaderProps']) => void;
}

export const AppLoaderContext = createContext<IAppLoaderContextValue>(initialContextValue)

const StyledSpin = styled(Spin)`
  position: fixed;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: var(--loader-background-color);
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
          top: calc(50% - 72px - var(--statusbar-height));
          color: var(--loader-text-color);
          text-shadow: 0 1px 2px var(--loader-text-shadow-color);
        }
      }
    }
  }
`

export interface IAppLoader {
  loaderProps?: {
    containerProps?: React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>,
    spinProps?: SpinProps
  };
  children?: ReactNode;
}

const AppLoaderProvider: FC<IAppLoader> = ({ children, loaderProps: _loaderProps }) => {
  const [ loading, setLoading ] = useState(false)
  const [ loaderRunnerId, setLoaderRunnerId ] = useState(null)
  const loaderRunnerIdRef = useRef(loaderRunnerId)
  const forcedRunnerIdRef = useRef<string[]>([])
  const [ loaderProps, setLoaderProps ] = useState<IAppLoader['loaderProps']>(_loaderProps)

  const forceRunLoader = useCallback((id, props: IAppLoader['loaderProps'] = {}) => {
    setLoading(true)
    setLoaderProps(props)
    setLoaderRunnerId(id)
    forcedRunnerIdRef.current.push(id)
  }, [])

  const runLoader = useCallback((id, props: IAppLoader['loaderProps'] = {}) => {
    setLoading(true)
    setLoaderProps(props)
    setLoaderRunnerId(id)
    loaderRunnerIdRef.current = id
  }, [])

  const stopLoaderById = useCallback((id, props: IAppLoader['loaderProps'] = {}) => {
    if (forcedRunnerIdRef.current.includes(id)) {
      forcedRunnerIdRef.current = forcedRunnerIdRef.current.filter(i => i !== id)

      if (forcedRunnerIdRef.current.length === 0) {
        loaderRunnerIdRef.current = null
        setLoaderRunnerId(null)
        setLoading(false)
        setLoaderProps(props)
      }

      return
    }

    if (forcedRunnerIdRef.current.length > 0 || id !== loaderRunnerIdRef.current) return

    setLoaderRunnerId(null)
    setLoading(false)
    setLoaderProps(props)
  }, [])

  const forceStopLoader = useCallback((props: IAppLoader['loaderProps'] = {}) => {
    setLoading(false)
    setLoaderProps(props)
    setLoaderRunnerId(null)
    loaderRunnerIdRef.current = null
    forcedRunnerIdRef.current = []
  }, [])

  const value = useMemo(
    () => ({ loading, runLoader, stopLoaderById, forceStopLoader, forceRunLoader }),
    [ loading, runLoader, stopLoaderById, forceStopLoader, forceRunLoader ],
  )

  return (
    <AppLoaderContext.Provider value={value}>
      <SpinContainer $show={loading} {...loaderProps.containerProps}>
        <StyledSpin size="large" {...loaderProps.spinProps} spinning={loading}>
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
