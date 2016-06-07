import '../assets/stylesheets/index.css'
import 'weui'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Root, { store } from './Root'

// All modern browsers, except `Safari`, have implemented
// the `ECMAScript Internationalization API`.
start()

function start () {
  ReactDOM.render(
    <Provider store={store}>
      <Root />
    </Provider>
  , document.getElementById('app'))
}
