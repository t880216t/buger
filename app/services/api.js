import { stringify } from 'qs'
import request from '../utils/request'

export async function queryUserInfo(params) {
  return request(`${params.domain.toString()}/rest/auth/latest/session`,{
    method: 'POST',
    body:{
      username:params.userName.toString(),
      password:params.password.toString(),
    }
  })
}

export async function queryBugList(params) {
  return request(`${params.domain.toString()}/rest/api/latest/search`,{
    method: 'POST',
    body:params.params,
    headers:params.headers,
  })
}

export async function setTransitions(params) {
  return request(`${params.domain.toString()}/rest/api/latest/issue/${params.key.toString()}/transitions`,{
    method: 'POST',
    body:params.params,
  })
}

export async function submitCommet(params) {
  return request(`${params.domain.toString()}/rest/api/2/issue/${params.key.toString()}/comment`,{
    method: 'POST',
    body:params.params,
  })
}

export async function submitBug(params) {
  return request(`${params.domain.toString()}/rest/api/latest/issue`,{
    method: 'POST',
    body:params.params,
  })
}

export async function queryBugTransitions(params) {
  return request(`${params.domain.toString()}/rest/api/latest/issue/${params.key.toString()}/transitions`)
}

export async function queryFavourite(params) {
  return request(`${params.domain.toString()}/rest/api/latest/filter/favourite`)
}

export async function queryProjectList(params) {
  return request(`${params.domain.toString()}/rest/api/latest/project`)
}

export async function queryCreatemeta(params) {
  return request(`${params.domain.toString()}/rest/api/latest/issue/createmeta?issuetypeIds=1&expand=projects.issuetypes.fields&projectKeys=${params.key.toString()}`)
}

export async function querySearchAssignee(params) {
  return request(`${params.domain.toString()}/rest/api/latest/user/assignable/search?project=${params.key.toString()}&username=${params.searchWord.toString()}`)
}

export async function queryBugDetail(params) {
  return request(`${params.domain.toString()}/rest/api/latest/issue/${params.id.toString()}`)
}

export async function queryLoginUserInfo(params) {
  return request(`${params.domain.toString()}/rest/api/latest/user?username=${params.userName.toString()}`)
}

export async function queryLoginWithCaptcha(params) {
  return request(`${params.domain.toString()}/login.jsp`,{
    method:'POST',
    body:{
      os_username:params.userName.toString(),
      os_password:params.password.toString(),
      os_captcha:params.captcha.toString(),
      os_destination:'',
      atl_token:'',
      login:'Log In',
    },
    customType: 'application/x-www-form-urlencoded'
  })
}

export async function submitAttach(params) {
  return request(`${params.domain.toString()}/rest/api/latest/issue/${params.submitBugKey.toString()}/attachments`,{
    method:'POST',
    body: params.params,
    customType: 'multipart/form-data',
    headers:{
      'X-Atlassian-Token': 'nocheck',
    }
  })
}

export function sum(a,b) {
  return (a+b)
}
