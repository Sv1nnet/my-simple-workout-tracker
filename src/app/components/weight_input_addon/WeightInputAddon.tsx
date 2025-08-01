import { Select, SelectProps } from 'antd'

export type IWeightInputAddonProps = {
  mass_unit: {
    kg: string;
    lb: string;
  };
} & SelectProps

const WeightInputAddon = ({ mass_unit, ...props }: IWeightInputAddonProps) => (
  <Select {...props}>
    <Select.Option value="kg">{mass_unit.kg}</Select.Option>
    <Select.Option value="lb">{mass_unit.lb}</Select.Option>
  </Select>
)

export default WeightInputAddon