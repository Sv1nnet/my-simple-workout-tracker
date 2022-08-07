import styled from 'styled-components'

export const Header = styled.h4`
  border: 1px solid lightgrey;
  border-top: none;
  border-left: none;
  margin-bottom: 0;
`

const HistoryItemHeader = ({ children }) => <Header>{children}</Header>

export default HistoryItemHeader
