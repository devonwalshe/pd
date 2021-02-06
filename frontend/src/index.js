import ReactDOM from 'react-dom'
//import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

/**<React.StrictMode>
    <App />
  </React.StrictMode>, */
/*ReactDOM.render(
  <div>
    <App />
  </div>,
  document.getElementById('root')
);*/
ReactDOM.render(
  <BrowserRouter>
      <App />
  </BrowserRouter>, 
  document.getElementById('root')
)

serviceWorker.unregister();
