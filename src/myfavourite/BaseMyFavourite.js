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
import MyCell from './my_cell';

var base64 = require('base-64');
const BusyIndicator = require('react-native-busy-indicator');
const loaderHandler = require('react-native-busy-indicator/LoaderHandler');
var count=1;
//保存的key
var STORAGE_KEY_USERINFO="userinfo";
var STORAGE_KEY_PASSWORD="password";
var STORAGE_KEY_PROJECT="project";
var STORAGE_KEY_WORKLOG = "worklog";
var STORAGE_KEY_BASEHOST="basehost";


export default class BaseMyFavourite extends Component {
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
            worklog:"",
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
        this._loadInitialState().done();
    }

    //读取缓存数据
    async _loadInitialState(){
        try{
            var value=await AsyncStorage.getItem(STORAGE_KEY_USERINFO);
            var password=await AsyncStorage.getItem(STORAGE_KEY_PASSWORD);
            var worklog=await AsyncStorage.getItem(STORAGE_KEY_WORKLOG);
            var basehost=await AsyncStorage.getItem(STORAGE_KEY_BASEHOST);
            if(value!=null){
                this.setState({
                    username:value,
                    password:password,
                    basehost:basehost,
                },()=>{this.fetchFavouriteData(worklog)});
            }
        }catch(error){
            this.setState({messages:this.state.messages.concat('AsyncStorage错误'+error.message)},()=>{console.log(this.state.messages)});
        }
    }

    //下拉刷新
    listRefing=()=>{
        this.setState({
            listRef:true
        },()=>this.fetchFavouriteData())
    }

    //获取BUG数据
    fetchFavouriteData=(worklog)=>{
        loaderHandler.showLoader("加载中....");
        var loginInfo = this.state.username+":"+this.state.password;
        var baseData = base64.encode(loginInfo);
        var url= this.state.basehost+'/rest/api/latest/filter/favourite';
        const headers=new Headers({"Content-Type":"application/json","Authorization":"Basic "+baseData});
        fetch(url,{
            method: 'GET',
            headers:headers,
        }).then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                this.toastCommon('服务器繁忙，请稍后再试!')
                this.setState({listRef:false})

            }
        }).then((response) => {
            if (response) {
                this.setState({
                    fetchData: response,
                    listRef:false,
                    worklog:worklog
                },()=>{
                    setTimeout(
                        () => {
                            loaderHandler.hideLoader();
                        },
                        2000,
                    )
                    });
            } else {
                this.toastCommon('err:'+response)
                this.setState({listRef:false})
            }
        }).catch((err)=> {
            console.log('err:',err)
            this.toastCommon("服务器繁忙，请稍后再试!")
            this.setState({listRef:false})
        })
            .done();
    }

    //渲染行数据
    renderItemView(FavouriteData,navigate){
        return(
            <MyCell onSelect={() => navigate('FavouriteDetail',{FavouriteData:{FavouriteData}})} FavouriteData={FavouriteData}></MyCell>
        );
    }

    render() {
        //导航对象
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor='#63B8FF'></StatusBar>
                <View style={{backgroundColor: '#F5FCFF',marginTop: Platform.OS === 'android' ? 0 : 20,}}>
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