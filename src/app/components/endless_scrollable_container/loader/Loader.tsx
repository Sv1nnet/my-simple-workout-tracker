import { ReactNode } from 'react'
import styled from 'styled-components'

const LoaderText = styled.div`
  position: absolute;
  bottom: 20px;
  width: 100%;
  font-size: 18px;
  text-align: center;
  color: var(--text-color);
`

const LoaderContainer = styled.div`
  position: relative;
  height: 0;
`

const Loader = ({ children }: { children: ReactNode }) => (
  <LoaderContainer>
    <LoaderText>{children}</LoaderText>
  </LoaderContainer>
)

export default Loader
