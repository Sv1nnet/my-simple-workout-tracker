import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

const NotFound404 = () => {
  const [ count, setCount ] = useState(3)
  const navigate = useNavigate()

  useEffect(() => {
    let timeout: NodeJS.Timeout = -1 as unknown as NodeJS.Timeout

    if (count > 0) {
      timeout = setTimeout(() => setCount(count - 1), 1000)
    }
    
    if (count === 0) {
      timeout = setTimeout(() => navigate('/'), 1000)
    }

    return () => {
      clearTimeout(timeout)
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
