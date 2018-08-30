/* eslint-disable prefer-destructuring,object-shorthand */
import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Keyboard,
  ImageBackground,
  Dimensions,
  Text,
  KeyboardAvoidingView,
  Easing,
  Animated,
  Image,
} from 'react-native'
import { connect } from 'react-redux'
import Toast from 'react-native-root-toast'
import { Loading } from '../components/NetworkLoading'
import { NavigationActions } from '../utils'

const ScreenWidth = Dimensions.get('window').width
const ScreenHeight = Dimensions.get('window').height
const base64 = require('base-64')

@connect(({ app }) => ({ ...app }))
class Login extends Component {
  state = {
    bounceValue: new Animated.Value(1),
    rotateValue: new Animated.Value(0), // 旋转角度的初始值
    userName: null,
    password: null,
    captcha: null,
    loginError: false,
    needCaptcha: false,
    timestamp: '',
    domain: 'http://jira.xxxx.com',
  }

  componentDidMount() {
    this.state.bounceValue.setValue(1.5) // 设置一个较大的初始值
    Animated.spring(
      // 可选的基本动画类型: spring, decay, timing
      this.state.bounceValue, // 将`bounceValue`值动画化
      {
        toValue: 0.8, // 将其值以动画的形式改到一个较小值
        friction: 1, // Bouncier spring
      }
    ).start() // 开始执行动画
  }

  onLogin = () => {
    const userName = this.state.userName
    const password = this.state.password
    const captcha = this.state.captcha
    if (/^[\u3220-\uFA29]+$/.test(this.state.domain)) {
      Toast.show('域名请输入英文字符', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
      })
      return
    }
    if (/^[\u3220-\uFA29]+$/.test(userName)) {
      Toast.show('账号请输入英文字符', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
      })
      return
    }
    if (!this.state.domain) {
      Toast.show('域名不可空！', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
      })
      return
    }
    if (!userName) {
      Toast.show('账号不可空！', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
      })
      return
    }
    if (!password) {
      Toast.show('密码不可空！', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
      })
      return
    }
    const loginInfo = `${userName}:${password}`
    let base64Info = null
    try {
      base64Info = base64.encode(loginInfo)
    } catch (err) {
      console.log('账号密码加密异常')
    }
    Keyboard.dismiss()
    if (this.state.loginError) {
      this.setState(
        {
          loginError: false,
        },
        () => {
          this.startAnimation()
        }
      )
    } else {
      this.startAnimation()
    }
    if (this.state.needCaptcha) {
      if (!captcha) {
        Toast.show('验证码不可空！', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.CENTER,
        })
        return
      }
      Loading.show()
      this.props
        .dispatch({
          type: 'app/loginWithCaptcha',
          payload: {
            userName: userName,
            password: password,
            captcha: captcha,
            domain: this.state.domain,
            headers: {
              Authorization: `Basic ${base64Info}`,
              'User-Agent': ' Android JIRA REST Client',
            },
          },
        })
        .then(() => {
          Loading.hidden()
          const timestamp = new Date().getTime()
          const { loginError, needCaptcha } = this.props
          this.setState(
            {
              loginError: loginError,
              needCaptcha: needCaptcha,
              timestamp: timestamp.toString(),
            },
            () => {
              if (!loginError) {
                this.props.dispatch(
                  NavigationActions.navigate({
                    routeName: 'Home',
                    params: {
                      updateHome: true,
                      fetchDomain: this.state.domain,
                    },
                  })
                )
              }
            }
          )
        })
    } else {
      Loading.show()
      this.props
        .dispatch({
          type: 'app/login',
          payload: {
            userName: userName,
            password: password,
            domain: this.state.domain,
            headers: {
              Authorization: `Basic ${base64Info}`,
              'User-Agent': ' Android JIRA REST Client',
            },
          },
        })
        .then(() => {
          Loading.hidden()
          const timestamp = new Date().getTime()
          const { loginError, needCaptcha } = this.props
          this.setState(
            {
              loginError: loginError,
              needCaptcha: needCaptcha,
              timestamp: timestamp.toString(),
            },
            () => {
              if (!loginError) {
                this.props.dispatch(
                  NavigationActions.navigate({
                    routeName: 'Home',
                    params: {
                      updateHome: true,
                      fetchDomain: this.state.domain,
                    },
                  })
                )
              }
            }
          )
        })
    }
  }

  startAnimation() {
    if (this.state.loginError) {
      this.state.rotateValue.stopAnimation()
    } else {
      this.state.rotateValue.setValue(0)
      Animated.sequence([
        Animated.timing(this.state.rotateValue, {
          toValue: 1, // 角度从0变1
          duration: 5000, // 从0到1的时间
          easing: Easing.out(Easing.linear), // 线性变化，匀速旋转
        }),
      ]).start(() => this.startAnimation())
    }
  }

  render() {
    const { fetching } = this.props
    return (
      <View style={fetching ? styles.loading_container : styles.container}>
        <ImageBackground
          source={require('../images/login_back.jpg')}
          style={{ width: ScreenWidth, height: ScreenHeight }}
        >
          <StatusBar
            animated
            hidden={false}
            backgroundColor="rgba(34,34,34,0.3)"
            translucent
          />
          <View style={styles.content_container}>
            <KeyboardAvoidingView
              behavior="padding"
              style={styles.content_container}
            >
              <View style={{ alignItems: 'center' }}>
                <Animated.Image
                  source={require('../images/launcher.png')}
                  style={{
                    height: 150,
                    width: 150,
                    borderRadius: 75,
                    transform: [
                      { scale: this.state.bounceValue },
                      {
                        rotateZ: this.state.rotateValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  }}
                />
              </View>
              <View style={[styles.input_container, { borderWidth: 0 }]}>
                <Text style={styles.input_label}>域名</Text>
                <TextInput
                  style={styles.input_item}
                  underlineColorAndroid="transparent"
                  placeholder="请输入jira域名"
                  value={this.state.domain}
                  numberOfLines={1}
                  onChangeText={value => {
                    this.setState({
                      domain: value,
                    })
                  }}
                />
              </View>
              <View style={styles.input_container}>
                <Text style={styles.input_label}>账号</Text>
                <TextInput
                  style={styles.input_item}
                  underlineColorAndroid="transparent"
                  placeholder="请输入jira账号"
                  value={this.state.userName}
                  numberOfLines={1}
                  onChangeText={value => {
                    this.setState({
                      userName: value,
                    })
                  }}
                />
              </View>
              <View style={styles.input_container}>
                <Text style={styles.input_label}>密码</Text>
                <TextInput
                  style={styles.input_item}
                  underlineColorAndroid="transparent"
                  placeholder="请输入jira密码"
                  value={this.state.password}
                  numberOfLines={1}
                  secureTextEntry
                  onChangeText={value => {
                    this.setState({
                      password: value,
                    })
                  }}
                />
              </View>
              {this.state.needCaptcha && (
                <View style={styles.captcha}>
                  <View style={styles.captcha_container}>
                    <TextInput
                      style={styles.captcha_item}
                      underlineColorAndroid="transparent"
                      placeholder="请输入验证信息"
                      value={this.state.captcha}
                      numberOfLines={1}
                      onChangeText={value => {
                        this.setState({
                          captcha: value,
                        })
                      }}
                    />
                  </View>
                  {this.state.domain&&
                  <View style={styles.captcha_image}>
                    <Image
                      style={{ height: 40, width: 120, resizeMode: 'contain' }}
                      source={{
                        uri: `${this.state.domain}/captcha?__r=${
                          this.state.timestamp
                          }`,
                      }}
                    />
                  </View>
                </View>
              )}
              <TouchableOpacity
                style={styles.login_container}
                onPress={this.onLogin}
              >
                <Text style={styles.button_text}>登录</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </ImageBackground>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  close: {
    position: 'absolute',
    right: 10,
    top: 30,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: 'gray',
  },
  input_container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#fafafa',
    borderRadius: 22,
    alignItems: 'center',
    marginLeft: 30,
    marginBottom: 10,
    marginRight: 30,
  },
  login_container: {
    flexDirection: 'row',
    borderColor: '#fafafa',
    borderRadius: 22,
    alignItems: 'center',
    marginLeft: 30,
    marginBottom: 10,
    marginRight: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    opacity: 0.3,
  },
  captcha: {
    flexDirection: 'row',
    height: 40,
    marginBottom: 10,
    marginLeft: 30,
  },
  captcha_container: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#fafafa',
    borderRadius: 22,
  },
  input_item: {
    marginTop: 3,
    height: 40,
    flex: 6,
    color: '#fff',
  },
  captcha_item: {
    height: 40,
    color: '#fff',
    marginLeft: 10,
  },
  captcha_image: {
    height: 40,
    flex: 2,
    justifyContent: 'center',
    marginLeft: 10,
  },
  input_label: {
    flex: 1,
    alignSelf: 'center',
    textAlign: 'center',
    color: '#fff',
  },
  content_container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickSubmit: {
    position: 'relative',
    top: 100,
    left: 50,
    zIndex: 99,
  },
  button_text: {
    fontSize: 20,
    padding: 8,
    flex: 1,
    textAlign: 'center',
    alignSelf: 'center',
  },
})

export default Login
