import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const NotFound404 = () => {
  const [ count, setCount ] = useState(3)
  const router = useRouter()

  useEffect(() => {
    if (count > 0) {
      setTimeout(() => setCount(count - 1), 1000)
      return
    }
    
    if (count === 0) {
      setTimeout(() => router.push('/'), 1000)
    }
  }, [ count ])

  return (
    <div>
      <h2>Not Found 404</h2>
      <p>You will be redirected in {count}</p>
    </div>
  )
}

export default NotFound404
