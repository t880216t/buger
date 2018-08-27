import React from 'react'
import { AppRegistry } from 'react-native'

import dva from './utils/dva'
import Router, { routerMiddleware, routerReducer } from './router'
import appModel from './models/app'
import homeMode from './models/home'

const app = dva({
  initialState: {},
  models: [appModel, homeMode],
  extraReducers: { router: routerReducer },
  onAction: [routerMiddleware],
  onError(e) {
    console.log('onError', e)
  },
})

export default app._store // eslint-disable-line

const App = app.start(<Router />)

AppRegistry.registerComponent('buger', () => App)
