import { useEffect } from 'react'
import { activityApi } from 'app/store/slices/activity/api'
import { ActivityForm } from 'app/store/slices/activity/types'
import { useNavigate } from 'react-router-dom'
import { Activity } from 'app/views'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'


const CreateActivity = () => {
  const [ create, { data, isLoading, isError, error } ] = activityApi.useCreateMutation()
  const { lang } = useIntlContext()
  const navigate = useNavigate()

  const handleSubmit = (values: ActivityForm<string>) => create({ activity: values })

  useEffect(() => {
    if (!isError && data) navigate('/activities')
  }, [ isLoading ])

  return (
    <Activity
      initialValues={data?.data}
      isFetching={isLoading || (!!data && !isError)}
      isError={isError}
      onSubmit={handleSubmit}
      error={(error as CustomBaseQueryError)?.data?.error?.message?.text?.[lang || 'eng']}
    />
  )
}

export default CreateActivity
