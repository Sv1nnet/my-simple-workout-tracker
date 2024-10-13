import dayjs, { Dayjs } from 'dayjs'
import * as React from 'react'
import DatePicker from 'app/components/date_picker/DatePicker'
import { PickerTimeProps } from 'antd/es/date-picker/generatePicker'

export interface TimePickerProps extends Omit<PickerTimeProps<Dayjs>, 'picker'> {
  popupClassName?: string;
}

const TimePicker: React.FC<TimePickerProps> = (props) => {
  if (typeof props.value !== 'undefined' && !(props.value instanceof dayjs)) console.warn('Value of TimePicker is not a dayjs instance')
  return <DatePicker {...props} popupClassName={`stylized-time-picker${props.popupClassName ? ` ${props.popupClassName}` : ''}`} picker="time" mode={undefined} />
}

TimePicker.displayName = 'TimePicker'

export default TimePicker
