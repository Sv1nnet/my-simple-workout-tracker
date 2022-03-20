import dayjs, { Dayjs } from 'dayjs'
import * as React from 'react'
import DatePicker from '@/src/app/components/date_picker/DatePicker'
import { PickerTimeProps } from 'antd/es/date-picker/generatePicker'

export interface TimePickerProps extends Omit<PickerTimeProps<Dayjs>, 'picker'> {
}

const TimePicker = React.forwardRef<any, TimePickerProps>((props, ref) => {
  if (typeof props.value !== 'undefined' && !(props.value instanceof dayjs)) console.warn('Value of TimePicker is not a dayjs instance')
  return <DatePicker {...props} picker="time" mode={undefined} ref={ref} />
})

TimePicker.displayName = 'TimePicker'

export default TimePicker
