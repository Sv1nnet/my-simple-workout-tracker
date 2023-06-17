import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import cookie from 'js-cookie'

const lang = cookie.get('lang') || 'eng'

ReactDOM
  .createRoot(document.getElementById('root'))
  .render(
    <React.StrictMode>
      <App lang={lang} />
    </React.StrictMode>,
  )
