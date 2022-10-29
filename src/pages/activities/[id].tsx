import type { NextPage } from 'next'
import { FC, useContext, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { MainTemplate } from '@/src/layouts/main'
import handleJwtStatus from '@/src/app/utils/handleJwtStatus'
import { ActivityForm, GetActivityError, GetActivitySuccess, IActivityFormData } from '@/src/app/store/slices/activity/types'
import routes from '@/src/app/constants/end_points'
import { CustomBaseQueryError } from '@/src/app/store/utils/baseQueryWithReauth'
import { Activity } from '@/src/app/views'
import { activityApi } from '@/src/app/store/slices/activity/api'
import { useRouter } from 'next/router'
import { IntlContext } from 'app/contexts/intl/IntContextProvider'

interface IActivityPage {
  activity: ActivityForm<string>;
  error: string;
}

const EditActivity: NextPage<IActivityPage> & { Layout: FC, layoutProps?: {} } = ({ activity, error: serverError }) => {
  const router = useRouter()
  const { lang } = useContext(IntlContext)
  const [
    get,
    {
      data: dataOfGet,
      isLoading: isLoading_get,
      isFetching: isFetching_get,
      error: errorGet,
    },
  ] = activityApi.useLazyGetQuery()
  const [
    update,
    {
      data: dataOfUpdate,
      isLoading: isLoading_update,
      error: errorUpdate,
    },
  ] = activityApi.useUpdateMutation()
  const [
    deleteActivity,
    {
      isLoading: isLoading_delete,
      error: errorDelete,
    },
  ] = activityApi.useDeleteMutation()

  const handleSubmit = (values: IActivityFormData) => update({ activity: values })

  const handleDelete = async id => deleteActivity({ id }).then((res) => {
    if (!('error' in res)) router.replace('/activities')
    return res
  })

  useEffect(() => {
    if (!activity) get({ id: router.query.id as string })
  }, [])

  let error
  if (errorGet ) {
    error = 'error' in errorGet
      ? errorGet.error
      : (errorGet as CustomBaseQueryError)?.data?.error?.message?.text[lang || 'eng']
  } else if (errorUpdate) {
    error = 'error' in errorUpdate
      ? errorUpdate.error
      : (errorUpdate as CustomBaseQueryError)?.data?.error?.message?.text[lang || 'eng']
  } else if (errorDelete) {
    error = 'error' in errorDelete
      ? errorDelete.error
      : (errorDelete as CustomBaseQueryError)?.data?.error?.message?.text[lang || 'eng']
  }

  return (
    <Activity
      isEdit
      isError={!!error}
      errorCode={(errorGet as CustomBaseQueryError)?.data?.error?.code}
      errorAppCode={(errorGet as CustomBaseQueryError)?.data?.error?.appCode}
      initialValues={dataOfUpdate?.data ?? dataOfGet?.data ?? activity}
      isFetching={isLoading_get || isFetching_get || isLoading_update || isLoading_delete}
      onSubmit={handleSubmit}
      error={error || serverError}
      deleteActivity={handleDelete}
    />
  )
}

EditActivity.Layout = MainTemplate
EditActivity.layoutProps = { tab: 'activities' }

export default EditActivity

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    const [ ,,id ] = ctx.resolvedUrl.split('/')
    try {
      let res: GetActivitySuccess | GetActivityError = await fetch(`${routes.activity.v1.base.full}/${id}`, {
        headers: {
          Authorization: `Bearer ${ctx.req.session.token}`,
        },
      }).then(r => r.json())
  
      return handleJwtStatus(res, () => ({
        props: {
          activity: res.data,
        },
      }))
    } catch (error) {
      return {
        props: {
          activity: null,
          error: error.errno.includes('ECONNREFUSED') ? 'Connection error' : 'Something has gone wrong. Please try again.',
        },
      }
    }
  }
  return { props: {} }
})
