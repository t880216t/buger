/* eslint-disable object-shorthand,no-restricted-syntax,no-useless-return */
import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  StatusBar,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native'
import { connect } from 'react-redux'
import { List, ImagePicker, Picker } from 'antd-mobile-rn'
import Toast from 'react-native-root-toast'
import { Loading } from '../components/NetworkLoading'
import CallOnceInInterval from '../components/CallOnceInInterval'

import { NavigationActions } from '../utils'

const Item = List.Item

@connect(({ app, home }) => ({ ...app, ...home }))
export default class AddPage extends Component {
  state = {
    description:
      '前置条件：' +
      '\n' +
      '\n' +
      '\n' +
      '步骤:' +
      '\n' +
      '\n' +
      '\n' +
      '预期结果：',
    summary: null,
    files: [],
    projectList: [],
    fixVersions: null,
    assigneeList: [],
    customItems: null,
    subCustomItems: [],
    projectData: this.props.projectData,
    fixVersion: this.props.fixVersion ? this.props.fixVersion : null,
    assigneeName: null,
  }

  componentWillMount() {
    this.props
      .dispatch({
        type: 'home/queryProjectList',
        payload: {
          domain: this.props.domain,
        },
      })
      .then(() => {
        const { projectList } = this.props
        if (projectList) {
          const formatProjectList = []
          projectList.forEach(item => {
            const formatPorjectListItem = {}
            formatPorjectListItem.id = item.id
            formatPorjectListItem.label = item.name
            formatPorjectListItem.value = item.key
            formatProjectList.push(formatPorjectListItem)
          })
          this.setState(
            {
              projectList: formatProjectList,
            },
            () => {
              if (this.state.projectData) {
                this.loadStorageProject(this.state.projectData)
              }
            }
          )
        }
      })
  }

  handleFileChange = (files: any) => {
    this.setState({
      files,
    })
  }

  loadStorageProject = value => {
    Loading.show()
    this.props
      .dispatch({
        type: 'home/queryCreatemeta',
        payload: {
          domain: this.props.domain,
          key: value,
        },
      })
      .then(() => {
        Loading.hidden()
        const { createmeta } = this.props
        if (createmeta && createmeta.projects.length > 0) {
          const formatFixVersions = []
          try {
            createmeta.projects[0].issuetypes[0].fields.fixVersions.allowedValues.forEach(
              item => {
                if (!item.released) {
                  const formatFixVersionsItem = {}
                  formatFixVersionsItem.id = item.id
                  formatFixVersionsItem.label = item.name
                  formatFixVersionsItem.value = item.name
                  formatFixVersions.push(formatFixVersionsItem)
                }
              }
            )
          } catch (err) {
            Toast.show('该项目没有可指定的解决版本', {
              duration: Toast.durations.LONG,
              position: Toast.positions.CENTER,
            })
          }
          const customItems = []
          const customCreatemeta = createmeta.projects[0].issuetypes[0].fields
          for (const item in customCreatemeta) {
            if (
              customCreatemeta[item].required &&
              customCreatemeta[item].allowedValues &&
              item.indexOf('customfield') > -1
            ) {
              const formateData = []
              customCreatemeta[item].allowedValues.forEach(AVitem => {
                const formatItem = {}
                formatItem.label = AVitem.value
                formatItem.value = AVitem.id
                formateData.push(formatItem)
              })
              const formatItem = {
                customfieldId: item,
                customfieldName: customCreatemeta[item].name,
                customfieldValues: formateData,
              }
              customItems.push(formatItem)
            }
          }
          const subCustomItems = []
          customItems.forEach(item => {
            subCustomItems.push([
              item.customfieldId,
              item.customfieldValues[0].value,
            ])
          })
          this.setState(
            {
              fixVersions:
                formatFixVersions.length > 0 ? formatFixVersions : null,
              projectData: value,
              customItems: customItems.length === 0 ? null : customItems,
              subCustomItems: subCustomItems,
            },
            () => this.searchAssignee('')
          )
        } else {
          Loading.hidden()
          Toast.show('该项目信息异常，请检查配置！', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.CENTER,
          })
        }
      })
  }

  handleSelectProject = value => {
    Loading.show()
    this.props
      .dispatch({
        type: 'home/queryCreatemeta',
        payload: {
          domain: this.props.domain,
          key: value,
        },
      })
      .then(() => {
        Loading.hidden()
        const { createmeta } = this.props
        if (createmeta && createmeta.projects.length > 0) {
          const formatFixVersions = []
          try {
            createmeta.projects[0].issuetypes[0].fields.fixVersions.allowedValues.forEach(
              item => {
                if (!item.released) {
                  const formatFixVersionsItem = {}
                  formatFixVersionsItem.id = item.id
                  formatFixVersionsItem.label = item.name
                  formatFixVersionsItem.value = item.name
                  formatFixVersions.push(formatFixVersionsItem)
                }
              }
            )
          } catch (err) {
            Toast.show('该项目没有可指定的解决版本', {
              duration: Toast.durations.LONG,
              position: Toast.positions.CENTER,
            })
          }
          const customItems = []
          const customCreatemeta = createmeta.projects[0].issuetypes[0].fields
          for (const item in customCreatemeta) {
            if (
              customCreatemeta[item].required &&
              customCreatemeta[item].allowedValues &&
              item.indexOf('customfield') > -1
            ) {
              const formateData = []
              customCreatemeta[item].allowedValues.forEach(AVitem => {
                const formatItem = {}
                formatItem.label = AVitem.value
                formatItem.value = AVitem.id
                formateData.push(formatItem)
              })
              const formatItem = {
                customfieldId: item,
                customfieldName: customCreatemeta[item].name,
                customfieldValues: formateData,
              }
              customItems.push(formatItem)
            }
          }
          const subCustomItems = []
          customItems.forEach(item => {
            subCustomItems.push([
              item.customfieldId,
              item.customfieldValues[0].value,
            ])
          })
          this.setState(
            {
              fixVersions:
                formatFixVersions.length > 0 ? formatFixVersions : null,
              projectData: value,
              customItems: customItems.length === 0 ? null : customItems,
              subCustomItems: subCustomItems,
              fixVersion: null,
              assigneeName: null,
              assigneeList: [],
            },
            () => this.searchAssignee('')
          )
        } else {
          Loading.hidden()
          Toast.show('该项目信息异常，请检查配置！', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.CENTER,
          })
        }
      })
  }

  searchAssignee = text => {
    if (this.state.projectData) {
      this.props
        .dispatch({
          type: 'home/querySearchAssignee',
          payload: {
            domain: this.props.domain,
            key: this.state.projectData,
            searchWord: text,
          },
        })
        .then(() => {
          const { assigneeList } = this.props
          if (assigneeList) {
            const formatData = []
            assigneeList.forEach(item => {
              if (!item.released) {
                const formatItem = {}
                formatItem.label = item.displayName
                formatItem.value = item.name
                formatData.push(formatItem)
              }
            })
            this.setState({
              assigneeList: formatData,
              assigneeName:
                formatData.length > 0 ? [formatData[0].value] : null,
            })
          }
        })
    } else {
      Toast.show('请先选择项目！', {
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
      })
    }
  }

  checkProject = () => {
    if (!this.state.projectData) {
      Toast.show('请先选择项目！', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
      })
      return
    }
  }

  handleCustomOk = (value, itemIndex) => {
    const { subCustomItems } = this.state
    const subCustomFieldId = this.state.customItems[itemIndex].customfieldId
    subCustomItems.map((item, index) => {
      if (item[0] === subCustomFieldId) {
        const subCustomItem = [subCustomFieldId, value[0]]
        subCustomItems.splice(index, 1, subCustomItem) // 替换元素
      }
    })
    this.setState({ subCustomItems: subCustomItems })
  }

  goBack = () => {
    this.props.dispatch(
      NavigationActions.navigate({
        routeName: 'Home',
        params: { updateHome: false },
      })
    )
  }

  handleSubmit = () => {
    if (!this.state.projectData) {
      Toast.show('请先选择项目！', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
      })
      return
    }
    if (!this.state.summary) {
      Toast.show('标题不可为空！', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
      })
      return
    }
    if (!this.state.description) {
      Toast.show('描述不可为空！', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
      })
      return
    }
    if (!this.state.assigneeName) {
      Toast.show('请指定指给谁!', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
      })
      return
    }
    let BaseParams = {}
    BaseParams = {
      fields: {
        issuetype: {
          name: 'Bug',
        },
        project: {
          key: this.state.projectData[0],
        },
        summary: this.state.summary,
        assignee: {
          name: this.state.assigneeName[0],
        },
        reporter: {
          name: this.props.userInfo.name,
        },
        priority: {
          name: 'Major',
        },
        description: this.state.description,
      },
    }
    if (this.state.fixVersion) {
      BaseParams.fields.fixVersions = [{ name: this.state.fixVersion[0] }]
    }
    if (this.state.subCustomItems.length > 0) {
      this.state.subCustomItems.forEach(item => {
        BaseParams.fields[item[0]] = { id: item[1] }
      })
    }
    Loading.show()
    this.props
      .dispatch({
        type: 'home/submitBug',
        payload: {
          domain: this.props.domain,
          params: BaseParams,
          projectData: this.state.projectData,
          fixVersion: this.state.fixVersion,
        },
      })
      .then(() => {
        const { submitBugKey } = this.props
        const filesLength = this.state.files.length
        let count = 0
        if (filesLength > 0) {
          this.state.files.forEach(item => {
            const timeStr = new Date().getTime().toString()
            const formData = new FormData()
            const file = {
              uri: item.url,
              type: 'image/png',
              name: `${timeStr}.jpg`,
            }
            formData.append('file', file)
            this.props
              .dispatch({
                type: 'home/submitAttach',
                payload: {
                  domain: this.props.domain,
                  submitBugKey: submitBugKey,
                  params: formData,
                },
              })
              .then(() => {
                count += 1
                if (count === filesLength) {
                  Toast.show('提交成功！', {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.CENTER,
                  })
                  Loading.hidden()
                  this.props.dispatch(
                    NavigationActions.navigate({
                      routeName: 'Home',
                      params: {
                        updateHome: true,
                        fetchDomain: this.props.domain,
                      },
                    })
                  )
                }
              })
          })
        } else {
          Toast.show('提交成功！', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.CENTER,
          })
          Loading.hidden()
          this.props.dispatch(
            NavigationActions.navigate({
              routeName: 'Home',
              params: { updateHome: true, fetchDomain: this.props.domain },
            })
          )
        }
      })
      .catch(() => {
        Toast.show('提交失败！', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.CENTER,
        })
        Loading.hidden()
      })
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          animated
          hidden={false}
          backgroundColor="rgba(34,34,34,0.3)"
          translucent
        />
        <View style={styles.header_container}>
          <TouchableOpacity style={styles.backButton} onPress={this.goBack}>
            <Image
              source={require('../images/back.png')}
              style={{ height: 30, width: 30 }}
            />
          </TouchableOpacity>
          <View style={{ flex: 2, alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 18, color: '#000' }}>新建BUG</Text>
          </View>
          <TouchableOpacity
            style={{ flex: 2, alignItems: 'flex-end', margin: 10 }}
            onPress={() => CallOnceInInterval(() => this.handleSubmit())}
          >
            <Image
              source={require('../images/submit.png')}
              style={{ height: 25, width: 25 }}
            />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={{ flex: 1, backgroundColor: '#f5f5f9' }}
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <List renderHeader={() => '基本信息'}>
            <Picker
              title="选择项目"
              data={this.state.projectList}
              value={this.state.projectData}
              cols={1}
              // onChange={(value: any) => this.setState({ projectData:value })}
              onOk={(value: any) => this.handleSelectProject(value)}
            >
              <List.Item arrow="down" last>
                选择项目
              </List.Item>
            </Picker>
            <TextInput
              style={{
                marginLeft: 10,
                borderBottomColor: '#eef3f5',
                borderBottomWidth: 1,
                fontSize: 16,
              }}
              placeholder="请输入标题"
              numberOfLines={1}
              underlineColorAndroid="transparent"
              onChangeText={text => {
                this.setState({
                  summary: text,
                })
              }}
            >
              <Text style={{ lineHeight: 20 }}>{this.state.summary}</Text>
            </TextInput>
            {this.state.fixVersions && (
              <Picker
                data={this.state.fixVersions}
                cols={1}
                value={this.state.fixVersion}
                onOk={(value: any) => this.setState({ fixVersion: value })}
              >
                <List.Item arrow="down" last>
                  FixVersion
                </List.Item>
              </Picker>
            )}
          </List>

          {this.state.customItems && (
            <List renderHeader={() => 'custom Field'}>
              {this.state.customItems.map((item, index) => (
                <Picker
                  key={item.customfieldId}
                  data={item.customfieldValues}
                  value={[this.state.subCustomItems[index][1]]}
                  cols={1}
                  onOk={value => this.handleCustomOk(value, index)}
                >
                  <List.Item arrow="down" last>
                    {item.customfieldName}
                  </List.Item>
                </Picker>
              ))}
            </List>
          )}

          <List renderHeader={() => 'Assignee'}>
            <Item
              extra={
                <View>
                  <TextInput
                    style={{ width: 100, fontSize: 16 }}
                    placeholder="输入拼音搜索"
                    numberOfLines={1}
                    underlineColorAndroid="transparent"
                    onChangeText={text => this.searchAssignee(text)}
                  >
                    <Text>{this.state.assigneeSearch}</Text>
                  </TextInput>
                </View>
              }
              multipleLine
            >
              搜索人员
            </Item>
            <Picker
              data={this.state.assigneeList}
              cols={1}
              disabled={!this.state.projectData}
              value={
                !this.state.assigneeName && this.state.assigneeList.length > 0
                  ? [this.state.assigneeList[0].value]
                  : this.state.assigneeName
              }
              // onChange={(value: any) => this.setState({assigneeName: value})}
              onOk={(value: any) => this.setState({ assigneeName: value })}
            >
              <List.Item arrow="down" last onClick={() => this.checkProject()}>
                Assignee
              </List.Item>
            </Picker>
          </List>
          <List renderHeader={() => '描述信息'}>
            <Item>
              <TextInput
                style={{ backgroundColor: '#fff', height: 200, fontSize: 16 }}
                defaultValue={this.state.description}
                numberOfLines={10}
                multiline
                textAlignVertical="top"
                underlineColorAndroid="transparent"
                blurOnSubmit={false}
                onChangeText={text => {
                  this.setState({
                    description: text,
                  })
                }}
              />
            </Item>
          </List>
          <List renderHeader={() => '图片附件'}>
            <Item>
              <ImagePicker
                onChange={this.handleFileChange}
                files={this.state.files}
              />
            </Item>
          </List>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3f5',
  },
  header_container: {
    height: Platform.OS === 'android' && Platform.Version > 19? 70 : 60,
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  backButton: {
    margin: 10,
    flex: 2,
  },
})
