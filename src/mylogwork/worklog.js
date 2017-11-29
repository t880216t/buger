import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    Platform,
    ToastAndroid,
    AsyncStorage,
    StatusBar,
    ScrollView,
    Dimensions,
    FlatList,
    Alert
} from 'react-native';
import DatePicker from 'react-native-datepicker'
import moment from 'moment';
import Toast, {DURATION} from 'react-native-easy-toast';
const BusyIndicator = require('react-native-busy-indicator');
const loaderHandler = require('react-native-busy-indicator/LoaderHandler');
var base64 = require('base-64');
//保存的key
var STORAGE_KEY_USERINFO="userinfo";
var STORAGE_KEY_PASSWORD="password";
var STORAGE_KEY_PROJECT="project";
var STORAGE_KEY_WORKLOG = "worklog";
var STORAGE_KEY_BASEHOST="basehost";

import WorklogCell from './worklog_cell'
import ProgressBarDialog from '../compment/progressBarDialog'

export default class WorkLog extends Component {

    // 构造
      constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            username:"",
            password:"",
            worklog:{},
            messages:[],
            worklogdata:[],
            listRef:false,
            progress: 0,
            progressModalVisible: false,
            basehost:'',
        };
      }

    componentDidMount(){
        this._loadInitialState().done();
    }

    componentWillReceiveProps(nextProps){
        console.log('componentWillReceiveProps');
        console.log("nexProps",nextProps)
    }

    //吐司
    toastCommon = (message) =>{
        if (Platform.OS === 'ios'){
            this.refs.toast.show(message,DURATION.LENGTH_LONG);
        }else {
            ToastAndroid.show(message, ToastAndroid.LONG);
        }
    }

    //进度条
    refProgressBar = (view) => {
        this.progressBar = view;
    }
    showProgressBar = () => {
        this.setState({
            progressModalVisible: true
        });
    }
    dismissProgressBar = () => {
        this.setState({
            progress: 0,
            progressModalVisible: false
        });
    }
    setProgressValue = (progress) => {
        this.setState({
            progress
        });
    }
    onProgressRequestClose = () => {
        this.dismissProgressBar();
    }
    canclePress = () => {
        this.dismissProgressBar();
    }

    //读取缓存数据
    async _loadInitialState(){
        try{
            var value=await AsyncStorage.getItem(STORAGE_KEY_USERINFO);
            var password=await AsyncStorage.getItem(STORAGE_KEY_PASSWORD);
            var worklog=await AsyncStorage.getItem(STORAGE_KEY_WORKLOG);
            var basehost=await AsyncStorage.getItem(STORAGE_KEY_BASEHOST);
            if(worklog!=null){
                var worklog = JSON.parse(worklog)
                var worklogdata = worklog.worklogdata
                this.setState({
                    worklogdata:worklogdata,
                    listRef:false,
                },()=>{loaderHandler.hideLoader()})
            }
            if(value!=null){
                this.setState({
                    username:value,
                    password:password,
                    listRef:false,
                    basehost:basehost,
                },()=>{loaderHandler.hideLoader()});
            }else {
                loaderHandler.hideLoader()
                this.toastCommon("本地数据异常，请清空缓存后重新登录")
            }
        }catch(error){
            loaderHandler.hideLoader()
            this.setState({
                messages:this.state.messages.concat('AsyncStorage错误'+error.message),
                listRef:false,
            },()=>{console.log(this.state.messages)});
        }
    }

    deleteWorklog=(index,worklogdata)=>{
        if(worklogdata){
            var arrayWorklog = worklogdata
        }else {
            var arrayWorklog = this.state.worklogdata
        }

        arrayWorklog.splice(index,1);
        var worklog = JSON.stringify({
            "worklogdata":arrayWorklog
        })
        this._saveValue_One(worklog).then(this._loadInitialState())

    }

    deleteAll=()=>{
        var worklog = JSON.stringify({
            "worklogdata":[]
        })
        console.log('delete all log')
        this._saveValue_One(worklog).then(this._loadInitialState())

    }

    //异步保存
    async _saveValue_One(allworklog){
        try{
            await AsyncStorage.mergeItem(STORAGE_KEY_WORKLOG,allworklog,()=>{console.log('allworklog:',allworklog)});
        }catch(error){
            this.setState({messages:this.state.messages.concat('AsyncStorage错误'+error.message)},()=>{console.log(this.state.messages)});
        }
    }

    //cell
    renderItemView=(item,index)=>{
        var item = JSON.parse(item)
        return(
            <WorklogCell onSelect={()=>this.deleteWorklog(index)} item={item}></WorklogCell>
        )
    }

    //去除警告
    extraUniqueKey(item,index){
        return index+item;
    }

    //下拉刷新
    listRefing=()=>{
        this.setState({
            listRef:true
        },()=>this._loadInitialState())
    }

    buttonRefing=()=>{
        loaderHandler.showLoader("刷新数据....");
        this._loadInitialState()
    }


    //提交全部
    submitAll=()=>{
        try {
            var worklogdata = this.state.worklogdata
            var total = worklogdata.length
            var index = 1
            this.showProgressBar()
            var loginInfo = this.state.username+":"+this.state.password;
            var baseData = base64.encode(loginInfo);
            worklogdata.map((item)=>{
                var item = JSON.parse(item)
                var url= this.state.basehost+'/rest/api/latest/issue/'+item.key+'/worklog';
                const headers=new Headers({"Content-Type":"application/json","Authorization":"Basic "+baseData});
                fetch(url,{
                    method: 'post',
                    headers:headers,
                    body:JSON.stringify({
                        "comment": item.comment,
                        "timeSpent": item.timeSpent,
                        "started": item.datetime
                    })
                }).then((response) => {
                    if (response.ok) {
                        if (index === total){
                            this.setProgressValue(100)
                            this.dismissProgressBar()
                            this.deleteAll()
                            this.toastCommon('上传完成')
                        }else {
                            this.deleteWorklog(index-1,worklogdata)
                            var processNum = Math.round((index / total)*100);
                            this.setProgressValue(processNum)
                            index += 1
                        }
                    } else {
                        this.dismissProgressBar()
                        this.toastCommon('上传未完成，请检查网络!')
                    }
                }).catch(()=> {
                    this.dismissProgressBar()
                    this.toastCommon('上传未完成，请检查网络!')
                })
                    .done();
            })

        }catch(err) {
            this.dismissProgressBar()
            this.setState({messages:this.state.messages.concat('AsyncStorage错误'+err.message)},()=>{console.log(this.state.messages)});
        }

    }

    //list头部
    _header = () => {
        return (
            <View>
                <TouchableOpacity
                    onPress={()=>{
                        this.buttonRefing()
                        Alert.alert('温馨提醒','确认提交全部日志吗？',[
                        {text:'取消',onPress:()=>{return}},

                        {text:'确定',onPress:()=>{
                            this.submitAll()
                        }}
                    ]);}}
                    style={{alignItems:'center',justifyContent: 'center',height: 40,backgroundColor: 'green',borderRadius:10,padding: 10,margin:20}}>
                    <Text style={{color:'white',fontSize: 16,fontWeight:'bold'}}>提交全部</Text>
                </TouchableOpacity>
            </View>

        );
    }

    render() {
        const worklogdata = this.state.worklogdata
        return (
            <View style={styles.container}>
                {worklogdata.length<1?
                    <View style={styles.container}>
                        <Text>┑(￣▽ ￣)┍</Text>
                        <Text style={{marginTop:30}}>还没有保存的工作日志</Text>
                        <TouchableOpacity
                            onPress={this.buttonRefing}
                            style={{borderColor: "grey",borderWidth: 0.5,justifyContent: 'center',alignItems: 'center',borderRadius:5,width: 100,height: 30,marginTop: 20}}
                        >
                            <Text style={{color:'blue',fontSize: 16}}>刷新</Text>
                        </TouchableOpacity>
                    </View>
                :
                <View style={{backgroundColor: '#F5FCFF'}}>
                    <FlatList style={{width:Dimensions.get('window').width}}
                              data = {worklogdata}
                              renderItem={({item,index}) => this.renderItemView(item,index)}
                              keyExtractor = {this.extraUniqueKey}//去除警告
                              refreshing={this.state.listRef}
                              onRefresh={this.listRefing}
                              ListHeaderComponent={this._header}
                    >

                    </FlatList>
                </View>
                }
                <Toast ref="toast" position='center'/>
                <BusyIndicator Size={'large'}/>
                <ProgressBarDialog
                    ref={this.refProgressBar}
                    progress={this.state.progress}
                    progressModalVisible={this.state.progressModalVisible}
                    onRequestClose={this.onProgressRequestClose}
                    canclePress={this.canclePress}
                    needCancle={false}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5FCFF',
    },
})