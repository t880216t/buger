/* eslint-disable object-shorthand */
import {createAction, NavigationActions, Storage} from "../utils"
import {
  queryBugTransitions,
  queryBugList,
  setTransitions,
  submitCommet,
  queryBugDetail,
  queryFavourite,
  queryProjectList,
  queryCreatemeta,
  querySearchAssignee,
  submitBug,
  submitAttach,
} from "../services/api"

export default {
  namespace: 'home',
  state: {
    issues:[],
    transitions:[],
    domain:null,
    detailItem:{},
    favouriteList:[],
    projectList:[],
    createmeta:{},
    assigneeList:[],
    submitBugKey:null,
    projectData:null,
    fixVersion:null,
  },
  reducers: {
    updateState(state, {payload}) {
      return {...state, ...payload}
    },
  },
  effects: {
    *loadStorage(action, { call, put }) {
      const storageData = yield call(Storage.multiGet, 'domain','projectData','fixVersion')
      const domain = storageData.domain?storageData.domain:null
      const fixVersion = storageData.fixVersion?storageData.fixVersion:null
      const projectData = storageData.projectData?storageData.projectData:null
      yield put(createAction('updateState')({
        domain,
        fixVersion,
        projectData,
        loading: false
      }))
    },
    *queryBugList({ payload }, { call, put }) {
      const result = yield call(queryBugList, payload)
      if (result) {
        yield put(createAction('updateState')({  issues: result.issues ,domain:payload.domain}))
      }
    },

    *queryBugTransitions({ payload }, { call, put }) {
      const result = yield call(queryBugTransitions, payload)
      if (result) {
        yield put(createAction('updateState')({  transitions: result.transitions }))
      }
    },

    *setTransitions({ payload }, { call, put }) {
      const result = yield call(setTransitions, payload)
      if (result) {
        console.log("result",result)
      }
    },

    *submitCommet({ payload }, { call, put }) {
      const result = yield call(submitCommet, payload)
      if (result) {
        console.log("result",result)
      }
    },

    *submitBug({ payload }, { call, put }) {
      const result = yield call(submitBug, payload)
      if (result) {
        Storage.set('projectData',payload.projectData)
        if(payload.fixVersion){
          Storage.set('fixVersion',payload.fixVersion)
        }
        yield put(createAction('updateState')({ submitBugKey: result.key }))
      }
    },

    *queryBugDetail({ payload }, { call, put }) {
      const result = yield call(queryBugDetail, payload)
      if (result) {
        yield put(createAction('updateState')({ detailItem: result }))
      }
    },

    *queryFavourite({ payload }, { call, put }) {
      const result = yield call(queryFavourite, payload)
      if (result) {
        yield put(createAction('updateState')({ favouriteList: result }))
      }
    },

    *queryProjectList({ payload }, { call, put }) {
      const result = yield call(queryProjectList, payload)
      if (result) {
        yield put(createAction('updateState')({ projectList: result }))
      }
    },

    *queryCreatemeta({ payload }, { call, put }) {
      const result = yield call(queryCreatemeta, payload)
      if (result) {
        yield put(createAction('updateState')({ createmeta: result }))
      }
    },

    *querySearchAssignee({ payload }, { call, put }) {
      const result = yield call(querySearchAssignee, payload)
      if (result) {
        yield put(createAction('updateState')({ assigneeList: result }))
      }
    },

    *submitAttach({ payload }, { call, put }) {
      const result = yield call(submitAttach, payload)
      if (result) {
        console.log(result)
      }
    },
  },
  subscriptions: {
    setup({dispatch}) {
      dispatch({type: 'loadStorage'})
    },
  },
}
