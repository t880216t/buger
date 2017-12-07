'use strict';
import {
    StyleSheet,
    Navigator,
    TouchableOpacity,
    Image,
    Text,
    View,
    Platform,
    BackAndroid,
    ScrollView,
    Dimensions,
    StatusBar,
    ToastAndroid,
    AsyncStorage,
    Alert
} from 'react-native';
import React,{Component} from 'react';
import Toast, {DURATION} from 'react-native-easy-toast';
const BusyIndicator = require('react-native-busy-indicator');
const loaderHandler = require('react-native-busy-indicator/LoaderHandler');
import ModalDropdown from 'react-native-modal-dropdown';
var base64 = require('base-64');
//保存的key
var STORAGE_KEY_USERINFO="userinfo";
var STORAGE_KEY_PASSWORD="password";
var STORAGE_KEY_PROJECT="project";
var STORAGE_KEY_BASEHOST="basehost";

export default class HomeDetail extends Component {
    static navigationOptions = {
        tabBarVisible:false,
    };
    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            bugData:{},
            username:"",
            password:"",
            basehost:"",
            messages:[],
            optionsId:[],
            optionsName:[],
            editId:"",
        };
    }

    componentWillMount() {
        const {params} = this.props.navigation.state;
        const {bugData} = params.bugData;
        this._loadInitialState().done();
        this.setState({
            bugData:bugData
        })
    }

    //获取可编辑状态
    getTransitions=()=>{
        var bugData = this.state.bugData
        var loginInfo = this.state.username+":"+this.state.password;
        var baseData = base64.encode(loginInfo);
        var url= this.state.basehost +'/rest/api/latest/issue/'+bugData.key+'/transitions';
        const headers=new Headers({"Content-Type":"application/json","Authorization":"Basic "+baseData});
        fetch(url,{
            method: 'get',
            headers:headers,
        }).then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                this.toastCommon('服务器繁忙，请稍后再试!')
            }
        }).then((response) => {
                if (response) {
                    var transitions = response.transitions
                    var optionsName = []
                    var optionsId = []
                    transitions.map((item)=>{
                        optionsId.push(item.id)
                        optionsName.push(item.name)
                    })
                    this.setState({
                        optionsId:optionsId,
                        optionsName:optionsName
                    })
                } else {
                    this.toastCommon('err:'+response)
                }
            }).catch(()=> {
            this.toastCommon("服务器繁忙，请稍后再试!")
        })
            .done();
    }


    //吐司
    toastCommon = (message) =>{
        if (Platform.OS === 'ios'){
            this.refs.toast.show(message,DURATION.LENGTH_LONG);
        }else {
            ToastAndroid.show(message, ToastAndroid.LONG);
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
                },()=>{
                    this.getTransitions()
                });
            }
        }catch(error){
            this.setState({messages:this.state.messages.concat('AsyncStorage错误'+error.message)},()=>{console.log(this.state.messages)});
        }
    }

    fetchTested=()=>{
        var bugData = this.state.bugData
        //置状态
        loaderHandler.showLoader("正在提交....");
        var loginInfo = this.state.username+":"+this.state.password;
        var baseData = base64.encode(loginInfo);
        var url= this.state.basehost +'/rest/api/latest/issue/'+bugData.key+'/transitions?expand=transitions.fields';
        const headers=new Headers({"Content-Type":"application/json","Authorization":"Basic "+baseData});
        fetch(url,{
            method: 'post',
            headers:headers,
            body:JSON.stringify({
                "transition": {
                    "id": this.state.editId.toString()
                },
                "update": {},
                "fields": {}
            })
        }).then((response) => {
            loaderHandler.hideLoader();
            if (response.ok) {
                this.props.navigation.navigate('HomePage')
            } else {
                this.toastCommon('服务器繁忙，请稍后再试!')
            }
        }).catch(()=> {
            loaderHandler.hideLoader();
            this.toastCommon("服务器繁忙，请稍后再试!")
        })
            .done();
    }

    handlerTested=()=>{
        try{
            var clicktag = 0;
            if (clicktag == 0) {
                clicktag = 1;
                Alert.alert('温馨提醒','问题现象修复了吗？\n影响范围都看过了吗？',[
                    {text:'取消',onPress:()=>{return}},

                    {text:'确定',onPress:()=>{
                        this.fetchTested()
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

    setTransitionId=(index)=>{
        var optionsId = this.state.optionsId
        this.setState({
            editId:optionsId[index]
        },()=>{
            console.log('editId:',this.state.editId);
            this.handlerTested()
        })
    }
    render() {
        const { navigate } = this.props.navigation;
        const {params} = this.props.navigation.state;
        const {bugData} = params.bugData;
        return (
            <View style={{flex:1,backgroundColor: '#63B8FF',}}>
                <StatusBar backgroundColor='#63B8FF'></StatusBar>
                <View style={{backgroundColor:'#63B8FF',marginTop: Platform.OS === 'android' ? 0 : 20,}}>
                {bugData.fields.status.id == 5?
                    <View
                    style={{padding: 15,marginLeft:10,justifyContent: 'center',alignItems: 'center',flexDirection:'row'}}>
                        <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}}
                                          style={{alignItems:'flex-start',flex:2,}}>
                            <Image source={require('../image/back.png')} style={{width:25,height:25}}/>
                        </TouchableOpacity>
                        <Text style={{fontSize:17,flex:2,textAlign:'center',marginRight:30,fontWeight:'bold'}}>缺陷详情</Text>
                        <ModalDropdown
                            options={this.state.optionsName}
                            textStyle={{fontSize: 15,color: 'blue'}}
                            style={{borderRadius: 3,justifyContent:'center',width: 80,alignItems: 'center'}}
                            dropdownTextStyle={{fontSize:14}}
                            defaultValue="操作"
                            onSelect={(index)=>{this.setTransitionId(index)}}
                        />
                    </View>
                    :
                    <View
                        style={{padding: 15,marginLeft:10,justifyContent: 'center',alignItems: 'center',flexDirection:'row'}}>
                        <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}}
                                          style={{alignItems:'center',width:30}}>
                            <Image source={require('../image/back.png')} style={{width:25,height:25}}/>
                        </TouchableOpacity>
                        <Text style={{fontSize:17,flex:1,textAlign:'center',marginRight:30,fontWeight:'bold'}}>缺陷详情</Text>
                    </View>
                    }
                </View>
                <ScrollView style={{flex:1,backgroundColor:'#f2ecde'}}>
                    <View style={{padding:15, flexDirection:'row',backgroundColor:'#fff',}}>
                        <Text style={{flex:1,fontWeight: 'bold',fontSize:18}}>{bugData.fields.summary}</Text>
                    </View>
                    <Text style={{marginTop:15,marginLeft:5}}>详细描述:</Text>
                    <View style={{padding: 15,backgroundColor:'#fff'}}>
                        <Text style={{color: '#595351',fontSize:16}}>{bugData.fields.description}</Text>
                    </View>
                    {bugData.fields.attachment.map((item)=>{
                        var contentName = item.content.indexOf('jpg')
                        if(contentName > 0){
                            return(
                                <View style={{padding: 15,backgroundColor:'#fff'}}>
                                    <Image source={{uri:item.content}}
                                           style={{maxWidth:Dimensions.get('window').width-10,minHeight: Dimensions.get('window').height,resizeMode:'contain'}}
                                    ></Image>
                                </View>
                            )
                        }

                    })}

                </ScrollView>
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
        minHeight: Dimensions.get('window').height,
        resizeMode:'cover'
    },
})
