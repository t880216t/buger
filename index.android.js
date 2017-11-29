/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ToastAndroid,
    AsyncStorage,
    Platform,
} from 'react-native';
import App from './app'
import LoginPage from './src/views/LoginPage'
import Toast, {DURATION} from 'react-native-easy-toast';
const BusyIndicator = require('react-native-busy-indicator');
const loaderHandler = require('react-native-busy-indicator/LoaderHandler');
var STORAGE_KEY_USERINFO="userinfo";

export default class wawo extends Component {
  constructor (props) {
    super (props)
    this.state = {
      messages:[],
      islogin:false,
    }
  }

  //加载缓存数据
  componentDidMount(){
        loaderHandler.showLoader("加载中....");
        this._loadInitialState().done();
  }

  async _loadInitialState(){
    try{
        var value=await AsyncStorage.getItem(STORAGE_KEY_USERINFO);
        loaderHandler.hideLoader();
        if(value!=null && value!=""){
            this.setState({islogin:true});
        }else {
            this.toastCommon("请先登录!")
        }
    }catch(error){
        loaderHandler.hideLoader();
        this.setState({messages:this.state.messages.concat('AsyncStorage错误'+error.message)},()=>{console.log(this.state.messages)});
    }
  }

  //吐司
  toastCommon = (message) =>{
    if (Platform.OS === 'ios'){
      this.refs.toast.show(message,DURATION.LENGTH_LONG);
    }else {
      ToastAndroid.show(message, ToastAndroid.LONG);
    }
  }

  render() {
    let page = this.state.islogin ?<App />:<LoginPage />
    return (
        <View style={{flex:1}}>
            {page}
            <Toast ref="toast" position='center'/>
            <BusyIndicator Size={'large'}/>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('wawo', () => wawo);
