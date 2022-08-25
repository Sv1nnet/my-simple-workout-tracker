import type { NextPage } from 'next'
import { FC, useEffect } from 'react'
import withAuth, { GetServerSidePropsContextWithSession } from 'store/utils/withAuth'
import { ActivityTemplate } from 'layouts/main'
import { IActivityProps } from 'app/views/activities/components/activity/Activity'
import { activityApi } from 'app/store/slices/activity/api'
import { ActivityForm } from 'app/store/slices/activity/types'
import { useRouter } from 'next/router'
import { Activity } from 'app/views'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'

interface ICreatePage {
  setActivity: React.Dispatch<React.SetStateAction<IActivityProps>>
}

const CreateActivity: NextPage<ICreatePage> & { Layout: FC, layoutProps?: {} } = () => {
  const [ create, { data, isLoading, isError, error } ] = activityApi.useCreateMutation()
  const router = useRouter()

  const handleSubmit = (values: ActivityForm<string>) => create({ activity: values })

  useEffect(() => {
    if (!isError && data) router.push('/activities')
  }, [ isLoading ])

  return (
    <Activity
      initialValues={data?.data}
      isFetching={isLoading || (!!data && !isError)}
      isError={isError}
      onSubmit={handleSubmit}
      error={(error as CustomBaseQueryError)?.data?.error?.message?.text}
    />
  )
}

CreateActivity.Layout = ActivityTemplate
CreateActivity.layoutProps = { tab: 'activity' }

export default CreateActivity

export const getServerSideProps = withAuth(async (ctx: GetServerSidePropsContextWithSession) => {
  if (ctx.req.session) {
    return {
      props: {
        token: ctx.req.session.token,
      },
    }
  }
  return ({ props: {} })
})
