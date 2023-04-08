import { Dayjs } from 'dayjs'
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs'
import generatePicker from 'antd/lib/date-picker/generatePicker'
import 'antd/lib/date-picker/style/index'
import { PickerProps } from 'antd/es/date-picker/generatePicker'

const DefaultDatePicker = generatePicker<Dayjs>(dayjsGenerateConfig)

const DatePicker = (props: PickerProps<Dayjs>) => <DefaultDatePicker dropdownClassName="stylized-date-picker" {...props} />

export default DatePicker
