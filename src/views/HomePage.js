import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Dimensions,
    StatusBar,
    Image,
    TextInput,
    FlatList,
    TouchableOpacity,
    Alert,
    Keyboard,
    AsyncStorage,
    Platform,
    ToastAndroid,
    BackHandler
} from 'react-native';

import {StackNavigator} from 'react-navigation';
import CardStackStyleInterpolator from 'react-navigation/lib/views/CardStack/CardStackStyleInterpolator';
import Toast, {DURATION} from 'react-native-easy-toast';
//自定义组件
import HomeCell from '../home/home_cell';
import HomeDetail from '../home/home_detail';
import BaseLoginPage from '../login/BaseLoginPage';
import CreateIOS from '../home/createBugPageIOS';
import CreateAndriod from '../home/createBugPage';

var base64 = require('base-64');
const BusyIndicator = require('react-native-busy-indicator');
const loaderHandler = require('react-native-busy-indicator/LoaderHandler');
//保存的key
var STORAGE_KEY_USERINFO="userinfo";
var STORAGE_KEY_PASSWORD="password";
var STORAGE_KEY_PROJECT="project";
var STORAGE_KEY_WORKLOG = "worklog"
var STORAGE_KEY_BASEHOST="basehost";

class _HomePage extends Component {
    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            value : [],
            searchKeyWord:'',
            userIcon:'http://www.qqzhi.com/uploadpic/2014-10-08/041717696.jpg',
            displayName:'正在加载...',
            password:'',
            username:'',
            basehost:'',
            fetchData:[],
            listRef:false
        };
    }

    //吐司
    toastCommon = (message) =>{
        if (Platform.OS === 'ios'){
            this.refs.toast.show(message,DURATION.LENGTH_LONG);
        }else {
            ToastAndroid.show(message, ToastAndroid.LONG);
        }
    }

    /**数据存储*/
    componentWillMount(){
        loaderHandler.showLoader("加载中....");
        this._loadInitialState().done();
        if (Platform.OS === 'android') {
            var count=1;
            BackHandler.addEventListener('hardwareBackPress', function () {
                if (count >= 0) {
                    ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
                    count--;
                    return true;
                } else {
                    BackHandler.exitApp()
                    return false;
                }
            });
        }
    }

    componentDidUnMount() {
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', function () {
                count = 1
            });
        }
    }


    //读取缓存数据
    async _loadInitialState(){
        try{
            var value=await AsyncStorage.getItem(STORAGE_KEY_USERINFO);
            var password=await AsyncStorage.getItem(STORAGE_KEY_PASSWORD);
            var basehost=await AsyncStorage.getItem(STORAGE_KEY_BASEHOST);
            if(value!=null){
                this.setState({
                    username:value,
                    password:password,
                    basehost:basehost,
                },()=>{this.fetchBugData()});
            }
        }catch(error){
            this.setState({messages:this.state.messages.concat('AsyncStorage错误'+error.message)},()=>{console.log(this.state.messages)});
        }
    }

    //下拉刷新
    listRefing=()=>{
        this.setState({
            listRef:true
        },()=>this.fetchBugData())
    }

    //获取BUG数据
    fetchBugData=()=>{

        var loginInfo = this.state.username+":"+this.state.password;
        var baseData = base64.encode(loginInfo);
        var url= this.state.basehost+'/rest/api/latest/search';
        const headers=new Headers({"Content-Type":"application/json","Authorization":"Basic "+baseData});
        fetch(url,{
            method: 'post',
            headers:headers,
            body:JSON.stringify({
                "fields":["*all"],
                "jql":"issuetype in (Bug, 安全漏洞) AND status in (Open, 'In Progress', Reopened, Reopen, Resolved) AND reporter in (currentUser()) ORDER BY createdDate DESC",
                "startAt":0
            })
        }).then((response) => {
            loaderHandler.hideLoader();
            if (response.ok) {
                return response.json()
            } else {
                this.toastCommon('服务器繁忙，请稍后再试!')
                this.setState({listRef:false})

            }
        }).then((response) => {
            loaderHandler.hideLoader();
            if (response) {
                this.setState({
                    fetchData: response.issues,
                    displayName:response.issues[0].fields.reporter.displayName,
                    userIcon:response.issues[0].fields.reporter.avatarUrls['48x48'],
                    listRef:false
                });
            } else {
                this.toastCommon('err:'+response)
                this.setState({listRef:false})
            }
        }).catch((err)=> {
            loaderHandler.hideLoader();
            this.toastCommon("服务器繁忙，请稍后再试!")
            this.setState({listRef:false})
        })
            .done();
    }

    //退出登录
    handleHeader=(e,navigate)=>{
        try{
            var clicktag = 0;
            if (clicktag == 0) {
                clicktag = 1;
                Alert.alert('温馨提醒','确定退出登录吗?',[
                    {text:'取消',onPress:()=>{return}},

                    {text:'确定',onPress:()=>{
                        AsyncStorage.removeItem(STORAGE_KEY_PASSWORD);
                        AsyncStorage.removeItem(STORAGE_KEY_USERINFO);
                        AsyncStorage.removeItem(STORAGE_KEY_PROJECT);
                        AsyncStorage.removeItem(STORAGE_KEY_WORKLOG);
                        AsyncStorage.removeItem(STORAGE_KEY_BASEHOST);
                        navigate('LoginPage');
                    }}
                ]);
                setTimeout(()=>{ clicktag = 0 }, 5000);
            }
            else{
                Alert.alert('我不是秋香，别老是点我！');}
        }catch(error){
            return;
        }
    }

    //渲染行数据
    renderItemView(bugData,navigate){
        return(
            <HomeCell onSelect={() => navigate('HomeDetail',{bugData:{bugData}})} bugData={bugData}></HomeCell>
        );
    }

    //新建bug单
    handleAdd=(e,navigate)=>{
        if (Platform.OS === 'ios'){
            navigate('createIOS')
        }else {
            navigate('createAndroid')
        }
    }

    //去除警告
    extraUniqueKey(item,index){
        return index+item;
    }

    render() {
        //导航对象
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor='#63B8FF'></StatusBar>
                <View style={styles.header}>
                    <TouchableOpacity onPress={(e)=>this.handleHeader(e,navigate)} style={{height:50,marginTop: Platform.OS === 'android' ? 0 : 20,}} >
                        <View style={styles.userinfo}>
                            <Image
                                style={{width:50,height:50,borderRadius:25,marginLeft:10}}
                                source={{uri:this.state.userIcon}}/>
                            <View style={{alignItems: 'center',justifyContent:'center',marginLeft:15}}>
                                <Text style={{color: 'white',fontSize:20}} >{this.state.displayName}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',alignItems:'center',marginRight:20,marginTop: Platform.OS === 'android' ? 0 : 20,}}>
                        <TouchableOpacity
                            onPress={(e)=>this.handleAdd(e,navigate)}>
                            <View >
                                <Image source={require('../image/plus.png')} style={{width:35,height:35}}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{backgroundColor: '#F5FCFF'}}>
                    <FlatList style={{width:Dimensions.get('window').width,marginBottom: 50}}
                              data = {this.state.fetchData}
                              renderItem={({item}) => this.renderItemView(item,navigate)}
                              keyExtractor = {this.extraUniqueKey}//去除警告
                              refreshing={this.state.listRef}
                              onRefresh={this.listRefing}
                    >

                    </FlatList>
                </View>
                <Toast ref="toast" position='center'/>
            </View>
        );
    }
}

const HomePage = StackNavigator({
    HomePage: {screen: _HomePage,
    },
    HomeDetail:{screen: HomeDetail,
    },
    LoginPage:{screen: BaseLoginPage,
    },
    createIOS:{screen: CreateIOS,
    },
    createAndroid:{screen: CreateAndriod,
    },

},{
    initialRouteName: 'HomePage',
    mode: 'card ',
    headerMode: 'none',
    //解决安卓push无效果
    transitionConfig:()=>({
        screenInterpolator:CardStackStyleInterpolator.forHorizontal,
    })
});

export default HomePage;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    backgroundImage:{
        flex:1,
        resizeMode:'cover'
    },
    head:{
        width:Dimensions.get('window').width,
    },
    titleProfile:{
        flexDirection:'row',
        height:50,
    },
    AdvImageBox:{
        flex:1,
        width:45,
        height:45,
        marginLeft:30,
        marginTop:2,
        marginBottom:2,
        borderRadius:5,
        justifyContent:'center',
        alignItems:'center'
    },
    AdvImage:{
        flex:1,
        width:38,
        height:38,
        marginTop: 3,
        marginBottom: 3,
        borderRadius:5
    },
    titleName:{
        flex:3,
        justifyContent:'center',
        alignItems:'center'
    },
    inputText:{
        height: 35,
        fontSize:13,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,  // 设置圆角边
        color:'white',
        backgroundColor:'rgba(0,0,0,0.5)'
    },
    searchBox:{//搜索框
        marginTop: 3,
        height:40,
        flexDirection: 'row',   // 水平排布
        backgroundColor: '#211510',
        alignItems: 'center',
    },
    header:{
        backgroundColor: '#63B8FF',
        flexDirection: 'row',
        padding: 5,
    },
    userinfo:{
        flex:1,
        flexDirection:'row',
    },
    settings:{
        flex:1,
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
