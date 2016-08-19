import { Platform } from 'react-native'
import { types } from './actions'

const initialState = {
  action: null,
  options: {},
  routes: [],
  drawerOpen: false,
  navActionRenderer: null,
  navActionHandler: null,
  navTitle: null,
  statusBarSize: Platform.OS === 'ios' ? 20 : 0,
  $$_blurEventListeners: {},
  $$_focusEventListeners: {},
  $$_statusBarConfigured: Platform.OS === 'ios',
}

const getTitle = id => (id.slice(0, 1).toUpperCase() + id.slice(1)).replace(/-/g, ' ')

const getUpdate = (action, state) => {
  let routes
  let { route, reset, ...options } = action.options
  if (action.type === types.POP_ROUTE) {
    routes = state.routes.filter((_, i) => i !== state.routes.length - 1)
    route = routes[routes.length - 1]
    if (!route) {
      throw new Error('Cannot pop the topmost route, route stack contains only 1 child.')
    }
  } else {
    if (action.type === types.PUSH_ROUTE) {
      routes = [...state.routes, route]
    } else if (action.type === types.RESET_ROUTES) {
      routes = [route]
    }
  }
  return {
    action: action.type,
    options,
    routes,
    navActionRenderer: null,
    navActionHandler: null,
    navTitle: getTitle(route),
  }
}

export default function (state = initialState, action = {}) {
  switch (action.type) {
    case types.PUSH_ROUTE:
    case types.POP_ROUTE:
    case types.RESET_ROUTES:
      return {
        ...state,
        ...getUpdate(action, state),
      }
    case types.SET_NAV_ACTION:
      return {
        ...state,
        navActionRenderer: action.renderer,
        navActionHandler: action.handler,
      }
    case types.SET_NAV_TITLE:
      return {
        ...state,
        navTitle: action.title,
      }
    case types.OPEN_DRAWER:
      return {
        ...state,
        drawerOpen: true,
      }
    case types.CLOSE_DRAWER:
      return {
        ...state,
        drawerOpen: false,
      }
    case types.ADD_BLUR_LISTENER:
    case types.ADD_FOCUS_LISTENER:
      /*  Get current route id  */
      const routeId = state.routes[state.routes.length - 1]
      const addListeners = `$$_${action.type === types.ADD_BLUR_LISTENER ? 'blur' : 'focus'}EventListeners`
      return {
        ...state,
        [addListeners]: {
          ...state[addListeners],
          [routeId]: action.listener,
        }
      }
    case types.REMOVE_BLUR_LISTENER:
    case types.REMOVE_FOCUS_LISTENER:
      const removeListeners = `$$_${action.type === types.REMOVE_BLUR_LISTENER ? 'blur' : 'focus'}EventListeners`
      const keys = Object.keys(state[removeListeners])
      const withoutListener = keys.filter(k => state[removeListeners][k] !== action.listener).map(k => state[removeListeners][k])
      return {
        ...state,
        [removeListeners]: withoutListener,
      }
    case '$$_UPDATE_STATUS_BAR_SIZE':
      return state.$$_statusBarConfigured ? state : {
        ...state,
        statusBarSize: Platform.OS === 'ios' ? 20 : action.size,
        $$_statusBarConfigured: true
      }
    default:
      return state
  }
}
