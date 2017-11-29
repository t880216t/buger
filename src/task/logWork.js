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
    Dimensions
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

export default class LogWork extends Component {
    static navigationOptions = {
        tabBarVisible:false,
    };
    // 构造
      constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            comment: "",
            timeSpent: "",
            overWorkTime: "",
            started: "",
            datetime:"",
            username:"",
            password:"",
            messages:[],
            bugData:{},
            worklog:[],
            basehost:'',
        };
      }

    componentWillMount() {
        this._loadInitialState().done();
        const {params} = this.props.navigation.state;
        const bugData = params.bugData;
        var formatTime = moment().format('YYYY-MM-DDTHH:mm:ss')
        this.setState({
            datetime:formatTime+'.000GMT+08:00',
            bugData:bugData
        })
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
                    worklog:worklog,
                    basehost:basehost
                });
            }
        }catch(error){
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

    addLogWork=(bugData)=>{
          if(this.state.comment!=""&&this.state.timeSpent!=""){
              this.fetchWorkData(bugData)
          }
          else {
              this.toastCommon("请填写完整数据")
          }
    }

    //提交数据
    fetchWorkData=(bugData)=>{
        loaderHandler.showLoader("正在提交....");
        var loginInfo = this.state.username+":"+this.state.password;
        var baseData = base64.encode(loginInfo);
        var url= this.state.basehost+'/rest/api/latest/issue/'+bugData.key+'/worklog';
        const headers=new Headers({"Content-Type":"application/json","Authorization":"Basic "+baseData});
        fetch(url,{
            method: 'post',
            headers:headers,
            body:JSON.stringify({
                "comment": this.state.overWorkTime===""||this.state.overWorkTime==="0"?this.state.comment:"【 加班时间："+this.state.overWorkTime+" h 】\n"+this.state.comment,
                "timeSpent": this.state.timeSpent,
                "started": this.state.datetime
            })
        }).then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                this.toastCommon('服务器繁忙，请稍后再试!')
            }
        }).then((response) => {
            loaderHandler.hideLoader();
            if (response) {
                this.props.navigation.navigate('TaskPage')
            } else {
                this.toastCommon('err:'+response)
            }
        }).catch(()=> {
            loaderHandler.hideLoader();
            this.toastCommon("服务器繁忙，请稍后再试!")
        })
            .done();
    }

    //保存数据
    saveLogWork=()=>{
        var allworklog = {
            "worklogdata": []
        }
        if (this.state.worklog!==null){
            allworklog =  JSON.parse(this.state.worklog);
        }
        var saveData = JSON.stringify({
            "summary":this.state.bugData.fields.summary,
            "key":this.state.bugData.key,
            "comment": this.state.overWorkTime===""||this.state.overWorkTime==="0"?this.state.comment:"【 加班时间："+this.state.overWorkTime+" h 】\n"+this.state.comment,
            "timeSpent": this.state.timeSpent,
            "started": this.state.datetime
        })
        allworklog.worklogdata.push(saveData)
        this._saveValue_One(JSON.stringify(allworklog)).then(this.props.navigation.goBack())

    }

    //异步保存
    async _saveValue_One(allworklog){
        try{
            await AsyncStorage.mergeItem(STORAGE_KEY_WORKLOG,allworklog,()=>{console.log('allworklog:',allworklog)});
        }catch(error){
            this.setState({messages:this.state.messages.concat('AsyncStorage错误'+error.message)},()=>{console.log(this.state.messages)});
        }
    }

    render() {
        const bugData = this.state.bugData
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor='#63B8FF'></StatusBar>
                <ScrollView style={{backgroundColor:'#63B8FF',marginTop: Platform.OS === 'android' ? 0 : 20,}}>
                    <View style={{flex:1,backgroundColor:'#f2ecde',height:Dimensions.get('window').height-20}}>
                        <View style={{backgroundColor:'#63B8FF'}}>
                            <View
                                style={{padding: 15,marginLeft:10,justifyContent: 'center',alignItems: 'center',flexDirection:'row'}}>
                                <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}}
                                                  style={{alignItems:'flex-start',flex:2,}}>
                                    <Image source={require('../image/back.png')} style={{width:25,height:25}}/>
                                </TouchableOpacity>
                                <Text style={{fontSize:17,flex:2,textAlign:'center',fontWeight:'bold'}}>Log Work</Text>
                                <TouchableOpacity onPress={()=>{this.addLogWork(bugData)}}
                                                  style={{alignItems:'flex-end',flex:2}}>
                                    <Text style={{fontSize:15,color:'blue',textAlign:'center',marginRight:5,fontWeight:'bold'}}>提交</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{marginLeft: 10,marginRight: 10,marginTop: 10,height:40,justifyContent: 'center',backgroundColor:'#fff',}}>
                            <Text style={{fontWeight: 'bold',fontSize:18}}>{bugData.fields.summary}</Text>
                        </View>

                        <View style={{marginLeft: 10,marginRight: 10,marginTop: 10,backgroundColor:'#fff',}}>
                            <TextInput
                                style={{backgroundColor:'#fff',height:40,}}
                                placeholder='请输入工作时长(eg. 3w 4d 12h)'
                                numberOfLines={1}
                                underlineColorAndroid={'transparent'}
                                onChangeText={(text) => {
                                    this.setState({
                                        timeSpent: text
                                    })
                                }}
                            />
                        </View>

                        <View style={{marginLeft: 10,marginRight: 10,marginTop: 10,backgroundColor:'#fff',}}>
                            <TextInput
                                style={{backgroundColor:'#fff',height:40,}}
                                placeholder='请输入加班时长(eg. 1 2.5)'
                                numberOfLines={1}
                                keyboardType="numeric"
                                underlineColorAndroid={'transparent'}
                                onChangeText={(text) => {
                                    this.setState({
                                        overWorkTime: text
                                    })
                                }}
                            />
                        </View>

                        <View style={{marginLeft: 10,marginRight: 10,marginTop: 10,backgroundColor:'#fff',}}>
                            <TextInput
                                style={{backgroundColor:'#fff',height:100,fontSize: 15,}}
                                numberOfLines={10}
                                multiline={true}
                                placeholder='请输入任务描述'
                                textAlignVertical ='top'
                                underlineColorAndroid={'transparent'}
                                blurOnSubmit={false}
                                onChangeText={(text) => {
                                    this.setState({
                                        comment: text
                                    })
                                }}
                            />
                        </View>

                        <View style={{flexDirection: 'row',alignItems: 'center',marginLeft: 10,marginRight: 10,marginTop: 10,backgroundColor:'#fff',}}>
                            <Text style={{fontSize: 15,marginLeft: 10}}>选择日期:</Text>
                            <DatePicker
                                style={{width: 200,marginLeft: 30,borderColor:'#F0F8FF'}}
                                date={this.state.datetime}
                                mode="datetime"
                                format="YYYY-MM-DDTHH:mm:ss"
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                showIcon={false}
                                onDateChange={(datetime) => {this.setState({datetime: datetime+'.000GMT+08:00'},()=>{console.log(this.state.datetime)});}}
                            />
                        </View>

                        <TouchableOpacity onPress={()=>{this.saveLogWork()}}
                                          style={{alignItems:'center',justifyContent: 'center',height: 40,marginTop: 50,backgroundColor: 'red',borderRadius:10,padding: 10,margin:10}}>
                            <Text style={{color:'white',fontSize: 18,fontWeight:'bold'}}>保存工作日志</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <Toast ref="toast" position='center'/>
                <BusyIndicator Size={'large'}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:'#63B8FF'
    },
})