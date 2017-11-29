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
import TaskCell from '../task/task_cell';
import TaskDetail from '../task/task_detail';
import BaseLoginPage from '../login/BaseLoginPage';
import MyFavourite from '../myfavourite/BaseMyFavourite'
import LogWork from '../task/logWork'
import WorkLog from '../mylogwork/worklog'

var base64 = require('base-64');
const BusyIndicator = require('react-native-busy-indicator');
const loaderHandler = require('react-native-busy-indicator/LoaderHandler');
var count=1;
//保存的key
var STORAGE_KEY_USERINFO="userinfo";
var STORAGE_KEY_PASSWORD="password";
var STORAGE_KEY_PROJECT="project";
var STORAGE_KEY_FavouriteData = "FavouriteData";
var STORAGE_KEY_BASEHOST="basehost";

class _TaskPage extends Component {
    static navigationOptions = {
        tabBarVisible:false,
    };
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
            fetchData:[],
            listRef:false,
            messages:[],
            FavouriteData:{},
            basehost:'',
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
    componentDidMount(){
        try{
            const {params} = this.props.navigation.state;
            const {FavouriteData} = params.FavouriteData;
            this.setState({
                FavouriteData:FavouriteData
            },()=>{this._saveValue_One(FavouriteData)})
            this._loadInitialState().done();
        }catch (error){
            this.new_loadInitialState().done();
        }
    }

    //保存数据
    async _saveValue_One(FavouriteData){
        var FavouriteData = JSON.stringify(FavouriteData)
        try{
            await AsyncStorage.mergeItem(STORAGE_KEY_FavouriteData,FavouriteData);
        }catch(error){
            this.setState({messages:this.state.messages.concat('AsyncStorage错误'+error.message)},()=>{console.log(this.state.messages)});
        }
    }

    componentWillMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', ()=>this._pressButton());
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', ()=>this._pressButton());
        }
    }

    _pressButton() {
        this.props.navigation.goBack()
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
                },()=>{this.fetchFavDetailData()});
            }
        }catch(error){
            this.setState({messages:this.state.messages.concat('AsyncStorage错误'+error.message)},()=>{console.log(this.state.messages)});
        }
    }

    //读取缓存数据
    async new_loadInitialState(){
        try{
            var value=await AsyncStorage.getItem(STORAGE_KEY_USERINFO);
            var password=await AsyncStorage.getItem(STORAGE_KEY_PASSWORD);
            var FavouriteData=await AsyncStorage.getItem(STORAGE_KEY_FavouriteData);
            var basehost=await AsyncStorage.getItem(STORAGE_KEY_BASEHOST);
            if(value!=null&&FavouriteData!=null){
                this.setState({
                    username:value,
                    password:password,
                    FavouriteData:JSON.parse(FavouriteData),
                    basehost:basehost,
                },()=>{this.fetchFavDetailData()});
            }
        }catch(error){
            this.setState({messages:this.state.messages.concat('AsyncStorage错误'+error.message)},()=>{console.log(this.state.messages)});
        }
    }

    //下拉刷新
    listRefing=()=>{
        this.setState({
            listRef:true
        },()=>this.fetchFavDetailData())
    }

    //获取BUG数据
    fetchFavDetailData=()=>{
        loaderHandler.showLoader("加载中....");
        var loginInfo = this.state.username+":"+this.state.password;
        var jql = this.state.FavouriteData.jql
        var baseData = base64.encode(loginInfo);
        var url= this.state.basehost+'/rest/api/latest/search';
        const headers=new Headers({"Content-Type":"application/json","Authorization":"Basic "+baseData});
        fetch(url,{
            method: 'post',
            headers:headers,
            body:JSON.stringify({
                "fields":["*all"],
                "jql": jql,
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
        }).catch(()=> {
            loaderHandler.hideLoader();
            this.toastCommon("服务器繁忙，请稍后再试!")
            this.setState({listRef:false})
        })
            .done();
    }


    //渲染行数据
    renderItemView(bugData,navigate){
        return(
            <TaskCell onSelect={() => navigate('TaskDetail',{bugData:{bugData}})} bugData={bugData}></TaskCell>
        );
    }

    //回去
    titleBack=(e,navigate)=>{
        navigate('MyFavourite',{ transition: 'forVertical' })
    }

    //去除警告
    extraUniqueKey(item,index){
        return index+item;
    }

    render() {
        //导航对象
        const { navigate } = this.props.navigation;
        const FavouriteData = this.state.FavouriteData;
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor='#63B8FF'></StatusBar>
                <View style={styles.header}>
                    <View style={{height:50,marginTop: Platform.OS === 'android' ? 0 : 20,}} >
                        <View style={styles.userinfo}>
                            <TouchableOpacity onPress={(e)=>{this.titleBack(e,navigate)}}
                                              style={{alignItems: 'center',justifyContent:'center',width:30}}>
                                <Image source={require('../image/back.png')} style={{width:25,height:25}}/>
                            </TouchableOpacity>
                            <View style={{alignItems: 'center',justifyContent:'center',marginLeft:20}}>
                                <Text style={{color: 'white',fontSize:20,textAlign:'center'}} >{FavouriteData.name}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',alignItems:'center',marginRight:20}}>

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
                <BusyIndicator Size={'large'}/>
            </View>
        );
    }
}

const TaskPage = StackNavigator({
    TaskPage: {screen: _TaskPage,
    },
    TaskDetail:{screen: TaskDetail,
    },
    LoginPage:{screen: BaseLoginPage,
    },
    MyFavourite:{screen: MyFavourite,
    },
    LogWork:{screen:LogWork
    },
    WorkLog:{
        screen:WorkLog
    }

},{
    initialRouteName: 'TaskPage',
    mode: 'card ',
    headerMode: 'none',
    //解决安卓push无效果,并通过transition参数指定跳转动画
    transitionConfig:() => ({
        screenInterpolator: (sceneProps) => {
            const { scene } = sceneProps;
            const { route } = scene;
            const params = route.params || {};
            const transition = params.transition || 'forHorizontal';
            return CardStackStyleInterpolator[transition](sceneProps);
        },
    })
});



export default TaskPage;


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