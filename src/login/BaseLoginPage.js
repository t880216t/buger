import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    ToastAndroid,
    AsyncStorage,
    Keyboard,
    BackHandler,
    StatusBar
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast';

var STORAGE_KEY_USERINFO="userinfo";
var STORAGE_KEY_PASSWORD="password";
var STORAGE_KEY_BASEHOST="basehost";
var base64 = require('base-64');
const BusyIndicator = require('react-native-busy-indicator');
const loaderHandler = require('react-native-busy-indicator/LoaderHandler');

class BaseLoginPage extends Component {
    static navigationOptions = {
        tabBarVisible:false,
    };
    constructor (props) {
        super (props)
        this.state = {
            username:"",
            password:"",
            basehost:"",
            messages:[],
            navigate:this.props.navigation,
        }
    }

    /**数据存储*/
    componentDidMount(){
        if (Platform.OS === 'android') {
            var logincount=1;
            BackHandler.addEventListener('hardwareBackPress', function () {
                if (logincount >= 0) {
                    ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
                    logincount--;
                    return true;
                } else {
                    BackHandler.exitApp()
                    return false;
                }
            });
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

    //点击登录按钮
    handleLogin = () =>{
        if(this.state.basehost === "" || this.state.username === "" || this.state.password === ""){
            this.toastCommon("请填写完整登录信息！")
            return
        }
        Keyboard.dismiss();
        var loginInfo = this.state.username+':'+this.state.password;
        var url = this.state.basehost + '/rest/api/latest/serverInfo';
        var baseData = base64.encode(loginInfo);
        var params='?username='+this.state.username;
        loaderHandler.showLoader("正在登录");
        fetch(
            url+params,
            {
                method: 'GET',
                headers: {
                    'Content-Type':'application/json; charset=UTF-8',
                    'Authorization': 'Basic '+baseData,
                    'User-Agent':' Android JIRA REST Client',
                },
            }
        ).then((response)=>{
            if(response){
                if(response.headers.get('X-AUSERNAME') == this.state.username && this.state.username != null){
                    loaderHandler.hideLoader();
                    this.toastCommon("登录成功！")
                    this.saveLoginData()
                }else {
                    if(response.status === 403){
                        loaderHandler.hideLoader();
                        this.toastCommon("账号登陆异常，请先PC端登录完成二维码校验！")
                    }if(response.status >= 500){
                        loaderHandler.hideLoader();
                        this.toastCommon("账号登陆异常，请确认服务器地址正确！")
                    }
                    else {
                        loaderHandler.hideLoader();
                        this.toastCommon("登录名或密码错误！")
                    }

                }
            }
        })
            .catch(()=> {
                loaderHandler.hideLoader();
                this.toastCommon("亲，网络异常哦！")
            })
            .done();
    }

    //保存登录数据
    saveLoginData=()=>{
        const {navigate} = this.state.navigate
        this._saveValue_One().done();
        navigate('HomePage')
    }

    //异步保存
    async _saveValue_One(){
        try{
            await AsyncStorage.setItem(STORAGE_KEY_USERINFO,this.state.username);
            await AsyncStorage.setItem(STORAGE_KEY_PASSWORD,this.state.password);
            await AsyncStorage.setItem(STORAGE_KEY_BASEHOST,this.state.basehost);
        }catch(error){
            this.setState({messages:this.state.messages.concat('AsyncStorage错误'+error.message)},()=>{console.log(this.state.messages)});
        }
    }

    render() {
        return (
            <View style={{backgroundColor:'#f4f4f4',flex:1}}>
                <StatusBar backgroundColor='#63B8FF'></StatusBar>
                <Image
                    style={styles.style_image}
                    source={{uri:'http://oi2rzqa3e.bkt.clouddn.com/buger.png'}}/>
                <TextInput
                    style={styles.style_host_input}
                    placeholder='服务域名,eg:http://jira.company.com'
                    numberOfLines={1}
                    underlineColorAndroid={'transparent'}
                    textAlign='center'
                    onChangeText={(text) => {
                            this.setState({
                                basehost: text
                            })
                        }}
                    value={this.state.basehost}
                />

                <TextInput
                    style={styles.style_user_input}
                    placeholder='JIRA账号'
                    numberOfLines={1}
                    autoFocus={true}
                    underlineColorAndroid={'transparent'}
                    textAlign='center'
                    onChangeText={(text) => {
                            this.setState({
                                username: text
                            })
                        }}
                    value={this.state.username}
                />
                <View
                    style={{height:1,backgroundColor:'#f4f4f4'}}
                />
                <TextInput
                    style={styles.style_pwd_input}
                    placeholder='密码'
                    numberOfLines={1}
                    underlineColorAndroid={'transparent'}
                    secureTextEntry={true}
                    textAlign='center'
                    onChangeText={(text) => {
                            this.setState({
                                password: text
                            })
                        }}
                    value={this.state.password}
                />
                <TouchableOpacity
                    style={styles.style_view_commit}
                    onPress={this.handleLogin}
                >
                    <View>
                        <Text style={{color:'#fff'}}>
                            登录
                        </Text>

                    </View>
                </TouchableOpacity>

                <View style={{alignItems:'flex-end',bottom:10,marginTop:20,marginRight:10}}>
                    <Text style={styles.style_view_unlogin} onPress={()=>Alert.alert("温馨提示","如登录失败请先尝试PC端登录，或邮件t880216t@gmail.com反馈！")}>
                        无法登录?
                    </Text>

                </View>
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
    style_image:{
        borderRadius:38,
        height:70,
        width:70,
        marginTop:40,
        alignSelf:'center',
    },
    style_user_input:{
        backgroundColor:'#fff',
        marginTop:10,
        height:40,
    },
    style_host_input:{
        backgroundColor:'#fff',
        marginTop:10,
        height:40,
    },
    style_pwd_input:{
        backgroundColor:'#fff',
        height:40,
    },
    style_view_commit:{
        marginTop:15,
        marginLeft:10,
        marginRight:10,
        backgroundColor:'#63B8FF',
        height:35,
        borderRadius:5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    style_view_unlogin:{
        fontSize:12,
        color:'#63B8FF',
        marginLeft:10,
    },
    style_view_register:{
        fontSize:12,
        color:'#63B8FF',
        marginRight:20,
    }
})
export default BaseLoginPage