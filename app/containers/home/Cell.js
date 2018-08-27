/* eslint-disable react/no-access-state-in-setstate,react/no-unused-state,object-shorthand,react/no-string-refs */
import React, { PureComponent } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Alert,
  TextInput,
} from 'react-native'
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'
import { Modal, ImagePicker } from 'antd-mobile-rn'
import { Loading } from '../../components/NetworkLoading'
import ImageGallery from '../../components/ImageGallery'
import CallOnceInInterval from '../../components/CallOnceInInterval'

@connect(({ home }) => ({ ...home }))
export default class Cell extends PureComponent {
  state = {
    viewAll: false,
    showActions: new Animated.Value(0),
    isShowAction: false,
    pinglunModalVisible: false,
    needAddPhoto: false,
    errorMessage: null,
    transitions: [],
    item: this.props.item,
    pinglun: null,
    files: [],
  }

  formatCreateTime = created => {
    let formatTime = ''
    const re1 =
      '((?:(?:[1]{1}\\d{1}\\d{1}\\d{1})|(?:[2]{1}\\d{3}))[-:\\/.](?:[0]?[1-9]|[1][012])[-:\\/.](?:(?:[0-2]?\\d{1})|(?:[3][01]{1})))(?![\\d])' // YYYYMMDD 1
    const re2 = '.*?' // Non-greedy match on filler
    const re3 =
      '((?:(?:[0-1][0-9])|(?:[2][0-3])|(?:[0-9])):(?:[0-5][0-9])?(?:\\s?(?:am|AM|pm|PM))?)' // HourMinuteSec 1

    const p = new RegExp(re1 + re2 + re3, ['i'])
    const m = p.exec(created)
    if (m != null) {
      const yyyymmdd1 = m[1]
      const time1 = m[2]
      const time = `${yyyymmdd1.replace(/</, '&lt;')}\t${time1.replace(
        /</,
        '&lt;'
      )}`
      formatTime = time
    }
    return formatTime
  }

  handleShowAction = () => {
    if (!this.state.isShowAction) {
      Loading.show()
      this.props
        .dispatch({
          type: 'home/queryBugTransitions',
          payload: {
            key: this.props.item.key,
            domain: this.props.domain,
          },
        })
        .then(() => {
          Loading.hidden()
          const { transitions } = this.props
          this.setState({ transitions: transitions }, () =>
            Animated.timing(this.state.showActions, {
              duration: 180,
              toValue: 200,
            }).start(() => {
              this.setState({ isShowAction: true })
            })
          )
        })
    } else {
      Animated.timing(this.state.showActions, {
        duration: 250,
        toValue: 0,
      }).start(() => {
        this.setState({ isShowAction: false })
      })
    }
  }

  handleSetTransitions = (id, name) => {
    try {
      let clicktag = 0
      if (clicktag === 0) {
        clicktag = 1
        Alert.alert('温馨提醒', `你确定要${name}吗？`, [
          {
            text: '取消',
            onPress: () => {},
          },

          {
            text: '确定',
            onPress: () => {
              this.props
                .dispatch({
                  type: 'home/setTransitions',
                  payload: {
                    domain: this.props.domain,
                    key: this.props.item.key,
                    params: {
                      transition: {
                        id: id,
                      },
                      update: {},
                      fields: {},
                    },
                  },
                })
                .then(() => {
                  this.handleShowAction()
                  this.props
                    .dispatch({
                      type: 'home/queryBugDetail',
                      payload: {
                        domain: this.props.domain,
                        id: this.props.item.id,
                      },
                    })
                    .then(() => {
                      const { detailItem } = this.props
                      if (detailItem) {
                        Loading.hidden()
                        this.setState({
                          item: detailItem,
                        })
                      }
                    })
                })
            },
          },
        ])
        setTimeout(() => {
          clicktag = 0
        }, 5000)
      } else {
        Alert.alert('我不是秋香，别老是点我！')
      }
    } catch (error) {}
  }

  handleFileChange = (files: any) => {
    this.setState({
      files,
    })
  }

  handleSubmitComment = () => {
    if (!this.state.pinglun) {
      this.setState({ errorMessage: '评论不可为空！' })
      return
    }
    this.setState(
      {
        pinglunModalVisible: false,
      },
      () => {
        Loading.show()
        this.props
          .dispatch({
            type: 'home/submitCommet',
            payload: {
              domain: this.props.domain,
              key: this.props.item.key,
              params: {
                body: this.state.pinglun,
              },
            },
          })
          .then(() => {
            const filesLength = this.state.files.length
            if (filesLength > 0) {
              let count = 0
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
                      submitBugKey: this.props.item.key,
                      params: formData,
                    },
                  })
                  .then(() => {
                    count += 1
                    if (count === filesLength) {
                      this.props
                        .dispatch({
                          type: 'home/queryBugDetail',
                          payload: {
                            domain: this.props.domain,
                            id: this.props.item.id,
                          },
                        })
                        .then(() => {
                          const { detailItem } = this.props
                          if (detailItem) {
                            Loading.hidden()
                            this.refs.imageGallery.formatImageList(
                              detailItem.fields.attachment
                            )
                            this.setState(
                              {
                                item: detailItem,
                                pinglunModalVisible: false,
                                needAddPhoto: false,
                                pinglun: null,
                                files: [],
                              },
                              () => {
                                Toast.show('提交成功！', {
                                  duration: Toast.durations.SHORT,
                                  position: Toast.positions.CENTER,
                                })
                              }
                            )
                          }
                        })
                    }
                  })
              })
            } else {
              Loading.hidden()
              this.props
                .dispatch({
                  type: 'home/queryBugDetail',
                  payload: {
                    domain: this.props.domain,
                    id: this.props.item.id,
                  },
                })
                .then(() => {
                  const { detailItem } = this.props
                  if (detailItem) {
                    this.setState(
                      {
                        item: detailItem,
                        pinglunModalVisible: false,
                        needAddPhoto: false,
                        pinglun: null,
                        files: [],
                      },
                      () =>
                        Toast.show('提交成功！', {
                          duration: Toast.durations.SHORT,
                          position: Toast.positions.CENTER,
                        })
                    )
                  }
                })
            }
          })
      }
    )
  }

  handlePinglunModal = () => {
    this.setState({ pinglunModalVisible: true }, () => this.handleShowAction())
  }

  handleAddPhoto = () => {
    this.setState({ needAddPhoto: !this.state.needAddPhoto })
  }

  onClose = () => {
    this.setState({
      pinglunModalVisible: false,
      needAddPhoto: false,
      pinglun: null,
      files: [],
    })
  }

  render() {
    const { item } = this.state
    return (
      <View style={styles.container}>
        {item.fields.attachment.length > 0 && (
          <ImageGallery
            ref="imageGallery"
            imgList={item.fields.attachment}
            current={0}
          />
        )}
        <View style={{ flex: 1 }}>
          <Image
            source={{ uri: item.fields.reporter.avatarUrls['48x48'] }}
            style={{ width: 35, height: 35 }}
          />
        </View>
        <View style={{ flex: 8 }}>
          <View style={styles.header}>
            <Text style={styles.header_text}>
              {item.fields.reporter.displayName}
            </Text>
            <Image
              source={{ uri: item.fields.status.iconUrl }}
              style={{
                height: 16,
                width: 16,
              }}
            />
            <Text style={styles.header_text}>
              {item.fields.assignee
                ? item.fields.assignee.displayName
                : '未知目标'}
            </Text>
          </View>
          <View style={styles.content}>
            <Text style={{ color: '#000' }}>{item.fields.summary}</Text>
            {item.fields.description &&
              this.state.viewAll && (
                <Text style={{ color: '#000' }}>{item.fields.description}</Text>
              )}
            {item.fields.description && (
              <TouchableOpacity
                style={{ width: 50 }}
                onPress={() => this.setState({ viewAll: !this.state.viewAll })}
              >
                <Text style={{ color: '#055b87', marginTop: 8 }}>
                  {this.state.viewAll ? '收起' : '全文'}
                </Text>
              </TouchableOpacity>
            )}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingBottom: 5,
              }}
            >
              {item.fields.attachment.length > 1 &&
                item.fields.attachment.map((attachmentItem, index) => {
                  let result
                  if (
                    attachmentItem.mimeType === 'image/png' ||
                    attachmentItem.mimeType === 'image/jpeg'
                  ) {
                    result = (
                      <TouchableOpacity
                        key={attachmentItem.id}
                        style={{ paddingRight: 5, paddingTop: 5 }}
                        onPress={() => {
                          this.refs.imageGallery.openGallery(index)
                        }}
                      >
                        <Image
                          source={{ uri: attachmentItem.thumbnail }}
                          style={{ width: 80, height: 80 }}
                        />
                      </TouchableOpacity>
                    )
                  } else if (
                    attachmentItem.mimeType === 'multipart/form-data'
                  ) {
                    if (
                      attachmentItem.filename.indexOf('jpg') > -1 ||
                      attachmentItem.filename.indexOf('jpeg') > -1 ||
                      attachmentItem.filename.indexOf('png') > -1
                    ) {
                      result = (
                        <TouchableOpacity
                          key={attachmentItem.id}
                          style={{ paddingRight: 5, paddingTop: 5 }}
                          onPress={() => {
                            this.refs.imageGallery.openGallery(index)
                          }}
                        >
                          <Image
                            source={{ uri: attachmentItem.thumbnail }}
                            style={{ width: 80, height: 80 }}
                          />
                        </TouchableOpacity>
                      )
                    }
                  }
                  return result
                })}
              {item.fields.attachment.length === 1 &&
                item.fields.attachment.map((attachmentItem, index) => (
                  <TouchableOpacity
                    key={attachmentItem.id}
                    style={{ paddingRight: 5, paddingTop: 5 }}
                    onPress={() => {
                      this.refs.imageGallery.openGallery(index)
                    }}
                  >
                    <Image
                      source={{ uri: attachmentItem.thumbnail }}
                      style={{ width: 120, height: 120 }}
                    />
                  </TouchableOpacity>
                ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, marginTop: 5 }}>
                {this.formatCreateTime(item.fields.created)}
              </Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                <Animated.View
                  style={{
                    position: 'absolute',
                    height: 30,
                    backgroundColor: '#515151',
                    width: this.state.showActions,
                    borderRadius: 3,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}
                >
                  {this.state.transitions &&
                    this.state.transitions.map(transitionsItem => (
                      <View
                        key={transitionsItem.id}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <TouchableOpacity
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Text
                            style={{
                              color: '#eef3f5',
                              marginLeft: 3,
                              marginBottom: 3,
                              fontSize: 12,
                            }}
                            numberOfLines={1}
                            onPress={() =>
                              this.handleSetTransitions(
                                transitionsItem.id,
                                transitionsItem.name
                              )
                            }
                          >
                            {transitionsItem.name}
                          </Text>
                        </TouchableOpacity>
                        <View
                          style={{
                            width: 1,
                            height: 15,
                            backgroundColor: '#0d0d0b',
                            marginLeft: 10,
                            marginRight: 10,
                          }}
                        />
                      </View>
                    ))}
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => this.handlePinglunModal(item.fields.summary)}
                  >
                    <Image
                      source={require('../../images/pingluna.png')}
                      style={{ width: 13, height: 12 }}
                    />
                    <Text
                      style={{
                        color: '#eef3f5',
                        marginLeft: 3,
                        marginBottom: 3,
                        fontSize: 12,
                      }}
                    >
                      评论
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
              <TouchableOpacity
                style={{
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                  width: 20,
                }}
                onPress={() => this.handleShowAction()}
              >
                <Image
                  source={require('../../images/pinlun.png')}
                  style={{ width: 20, height: 14 }}
                />
              </TouchableOpacity>
            </View>
            {item.fields.comment.total > 0 || item.fields.customfield_10000 ? (
              <View>
                <View
                  style={{
                    justifyContent: 'flex-end',
                    position: 'relative',
                    top: 5,
                    left: 10,
                  }}
                >
                  <Image
                    source={require('../../images/commentup.png')}
                    style={{ height: 15, width: 15, resizeMode: 'contain' }}
                  />
                </View>
                <View style={{ backgroundColor: '#eef3f5', borderRadius: 2 }}>
                  {item.fields.customfield_10000 && (
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingLeft: 5,
                        paddingRight: 30,
                        borderBottomWidth: 1,
                        borderBottomColor: '#e6e6e6',
                      }}
                    >
                      <Text style={styles.commenter}>原因分析：</Text>
                      <Text style={styles.comment_text}>
                        {Object.prototype.toString.call(
                          item.fields.customfield_10000
                        ) === '[object String]' &&
                          item.fields.customfield_10000}
                      </Text>
                    </View>
                  )}
                  {item.fields.comment.comments.map(commectItem => (
                    <View
                      key={commectItem.id}
                      style={{ flexDirection: 'row', paddingLeft: 5 }}
                    >
                      <Text style={styles.commenter}>
                        {commectItem.author.displayName}:{' '}
                      </Text>
                      <Text style={styles.comment_text}>
                        {commectItem.body}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View />
            )}
          </View>
        </View>
        <Modal
          transparent
          popup
          visible={this.state.pinglunModalVisible}
          animationType="slide-up"
          maskClosable={false}
        >
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => this.onClose()}
              style={{ alignItems: 'flex-start', flex: 1 }}
            >
              <Text style={{ color: '#3498db', fontSize: 16, marginLeft: 10 }}>
                取消
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                CallOnceInInterval(() => this.handleSubmitComment())
              }
              style={{ alignItems: 'flex-end', flex: 1 }}
            >
              <Text style={{ color: '#3498db', fontSize: 16, marginRight: 10 }}>
                发送
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 10 }}>
            <Text>{item.fields.summary}</Text>
          </View>
          <View>
            <TextInput
              style={styles.text}
              placeholder="怼它..."
              numberOfLines={5}
              autoFocus
              underlineColorAndroid="transparent"
              onChangeText={text => {
                this.setState({
                  pinglun: text,
                  errorMessage: null,
                })
              }}
            />
            {this.state.errorMessage && (
              <Text style={{ fontSize: 12, color: 'red' }}>
                {this.state.errorMessage}
              </Text>
            )}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 5,
                alignItems: 'center',
              }}
              onPress={() => this.handleAddPhoto()}
            >
              <Image
                source={require('../../images/att.png')}
                style={{ height: 16, width: 16 }}
              />
              <Text style={{ color: '#000' }}>添加图片</Text>
            </TouchableOpacity>
            {this.state.needAddPhoto && (
              <View style={{ marginTop: 10 }}>
                <ImagePicker
                  onChange={this.handleFileChange}
                  files={this.state.files}
                />
              </View>
            )}
          </View>
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header_text: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
    marginRight: 5,
    color: '#055b87',
  },
  content: {
    marginLeft: 5,
  },
  commenter: {
    color: '#055b87',
    fontSize: 13,
    fontWeight: 'bold',
  },
  comment_text: {
    fontSize: 13,
    color: '#000',
    marginRight: 30,
  },
  bottom_input: {
    height: 40,
    flex: 1,
  },
  bottom_container: {
    position: 'relative',
    left: 100,
    bottom: 0,
  },
  text: {
    fontFamily: 'System',
    marginTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    fontStyle: 'normal',
    fontSize: 14,
    height: 30,
    borderRadius: 5,
    borderColor: '#b4b4b4',
    paddingBottom: 0,
    paddingTop: 0,
    margin: 0,
    borderWidth: 1, // important, don't know why
  },
})
