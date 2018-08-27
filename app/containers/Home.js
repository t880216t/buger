/* eslint-disable no-return-assign,no-unused-expressions,react/no-access-state-in-setstate,camelcase,no-param-reassign,object-shorthand */
import React, {Component} from 'react'
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Text,
  Dimensions,
  FlatList,
  ImageBackground,
  Alert,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native'
import {connect} from 'react-redux'
import {Drawer, WhiteSpace, Modal} from 'antd-mobile-rn'
import ModalDropdown from 'react-native-modal-dropdown'
import Toast from "react-native-root-toast"
import {NavigationActions} from '../utils'
import Cell from './home/Cell'
import {Loading} from "../components/NetworkLoading"
import CallOnceInInterval from '../components/CallOnceInInterval'

const ScreenWidth = Dimensions.get('window').width

let count = 0

@connect(({app, home}) => ({...app, ...home}))
export default class Header extends Component {
  // 构造
  constructor(props) {
    super(props)
    // 初始状态
    this.state = {
      isDropShow: false,
      issues: [],
      favouriteList: [],
      optionHasChange: false,
      optionIndex: 0,
      userInfo: null,
      refreshing: false,
      libModalVisible: false,
      aboutMeModalVisible: false,
    }
    const willFocus = this.props.navigation.addListener(
      'willFocus',
      payload => {
        if (this.props.navigation.getParam("updateHome")) {
          const domain = this.props.navigation.getParam("fetchDomain")
          if (domain) {
            this.updateHomeFromLoginPage(domain)
          }
        }
      }
    )
  }

  componentWillMount() {
    const {login, domain, Authorization} = this.props
    if (!login) {
      this.props.dispatch(NavigationActions.navigate({routeName: 'Login'}))
    } else {
      Loading.show()
      this.props.dispatch({
        type: 'home/queryBugList',
        payload: {
          params: {
            "jql": "reporter = currentUser() ORDER BY createdDate DESC",
            "startAt": 0,
            "maxResults": 10,
            "fields": ["reporter", "created", "summary", "status", "assignee", "customfield_10000", "description", "watches", "attachment", "issuekey", "comment"]
          },
          domain: domain,
          headers: {
            "Authorization": Authorization
          }
        }
      }).then(() => {
        this.props.dispatch({
          type: 'home/queryFavourite',
          payload: {
            domain: domain,
          }
        }).then(() => {
          Loading.hidden()
          const {favouriteList, issues, userInfo} = this.props
          this.setState({
            favouriteList: favouriteList,
            issues: issues,
            userInfo: userInfo,
            domain: domain,
          })
        })
      })
    }
  }

  componentWillUnMount() {
    this.willFocus.remove()
  }

  updateHomeFromLoginPage = (domain) => {
    Loading.show()
    this.props.dispatch({
      type: 'home/queryBugList',
      payload: {
        params: {
          "jql": "reporter = currentUser() ORDER BY createdDate DESC",
          "startAt": 0,
          "maxResults": 10,
          "fields": ["reporter", "created", "summary", "status", "assignee", "customfield_10000", "description", "watches", "attachment", "issuekey", "comment"]
        },
        domain: domain,
      }
    }).then(() => {
      this.props.dispatch({
        type: 'home/queryFavourite',
        payload: {
          domain: domain,
        }
      }).then(() => {
        Loading.hidden()
        const {favouriteList, issues, userInfo} = this.props
        if (userInfo) {
          this.setState({
            favouriteList: favouriteList,
            issues: issues,
            userInfo: userInfo
          })
        } else if (this.props.userName) {
          this.props.dispatch({
            type: 'app/queryLoginUserInfo',
            payload: {
              domain: domain,
              userName: this.props.userName,
            }
          }).then(() => {
            this.setState({
              favouriteList: favouriteList,
              issues: issues,
              userInfo: this.props.userInfo,
              domain:domain
            })
          })
        }
      })
    })
  }

  onEndReach = () => {
    count += 10
    if (!this.state.optionHasChange) {
      Loading.show()
      this.props.dispatch({
        type: 'home/queryBugList',
        payload: {
          params: {
            "jql": "reporter = currentUser() ORDER BY createdDate DESC",
            "startAt": count,
            "maxResults": 10,
            "fields": ["reporter", "created", "summary", "status", "assignee", "customfield_10000", "description", "watches", "attachment", "issuekey", "comment"]
          },
          domain: this.props.domain?this.props.domain:this.state.domain,
        }
      }).then(() => {
        Loading.hidden()
        const {issues} = this.props
        if (issues && issues.length > 0) {
          this.setState({issues: this.state.issues.concat(issues)})
        } else {
          Toast.show("没有更多了！", {duration: Toast.durations.SHORT, position: Toast.positions.CENTER,})
        }
      })
    } else {
      Loading.show()
      this.props.dispatch({
        type: 'home/queryBugList',
        payload: {
          params: {
            "jql": this.state.favouriteList[this.state.optionIndex].jql,
            "startAt": count,
            "maxResults": 10,
            "fields": ["reporter", "created", "summary", "status", "assignee", "customfield_10000", "description", "watches", "attachment", "issuekey", "comment"]
          },
          domain: this.props.domain?this.props.domain:this.state.domain,
        }
      }).then(() => {
        Loading.hidden()
        const {issues} = this.props
        if (issues && issues.length > 0) {
          this.setState({issues: this.state.issues.concat(issues)})
        } else {
          Toast.show("没有更多了！", {duration: Toast.durations.SHORT, position: Toast.positions.CENTER,})
        }
      })
    }
  }

  onRefresh = () => {
    count = 0
    this.setState({refreshing: true}, () => {
      if (!this.state.optionHasChange) {
        Loading.show()
        this.props.dispatch({
          type: 'home/queryBugList',
          payload: {
            params: {
              "jql": "reporter = currentUser() ORDER BY createdDate DESC",
              "startAt": count,
              "maxResults": 10,
              "fields": ["reporter", "created", "summary", "status", "assignee", "customfield_10000", "description", "watches", "attachment", "issuekey", "comment"]
            },
            domain: this.props.domain?this.props.domain:this.state.domain,
          }
        }).then(() => {
          Loading.hidden()
          this.props.dispatch({
            type: 'home/queryFavourite',
            payload: {
              domain: this.props.domain?this.props.domain:this.state.domain,
            }
          }).then(() => {
            Loading.hidden()
            const {favouriteList, issues} = this.props
            this.setState({
              favouriteList: favouriteList,
              issues: issues,
              refreshing: false,
            })
          })
        }).catch((err) => {
          Loading.hidden()
          this.setState({
            refreshing: false,
          })
        })
      } else {
        Loading.show()
        this.props.dispatch({
          type: 'home/queryBugList',
          payload: {
            params: {
              "jql": this.state.favouriteList[this.state.optionIndex].jql,
              "startAt": count,
              "maxResults": 10,
              "fields": ["reporter", "created", "summary", "status", "assignee", "customfield_10000", "description", "watches", "attachment", "issuekey", "comment"]
            },
            domain: this.props.domain?this.props.domain:this.state.domain,
          }
        }).then(() => {
          Loading.hidden()
          this.props.dispatch({
            type: 'home/queryFavourite',
            payload: {
              domain: this.props.domain?this.props.domain:this.state.domain,
            }
          }).then(() => {
            Loading.hidden()
            const {favouriteList, issues} = this.props
            this.setState({
              favouriteList: favouriteList,
              issues: issues,
              refreshing: false,
            })
          })
        }).catch((err) => {
          Loading.hidden()
          this.setState({
            refreshing: false,
          })
        })
      }
    })
  }

  dropdownAdjustFrame = (style) => {
    if(Platform.OS === 'ios'){
      style.top += 20
    }else {
      style.top -= 5
    }
    style.left = 0
    return style
  }

  handleOptionChange = (index) => {
    count = 0
    Loading.show()
    this.props.dispatch({
      type: 'home/queryBugList',
      payload: {
        params: {
          "jql": this.state.favouriteList[index].jql,
          "startAt": count,
          "maxResults": 10,
          "fields": ["reporter", "created", "summary", "status", "assignee", "customfield_10000", "description", "watches", "attachment", "issuekey", "comment"]
        },
        domain: this.props.domain?this.props.domain:this.state.domain,
      }
    }).then(() => {
      Loading.hidden()
      const {issues} = this.props
      if (issues) {
        this.setState({
          issues: issues,
          optionHasChange: true,
          optionIndex: index,
        })
      }
    })
  }

  handlelogout = () => {
    Alert.alert('温馨提醒', `你确定要退出吗？`, [
      {text: '取消'},
      {
        text: '确定', onPress: () => {
          this.drawer && this.drawer.closeDrawer()
          this.props.dispatch({type: 'app/logout'})
        }
      }
    ])
  }

  goAddPage = () => {
    this.props.dispatch(NavigationActions.navigate({routeName: 'AddPage'}))
  }

  extraUniqueKey = (item) => item.id

  renderItemView = (item) => <Cell item={item}/>

  renderNoResult = () => (
    <View style={styles.noResult}>
      <Text style={styles.noResultText}>No records found</Text>
    </View>
  )

  renderListFooter = () => (
    <View style={{height: 100, padding: 10}} />
  )

  render() {
    const sidebar = (
      <ScrollView style={styles.side_container}>
        <ImageBackground style={styles.side_header} source={require('../images/header_back.jpg')}>
          <View style={styles.userInfo}>
            <Image
              source={this.state.userInfo ? {uri: this.state.userInfo.avatarUrls["48x48"]} : require('../images/logo.jpg')}
              style={{
                height: 40,
                width: 40,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: '#fafafa',
              }}
            />
            <Text style={styles.name}>{this.state.userInfo && this.state.userInfo.displayName}</Text>
          </View>
        </ImageBackground>
        <TouchableOpacity style={styles.side_item}
                          onPress={() => this.setState({libModalVisible: !this.state.libModalVisible})}>
          <Image
            source={require('../images/lib.png')}
            style={styles.side_logo}
          />
          <Text style={styles.side_label}>参考资料</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.side_item}
                          onPress={() => this.setState({aboutMeModalVisible: !this.state.aboutMeModalVisible})}>
          <Image
            source={require('../images/aboutMe.png')}
            style={styles.side_logo}
          />
          <Text style={styles.side_label}>关于我么</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.side_item} onPress={() => {
          this.handlelogout()
        }}>
          <Image
            source={require('../images/logout.png')}
            style={styles.side_logo}
          />
          <Text style={styles.side_label}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
    )
    return (
      <Drawer
        sidebar={sidebar}
        position="left"
        open={false}
        drawerRef={ref => this.drawer = ref}
        drawerBackgroundColor="#ccc"
      >
        <StatusBar
          animated
          hidden={false}
          backgroundColor="rgba(34,34,34,0.3)"
          translucent
        />
        <View>
          <View style={styles.header_container}>
            <TouchableOpacity style={styles.logo_container} onPress={() => {
              this.drawer && this.drawer.openDrawer()
            }}>
              <Image
                source={this.state.userInfo ? {uri: this.state.userInfo.avatarUrls["48x48"]} : require('../images/logo.jpg')}
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 20,
                }}
              />
            </TouchableOpacity>
            <View style={styles.drop_container}>
              <ModalDropdown
                animated={false}
                options={this.state.favouriteList}
                onDropdownWillShow={() => this.setState({isDropShow: !this.state.isDropShow})}
                onDropdownWillHide={() => this.setState({isDropShow: !this.state.isDropShow})}
                onSelect={(index) => {
                  this.handleOptionChange(index)
                }}
                dropdownStyle={styles.dropdownStyle}
                adjustFrame={style => this.dropdownAdjustFrame(style)}
                renderRow={(item) => (
                  <TouchableOpacity style={styles.drop_item}>
                    <Text style={{fontSize: 16}}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={{fontSize: 16, color: '#fff'}}>过滤器</Text>
                  <Image
                    source={this.state.isDropShow ? require('../images/up.png') : require('../images/down.png')}
                    style={{
                      height: 10,
                      width: 10,
                      marginLeft: 5,
                    }}
                  />
                </View>
              </ModalDropdown>
            </View>
            <TouchableOpacity style={styles.add_container} onPress={() => this.goAddPage()}>
              <Image
                source={require('../images/add.png')}
                style={{
                  height: 25,
                  width: 25,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.content_container}>
          <FlatList
            style={{width: Dimensions.get('window').width,height:'100%'}}
            refreshControl={
              <RefreshControl refreshing={this.state.refreshing} onRefresh={() => this.onRefresh()}
                              title="Loading..."
                              titleColor="#888"/>}
            data={this.state.issues}
            renderItem={({item}) => this.renderItemView(item)}
            keyExtractor={this.extraUniqueKey}
            ItemSeparatorComponent={() => <View style={{height: 1, backgroundColor: '#DAE0E6'}}/>}
            ListEmptyComponent={this.renderNoResult()}
            initialNumToRender={10}
            onEndReached={() => CallOnceInInterval(() => this.onEndReach())}
            ListFooterComponent={this.renderListFooter()}
            onEndReachedThreshold={0.1}
          />
        </View>
        <Modal
          title="参考资料"
          transparent
          popup
          visible={this.state.libModalVisible}
          animationType="slide-up"
          maskClosable
          onClose={() => this.setState({libModalVisible: false})}
          closable
        >
          <ScrollView style={{padding: 10, maxHeight: 400}}>
            <Text style={{fontSize: 14, color: '#000', marginTop: 10}}> 本应用主要参考，但不限于以下开源资料。想二次开发或自定义的同学可以了解下。</Text>
            <Text style={{fontSize: 16, color: '#000', marginTop: 10}}>JIRA 6.1 REST API documentation</Text>
            <Text style={{fontSize: 14, color: 'blue'}}
                  onPress={() => Linking.openURL('https://docs.atlassian.com/DAC/rest/jira/6.1.html')}>
              https://docs.atlassian.com/DAC/rest/jira/6.1.html
            </Text>
            <Text style={{fontSize: 16, color: '#000', marginTop: 10}}>React Native</Text>
            <Text style={{fontSize: 14, color: 'blue'}}
                  onPress={() => Linking.openURL('http://facebook.github.io/react-native')}>
              http://facebook.github.io/react-native
            </Text>
            <Text style={{fontSize: 16, color: '#000', marginTop: 10}}>火之子的个人博客</Text>
            <Text style={{fontSize: 14, color: 'blue'}} onPress={() => Linking.openURL('https://orion-c.top')}>
              https://orion-c.top
            </Text>
            <Text style={{fontSize: 16, color: '#000', marginTop: 10}}>dva框架</Text>
            <Text style={{fontSize: 14, color: 'blue'}}
                  onPress={() => Linking.openURL('https://github.com/dvajs/dva/blob/master/README_zh-CN.md')}>
              https://github.com/dvajs/dva/blob/master/README_zh-CN.md
            </Text>
            <Text style={{fontSize: 16, color: '#000', marginTop: 10}}>Ant Design 移动端设计规范</Text>
            <Text style={{fontSize: 14, color: 'blue'}}
                  onPress={() => Linking.openURL('https://rn.mobile.ant.design/index-cn')}>
              https://rn.mobile.ant.design/index-cn
            </Text>
            <Text style={{fontSize: 16, color: '#000', marginTop: 10}}>react-native-dva-starter</Text>
            <Text style={{fontSize: 14, color: 'blue', marginBottom: 10}}
                  onPress={() => Linking.openURL('https://github.com/nihgwu/react-native-dva-starter')}>
              https://github.com/nihgwu/react-native-dva-starter
            </Text>
          </ScrollView>
        </Modal>
        <Modal
          title="关于我么"
          transparent
          popup
          visible={this.state.aboutMeModalVisible}
          animationType="slide-up"
          maskClosable
          closable
          onClose={() => this.setState({aboutMeModalVisible: false})}
        >
          <View>
            <Text style={{textAlign: 'center'}}>当前版本v3.0.0</Text>
            <Text style={{marginTop: 10,}}> 感谢使用本应用，如您在使用过程遇到问题或有更多建议，请邮件给<Text style={{color: 'blue'}}
                                                                                onPress={() => Linking.openURL('mailto:562746248@qq.com')}>
              562746248@qq.com</Text>
              ，我将尽快处理。
            </Text>
            <Text> 如果您愿意，请截图扫描打赏码，给予我鼓励。后续打赏够99$，我将在取得苹果开发者账号后，发布IOS版本。</Text>
            <Image
              source={require('../images/shang.png')}
              style={{
                height: 200,
                width: 200,
                alignSelf: 'center'
              }}
            />
          </View>
        </Modal>
      </Drawer>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  icon: {
    width: 32,
    height: 32,
  },
  header_container: {
    backgroundColor: 'rgb(63, 81, 181)',
    height: (Platform.OS === 'ios') ? 70 : 90,
    flexDirection: "row",
    alignItems: 'flex-end',
    width: ScreenWidth,
  },
  logo_container: {
    marginLeft: 20,
    marginBottom: 10,
    flex: 2,
  },
  add_container: {
    marginRight: 20,
    marginBottom: 15,
    alignItems: 'flex-end',
    flex: 2,
  },
  drop_container: {
    flex: 2,
    alignItems: 'center',
    marginBottom: 20,
  },
  dropdownStyle: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  drop_item: {
    width: ScreenWidth,
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  content_container: {
    height: '100%',
  },
  noResult: {
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 50,
    width: '100%'
  },
  noResultText: {
    paddingTop: 10,
    fontSize: 13,
    color: '#222',
    width: '100%',
    textAlign: 'center'
  },
  name: {
    fontSize: 26,
    color: '#fff',
    marginLeft: 10,
  },
  userInfo: {
    flexDirection: "row",
    margin: 20,
  },
  side_header: {
    height: 200,
    justifyContent: 'center',
  },
  side_container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  side_logo: {
    height: 20,
    width: 20,
  },
  side_label: {
    color: '#000',
    fontSize: 16,
    marginLeft: 10,
  },
  side_item: {
    paddingLeft: 20,
    paddingTop: 20,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  closeWrap: {
    backgroundColor: 'red'
  }
})
