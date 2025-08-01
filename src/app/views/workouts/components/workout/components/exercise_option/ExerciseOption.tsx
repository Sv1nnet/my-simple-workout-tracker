import styled from 'styled-components'
import { Typography } from 'antd'
import { FC } from 'react'

const OptionContainer = styled.div<{ $disabled: boolean }>`
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  align-items: center;
  .ant-typography {
    color: ${({ $disabled }) => $disabled ? 'var(--disabled-color)' : ''};
    text-wrap: auto;
    text-wrap-mode: wrap;
  }
  .ant-typography-secondary {
    font-size: 14px;
  }
`

export interface IExerciseOption {
  archived: boolean;
  title: string;
}

const ExerciseOption: FC<IExerciseOption> = ({ archived, title }) => (
  <OptionContainer $disabled={archived}>
    <Typography.Title level={5} style={{ width: '100%', margin: 0, lineHeight: 1 }}>{title}</Typography.Title>
  </OptionContainer>
)

export default ExerciseOption
