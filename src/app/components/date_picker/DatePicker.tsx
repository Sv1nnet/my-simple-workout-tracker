import { Dayjs } from 'dayjs'
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs'
import generatePicker from 'antd/lib/date-picker/generatePicker'
import 'antd/lib/date-picker/style/index'

const DefaultDatePicker = generatePicker<Dayjs>(dayjsGenerateConfig)

const DatePicker = props => <DefaultDatePicker dropdownClassName="stylized-date-picker" {...props} />

export default DatePicker
