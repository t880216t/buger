/**
 * Created by chenjian 17/2/11.
 *
 */

'use strict';

import {
    Image,
    Text,
    View,
    Platform,
    BackAndroid,
    TouchableOpacity,
    Alert,
    ScrollView,
    PickerIOS,
    Animated,
    Dimensions,
    TextInput,
    AsyncStorage,
    TouchableHighlight,
    StatusBar,
} from 'react-native';
import React,{Component} from 'react';
import ReactNative from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast';
const BusyIndicator = require('react-native-busy-indicator');
const loaderHandler = require('react-native-busy-indicator/LoaderHandler');
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import  ImagePicker from 'react-native-image-picker'; //第三方相机
var base64 = require('base-64');

var STORAGE_KEY_USERINFO="userinfo";
var STORAGE_KEY_PASSWORD="password";
var STORAGE_KEY_PROJECT="project";
var STORAGE_KEY_PROJECTVERSION="projectversion";
var STORAGE_KEY_BASEHOST="basehost";
var deviceHeight = Dimensions.get('window').height;
//填写默认值
var defultValue = '前置条件：'+'\n'+'\n'+'\n'+'步骤:'+'\n'+'\n'+'\n'+'预期结果：';

//相机配置
var photoOptions = {
    //底部弹出框选项
    title:'请选择',
    cancelButtonTitle:'取消',
    takePhotoButtonTitle:'拍照',
    chooseFromLibraryButtonTitle:'选择相册',
    quality:0.2,
    allowsEditing:false,
    noData:false,
    storageOptions: {
        skipBackup: true,
        path:'images'
    }
};

var ProjectPicker = React.createClass({

    componentDidMount: function() {
        Animated.timing(this.props.offSet, {
            duration: 300,
            toValue: 0
        }).start()
        console.log('picker lei de projects:'+this.props.projects);
    },

    closeModal() {
        Animated.timing(this.props.offSet, {
            duration: 300,
            toValue: deviceHeight
        }).start(this.props.closeModal);
    },

    render() {
        return (
            <View >
                <Animated.View style={{ backgroundColor: '#DDDDDD',transform: [{translateY: this.props.offSet}]}}>
                    <View style={{flexDirection: 'row',justifyContent: 'flex-end',borderTopColor: '#808080',borderTopWidth: 1,borderBottomColor: '#808080',borderBottomWidth:1}}>
                        <TouchableHighlight onPress={ this.closeModal } underlayColor="transparent" style={{paddingRight:10,paddingTop:10,paddingBottom:10}}>
                            <Text style={{color: '#027afe',fontSize: 18}}>Choose</Text>
                        </TouchableHighlight>
                    </View>
                    <PickerIOS
                        selectedValue={this.props.project}
                        itemStyle={{color:'#242424',fontSize:19,height:212}}
                        onValueChange={(project) => this.props.changProject(project)}>
                        {this.props.projects.map((projectItem) => (
                            <PickerIOS.Item
                                label={projectItem.name} value={'{"id":'+'"'+projectItem.id+'","key":"'+projectItem.key+'","name":"'+projectItem.name+'"}'}
                            />
                        ))}
                    </PickerIOS>
                </Animated.View>
            </View>

        )
    }
})

var ProjectVersionPicker = React.createClass({

    componentDidMount: function() {
        Animated.timing(this.props.offSet, {
            duration: 300,
            toValue: 0
        }).start()
    },

    closeModal() {
        Animated.timing(this.props.offSet, {
            duration: 300,
            toValue: deviceHeight
        }).start(this.props.closeModal);
    },

    render() {
        return (
            <View >
                <Animated.View style={{ backgroundColor: '#DDDDDD',transform: [{translateY: this.props.offSet}]}}>
                    <View style={{flexDirection: 'row',justifyContent: 'flex-end',borderTopColor: '#808080',borderTopWidth: 1,borderBottomColor: '#808080',borderBottomWidth:1}}>
                        <TouchableHighlight onPress={ this.closeModal } underlayColor="transparent" style={{paddingRight:10,paddingTop:10,paddingBottom:10}}>
                            <Text style={{color: '#027afe',fontSize: 18}}>Choose</Text>
                        </TouchableHighlight>
                    </View>
                    <PickerIOS
                        selectedValue={this.props.projectVersion}
                        itemStyle={{color:'#242424',fontSize:19,height:212}}
                        onValueChange={(projectVersion) => this.props.changProjectVersion(projectVersion)}>
                        {this.props.projectVersions.map((projectVersion) => (
                            <PickerIOS.Item
                                label={projectVersion.name} value={'{"name":"'+projectVersion.name+'"}'}
                            />
                        ))}
                    </PickerIOS>
                </Animated.View>
            </View>

        )
    }
})

var AssignablePicker = React.createClass({

    componentDidMount: function() {
        Animated.timing(this.props.offSet, {
            duration: 300,
            toValue: 0
        }).start()
    },

    closeModal() {
        Animated.timing(this.props.offSet, {
            duration: 300,
            toValue: deviceHeight
        }).start(this.props.closeModal);
    },

    render() {
        return (
            <View >
                <Animated.View style={{ backgroundColor: '#DDDDDD',transform: [{translateY: this.props.offSet}]}}>
                    <View style={{flexDirection: 'row',justifyContent: 'flex-end',borderTopColor: '#808080',borderTopWidth: 1,borderBottomColor: '#808080',borderBottomWidth:1}}>
                        <TouchableHighlight onPress={ this.closeModal } underlayColor="transparent" style={{paddingRight:10,paddingTop:10,paddingBottom:10}}>
                            <Text style={{color: '#027afe',fontSize: 18}}>Choose</Text>
                        </TouchableHighlight>
                    </View>
                    <PickerIOS
                        selectedValue={this.props.assignee}
                        itemStyle={{color:'#242424',fontSize:19,height:212}}
                        onValueChange={(assign) => this.props.changAssignee(assign)}>
                        {this.props.assignMans.map((assignable) => (
                            <PickerIOS.Item
                                label={assignable.displayName} value={'{"name":'+'"'+assignable.name+'","displayName":"'+assignable.displayName+'"}'}
                            />
                        ))}
                    </PickerIOS>
                </Animated.View>
            </View>

        )
    }
})

export default class CreateBugPageIOS extends React.Component{
    static navigationOptions = {
        tabBarVisible:false,
    };
    constructor(props) {
        super(props);
        this.state = {
            summary:null,
            project:'',
            allversions:[],
            new_versions: [],
            versions:[],
            message:[],
            fixVersions:'',
            assignee:null,
            description:defultValue,
            imageuri: '',
            imageuri2: '',
            imageuri3: '',
            imagename: '',
            imagename2: '',
            imagename3: '',
            loginuser:'',
            loginpassword:'',
            projects:[],
            assignables:[],
            searchWord:'',
            offSet: new Animated.Value(deviceHeight),
            projectModal: false,
            projectVersionModal: false,
            assignModal: false,
            defultValue:defultValue,
            submitButtonIsAble:true,
            upImageState:false,
            upImageState2:false,
            upImageState3:false,
            defultProject:'',
            defultFixversion:'',
            showLoading:false,
            customfields:[],
            basehost:"",
            messages:[],

        };
    }

    componentDidMount() {
        this.loadStorageData();
    }

    componentWillMount() {
        if (Platform.OS === 'android') {
            BackAndroid.addEventListener('hardwareBackPress', ()=>this._pressButton());
        }
    }

    componentWillUnmount() {
        //清除定时器

        if (Platform.OS === 'android') {
            BackAndroid.removeEventListener('hardwareBackPress', ()=>this._pressButton());
        }
    }


    async loadStorageData(){
        var loginuser = await AsyncStorage.getItem(STORAGE_KEY_USERINFO);
        var loginpassword = await AsyncStorage.getItem(STORAGE_KEY_PASSWORD);
        var basehost = await AsyncStorage.getItem(STORAGE_KEY_BASEHOST);
        this.setState({
            loginuser:loginuser,
            loginpassword:loginpassword,
            basehost:basehost,
        },()=>{this.fetchProject()});
    }

    async _loadSubmitHistoryValue(){
        try{
            var project=await AsyncStorage.getItem(STORAGE_KEY_PROJECT);
            var projectversion=await AsyncStorage.getItem(STORAGE_KEY_PROJECTVERSION);
            if(project!=null){
                var projectData = JSON.parse(project);
                var key = projectData.key;
                this.fetchProjectVersion(key);
                this.fetchAssignable(key);
                this.setState({
                    project:project,
                    fixVersions:projectversion,
                });
            }
        }catch(error){
            this._appendMessage('AsyncStorage错误'+error.message);
        }
    }

    fetchProject(){
        var url= this.state.basehost+'/rest/api/latest/project';
        var loginInfo = this.state.loginuser+":"+this.state.loginpassword;
        var baseData = base64.encode(loginInfo);
        const headers=new Headers({"Content-Type":"application/json","Authorization":"Basic "+baseData});
        fetch(url,{
            method: 'GET',
            headers:headers,
        }).then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                if (Platform.OS === 'ios'){
                    this.refs.toast.show('服务器繁忙，请稍后再试!',DURATION.LENGTH_LONG);
                }
            }
        })
            .then((response) => {
                if (response) {
                    this._loadSubmitHistoryValue();
                    this.setState({
                        projects:response,
                    });
                }
            })
            .catch((err)=> {
                console.error(err)
            })
            .done();
    }

    fetchProjectVersion(key){
        this.fetchCreateMeta(key)
        var url= this.state.basehost+'/rest/api/latest/project/'+key;
        var loginInfo = this.state.loginuser+":"+this.state.loginpassword;
        var baseData = base64.encode(loginInfo);
        const headers=new Headers({"Content-Type":"application/json","Authorization":"Basic "+baseData});
        fetch(url,{
            method: 'GET',
            headers:headers,
        }).then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                if (Platform.OS === 'ios'){
                    this.refs.toast.show('服务器繁忙，请稍后再试!',DURATION.LENGTH_LONG);
                }
            }
        })
            .then((response) => {
                if (response) {
                    this.setState({
                        allversions:response.versions,
                    }, ()=>{this.getUNR(this.state.allversions)});
                }
            })
            .catch((err)=> {
                console.error(err)
            })
            .done();

    }

    //获取项目自定义属性
    fetchCreateMeta=(key)=>{
        var url= this.state.basehost + '/rest/api/latest/issue/createmeta?issuetypeIds=1&expand=projects.issuetypes.fields&projectKeys='+key;
        var loginInfo = this.state.loginuser+":"+this.state.loginpassword;
        var baseData = base64.encode(loginInfo);
        const headers=new Headers({"Content-Type":"application/json","Authorization":"Basic "+baseData});
        fetch(url,{
            method: 'GET',
            headers:headers,
        }).then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                this.refs.toast.show('服务器繁忙，请稍后再试!',DURATION.LENGTH_LONG);
            }
        })
            .then((response) => {
                if (response) {
                    var customfields = []
                    if(response.projects.length === 0){
                        this.refs.toast.show('你没有权力!',DURATION.LENGTH_LONG);
                        return
                    }
                    if(response.projects[0].issuetypes.length === 0){
                        this.refs.toast.show('这个项目不可以提交bug!',DURATION.LENGTH_LONG);
                        return
                    }
                    var customfield = response.projects[0].issuetypes[0].fields
                    for (var item in customfield) {
                        if (customfield[item].required && customfield[item].allowedValues ){
                            if (item.indexOf("customfield")>-1){
                                var _item = [item, customfield[item].allowedValues[0].id]
                                customfields.push(_item)
                            }
                        }
                    }
                    this.setState({
                            customfields:customfields
                        })
                }
            })
            .catch((err)=> {
                console.error(err)
            })
            .done();
    }

    fetchAssignable(key){
        var url= this.state.basehost+'/rest/api/latest/user/assignable/search?project='+key+'&username='+this.state.searchWord;
        var loginInfo = this.state.loginuser+":"+this.state.loginpassword;
        var baseData = base64.encode(loginInfo);
        const headers=new Headers({"Content-Type":"application/json","Authorization":"Basic "+baseData});
        fetch(url,{
            method: 'GET',
            headers:headers,
        }).then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                if (Platform.OS === 'ios'){
                    this.refs.toast.show('这个项目好像没有设置人员哦。',DURATION.LENGTH_LONG);
                }
            }
        })
            .then((response) => {
                if (response) {
                    this.setState({
                        assignables:response,

                    });
                }
            })
            .catch((err)=> {
                console.error(err)
            })
            .done();

    }

    fetchPostBug(id,key){
        var url= this.state.basehost+'/rest/api/latest/issue';
        var loginInfo = this.state.loginuser+":"+this.state.loginpassword;
        var baseData = base64.encode(loginInfo);
        var versionData = JSON.parse(this.state.fixVersions);
        var fixVersionName = versionData.name;
        var assignee = JSON.parse(this.state.assignee);
        var customfields = this.state.customfields
        var dataBase = {
            "update": {
                "fixVersions": [
                    {
                        "set": [
                            {
                                "name": fixVersionName
                            }
                        ]
                    }
                ],
                "reporter": [
                    {
                        "set": {
                            "name": this.state.loginuser
                        }
                    }
                ],
                "assignee": [
                    {
                        "set": {
                            "name": assignee.name
                        }
                    }
                ]
            },
            "fields": {
                "project": {
                    "id": id
                },
                "issuetype": {
                    "id": "1"
                },
                "summary": this.state.summary,
                "priority": {
                    "id": "3"
                },
                "description": this.state.description
            }
        }
        if (customfields.length>0){
            customfields.map((item)=>{
                dataBase.fields[item[0]]={"id": item[1]}
            })
        }
        console.log(dataBase)
        var sumbmitData = JSON.stringify(dataBase)
        const headers=new Headers({"Content-Type":"application/json","Authorization":"Basic "+baseData});
        fetch(url,{
            method: 'POST',
            headers:headers,
            body:sumbmitData
        }).then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                loaderHandler.hideLoader();
                if (Platform.OS === 'ios'){
                    this.refs.toast.show('服务器繁忙，请稍后再试!',DURATION.LENGTH_LONG);
                }
            }
        })
            .then((response) => {
                if (response) {
                    if (Platform.OS === 'ios'){
                        this.refs.toast.show('提交成功',DURATION.LENGTH_LONG);
                    }
                    if (this.state.imagename != ''){
                        this.uploadImage(response.key,baseData);
                    }
                    if (this.state.imagename2 != ''){
                        this.uploadImage2(response.key,baseData);
                    }
                    if (this.state.imagename3 != ''){
                        this.uploadImage3(response.key,baseData);
                    }

                    if (this.state.imagename == ''){
                        loaderHandler.hideLoader();
                        setTimeout(()=> {
                            this._pressButton();
                        }, 2000);
                    }

                } else {
                    loaderHandler.hideLoader();
                    if (Platform.OS === 'ios'){
                        this.refs.toast.show('发送失败',DURATION.LENGTH_LONG);
                    }
                }
            })
            .catch((err)=> {
                loaderHandler.hideLoader();
                console.error(err)
            })
            .done();
    }

    async _saveProjectHistoryValue(id){
        try{
            await AsyncStorage.setItem(STORAGE_KEY_PROJECT,id);
        }catch(error){
            this._appendMessage('AsyncStorage错误'+error.message);
        }
    }
    _appendMessage(message){
        this.setState({messages:message});
    }

    async _saveVersionHistoryValue(version){
        try{
            await AsyncStorage.setItem(STORAGE_KEY_PROJECTVERSION,version);
        }catch(error){
            this._appendMessage('AsyncStorage错误'+error.message);
        }
    }

    uploadImage(key,baseData){
        var url= this.state.basehost+'/rest/api/latest/issue/'+key+'/attachments';
        let formData = new FormData();
        let file = {uri: this.state.imageuri, type: 'multipart/form-data', name: this.state.imagename};

        formData.append("file",file);

        fetch(url,{
            method:'POST',
            headers:{
                'X-Atlassian-Token': 'nocheck',
                "Authorization":"Basic "+baseData
            },
            body:formData,
        }).then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                if (Platform.OS === 'ios'){
                    this.refs.toast.show('服务器繁忙，请稍后再试!',DURATION.LENGTH_LONG);
                }
            }
        })
            .then((response) => {
                if (response) {
                    if (Platform.OS === 'ios'){
                        this.refs.toast.show('上传截图1成功',DURATION.LENGTH_LONG);
                    }
                    this.setState({ upImageState:true } ,()=>{console.log('now up 1 sate nei '+ this.state.upImageState)})
                    console.log('now up 1 sate wai '+ this.state.upImageState)
                } else {
                    if (Platform.OS === 'ios'){
                        this.refs.toast.show('上传截图1失败',DURATION.LENGTH_LONG);
                    }
                }
            })
            .catch((err)=> {
                loaderHandler.hideLoader();
                if (Platform.OS === 'ios'){
                    this.refs.toast.show('服务器繁忙，请稍后再试!',DURATION.LENGTH_LONG);
                }
            })
            .done();

    }

    uploadImage2(key,baseData){
        var url= 'http://jira.vemic.com/rest/api/latest/issue/'+key+'/attachments';
        var _url= 'http://192.168.1.104:5000/rest/api/latest/issue/'+key+'/attachments';
        let formData = new FormData();
        let file = {uri: this.state.imageuri2, type: 'multipart/form-data', name: this.state.imagename2};

        formData.append("file",file);

        fetch(url,{
            method:'POST',
            headers:{
                'X-Atlassian-Token': 'nocheck',
                "Authorization":"Basic "+baseData
            },
            body:formData,
        }).then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                if (Platform.OS === 'ios'){
                    this.refs.toast.show('服务器繁忙，请稍后再试!',DURATION.LENGTH_LONG);
                }
            }
        })
            .then((response) => {
                if (response) {
                    if (Platform.OS === 'ios'){
                        this.refs.toast.show('上传截图2成功',DURATION.LENGTH_LONG);
                    }
                    this.setState({ upImageState2:true })
                } else {
                    if (Platform.OS === 'ios'){
                        this.refs.toast.show('上传截图2失败',DURATION.LENGTH_LONG);
                    }
                }
            })
            .catch((err)=> {
                loaderHandler.hideLoader();
                if (Platform.OS === 'ios'){
                    this.refs.toast.show('服务器繁忙，请稍后再试!',DURATION.LENGTH_LONG);
                }
            })
            .done();

    }

    uploadImage3(key,baseData){
        var url= 'http://jira.vemic.com/rest/api/latest/issue/'+key+'/attachments';
        var _url= 'http://192.168.1.104:5000/rest/api/latest/issue/'+key+'/attachments';
        let formData = new FormData();
        let file = {uri: this.state.imageuri3, type: 'multipart/form-data', name: this.state.imagename3};

        formData.append("file",file);

        fetch(url,{
            method:'POST',
            headers:{
                'X-Atlassian-Token': 'nocheck',
                "Authorization":"Basic "+baseData
            },
            body:formData,
        }).then((response) => {
            if (response.ok) {
                return response.json()
            } else {
                if (Platform.OS === 'ios'){
                    this.refs.toast.show('服务器繁忙，请稍后再试!',DURATION.LENGTH_LONG);
                }
            }
        })
            .then((response) => {
                if (response) {
                    if (Platform.OS === 'ios'){
                        this.refs.toast.show('上传截图3成功',DURATION.LENGTH_LONG);
                    }
                    this.setState({ upImageState3:true })
                } else {
                    if (Platform.OS === 'ios'){
                        this.refs.toast.show('上传截图3失败',DURATION.LENGTH_LONG);
                    }
                }
            })
            .catch((err)=> {
                loaderHandler.hideLoader();
                if (Platform.OS === 'ios'){
                    this.refs.toast.show('服务器繁忙，请稍后再试!',DURATION.LENGTH_LONG);
                }
            })
            .done();

    }

    _pressButton() {
        this.props.navigation.goBack()
    }

    openMycamera = () =>{
        ImagePicker.showImagePicker(photoOptions,(response) => {

            if (response.didCancel) {
                console.log('User cancelled image picker');
                return
            }
            else if (response.error) {
                console.log('ImagePickerManager Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                // You can display the image using either data:
                //const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};

                //// uri (on iOS)
                //const source = {uri: response.uri.replace('file://', ''), isStatic: true};
                //// uri (on android)
                const source = {uri: response.uri, isStatic: true};
                this.setState({
                    imageuri: response.uri,
                    imagename: response.fileName,
                });
            }
        });
    }

    openMycamera2 = () =>{
        ImagePicker.showImagePicker(photoOptions,(response) => {

            if (response.didCancel) {
                console.log('User cancelled image picker');
                return
            }
            else if (response.error) {
                console.log('ImagePickerManager Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                // You can display the image using either data:
                //const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};

                //// uri (on iOS)
                //const source = {uri: response.uri.replace('file://', ''), isStatic: true};
                //// uri (on android)
                const source = {uri: response.uri, isStatic: true};
                this.setState({
                    imageuri2: response.uri,
                    imagename2: response.fileName,
                });
            }
        });
    }

    openMycamera3 = () =>{
        ImagePicker.showImagePicker(photoOptions,(response) => {

            if (response.didCancel) {
                console.log('User cancelled image picker');
                return
            }
            else if (response.error) {
                console.log('ImagePickerManager Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                // You can display the image using either data:
                //const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};

                //// uri (on iOS)
                //const source = {uri: response.uri.replace('file://', ''), isStatic: true};
                //// uri (on android)
                const source = {uri: response.uri, isStatic: true};
                this.setState({
                    imageuri3: response.uri,
                    imagename3: response.fileName,
                });
            }
        });
    }

    submit(){

        var assignee = JSON.parse(this.state.assignee);
        try{
            if (this.state.project != "" &&(assignee.name != ""||assignee.name != null)) {
                loaderHandler.showLoader("请稍等");
                var projectData = JSON.parse(this.state.project);
                var key = projectData.key;
                var id = projectData.id;
                if (Platform.OS === 'ios'){
                    this.refs.toast.show('正在提交...',DURATION.LENGTH_LONG);
                }
                if (this.state.submitButtonIsAble) {
                    this.setState({
                        submitButtonIsAble:false,
                    });
                    this.fetchPostBug(id, key);
                    setTimeout(()=> {
                        this.setState({submitButtonIsAble:true});
                    }, 3000);

                }
                else{
                    loaderHandler.hideLoader();
                    Alert.alert("温馨提示","我不是秋香，别老是点我！");}
            }else {
                if (Platform.OS === 'ios'){
                    loaderHandler.hideLoader();
                    this.refs.toast.show('请补充BUG信息',DURATION.LENGTH_LONG);
                }
            }
        }catch(error) {
            loaderHandler.hideLoader();
            Alert.alert("请补充BUG信息");}
    }

    getUNR(allversions){
        var new_versions=[];
        allversions.map((item)=>{
            if (item.released == false){
                new_versions.push(item);
            }
        });
        this.setState({
            versions:new_versions
        })
    }

    searchAssignMan(){
        if (this.state.project != "") {
            var projectData = JSON.parse(this.state.project);
            var key = projectData.key;
            this.fetchAssignable(key)
        }else {
            if (Platform.OS === 'ios'){
                this.refs.toast.show('请先选择项目',DURATION.LENGTH_LONG);
            }
        }
    }

    changProject(projectItem){
        this.setState({
            project: projectItem
        });
        var projectData = JSON.parse(projectItem);
        var key = projectData.key;
        this.fetchProjectVersion(key);
        this.fetchAssignable(key);
        this._saveProjectHistoryValue(projectItem)
    }

    changProjectVersion(projectVersionItem){
        if(projectVersionItem != ''){
            this.setState({
                fixVersions:projectVersionItem
            });
            this._saveVersionHistoryValue(projectVersionItem);
        }
    }

    changAssignee(assignee){
        if (assignee !=''){
            this.setState({
                assignee:assignee
            })
        }
    }

    getProjectItem(){
        var projectData = JSON.parse(this.state.project);
        var projectName = projectData.name;
        return <Text style={{fontSize: 18,}}>{projectName}</Text>

    }

    getAssignee(){
        var assignee = JSON.parse(this.state.assignee);
        try{
            var assigneeName = assignee.displayName;
            return <Text style={{fontSize: 18,}}>{assigneeName}</Text>
        }catch (error){
            return <Text style={{fontSize: 18,}}>请选择指给目标</Text>
        }
    }

    checkAssignables(){
        if (this.state.assignables == []){
            this.refs.toast.show('请先选择项目',DURATION.LENGTH_LONG)
        }else {
            this.setState({assignModal: true,projectModal: false,projectVersionModal: false,})
        }
    }

    getAddPhoto(){
        if (this.state.imageuri == ''){
            return <Image source={require('../image/add_photo.png')} style={{width:100,height:100}}/>
        }else {
            return <Image source={{uri:this.state.imageuri}} style={{width:100,height:100}}/>
        }}

    getAddPhoto2(){
        if (this.state.imageuri2 == ''){
            return <Image source={require('../image/add_photo.png')} style={{width:100,height:100}}/>
        }else {
            return <Image source={{uri:this.state.imageuri2}} style={{width:100,height:100}}/>
        }}

    getAddPhoto3(){
        if (this.state.imageuri3 == ''){
            return <Image source={require('../image/add_photo.png')} style={{width:100,height:100}}/>
        }else {
            return <Image source={{uri:this.state.imageuri3}} style={{width:100,height:100}}/>
        }}

    setAddPhotoCount(){
        this.doneLoading();

        if (this.state.imageuri == ''){
            return(
                <View>
                    <TouchableOpacity onPress={()=>this.openMycamera()}>
                        {this.getAddPhoto()}
                    </TouchableOpacity>
                </View>)
        }
        else if(this.state.imageuri != ''&&this.state.imageuri2 == ''&&this.state.imageuri3 == ''){
            return(
                <View style={{flex: 1,flexDirection:'row'}}>
                    <View>
                        <TouchableOpacity onPress={()=>this.openMycamera()}>
                            {this.getAddPhoto()}
                        </TouchableOpacity>
                    </View>
                    <View style={{marginLeft:10}}>
                        <TouchableOpacity onPress={()=>this.openMycamera2()}>
                            {this.getAddPhoto2()}
                        </TouchableOpacity>
                    </View>
                </View>)
        }
        else if(this.state.imageuri != ''&&this.state.imageuri2 != ''){
            return(
                <View style={{flex: 1,flexDirection:'row'}}>
                    <View>
                        <TouchableOpacity onPress={()=>this.openMycamera()}>
                            {this.getAddPhoto()}
                        </TouchableOpacity>
                    </View>
                    <View style={{marginLeft:10}}>
                        <TouchableOpacity onPress={()=>this.openMycamera2()}>
                            {this.getAddPhoto2()}
                        </TouchableOpacity>
                    </View>
                    <View style={{marginLeft:10}}>
                        <TouchableOpacity onPress={()=>this.openMycamera3()}>
                            {this.getAddPhoto3()}
                        </TouchableOpacity>
                    </View>
                </View>)
        }

    }

    getfixVersionName(){
        try{
            var versionData = JSON.parse(this.state.fixVersions);
            var fixVersionName = versionData.name;
            return fixVersionName;
        }catch (error){
            return '';
        }


    }

    doneLoading(){
        if (this.state.imagename != ''&&this.state.imagename2 == ''){
            if(this.state.upImageState){
                loaderHandler.hideLoader();
                setTimeout(()=> {
                    this._pressButton();
                }, 2000);
            }

        }if (this.state.imagename != ''&&this.state.imagename2 != ''&&this.state.imagename3 == ''){
            if(this.state.upImageState&&this.state.upImageState2){
                loaderHandler.hideLoader();
                setTimeout(()=> {
                    this._pressButton();
                }, 2000);
            }

        }if (this.state.imagename != ''&&this.state.imagename2 != ''&&this.state.imagename3 != ''){
            if(this.state.upImageState&&this.state.upImageState2&&this.state.upImageState3){
                loaderHandler.hideLoader();
                setTimeout(()=> {
                    this._pressButton();
                }, 2000);

            }
        }
    }


    render(){
        let projectItem = this.state.project == ''? <Text style={{fontSize: 18,color:'#C0C0C0'}}>请选择项目</Text> : this.getProjectItem();
        let projectVersion = this.state.fixVersions == ''? <Text style={{fontSize: 18,color:'#C0C0C0'}}>请选择解决版本</Text> : <Text style={{fontSize: 18,}}>{this.getfixVersionName()}</Text>;
        let assignableItem = this.state.assignee== null? <Text style={{fontSize: 18,color:'#C0C0C0'}}>请选择指给目标</Text> : this.getAssignee();
        let addP = this.setAddPhotoCount();

        return (
            <View style={{flex: 1,backgroundColor: '#63B8FF'}}>
                <StatusBar backgroundColor='#63B8FF'></StatusBar>
                <View style={{backgroundColor:'#63B8FF',marginTop:20}}>
                    <View
                        style={{padding: 15,marginLeft:10,justifyContent: 'center',alignItems: 'center',flexDirection:'row'}}>
                        <TouchableOpacity onPress={()=>this._pressButton()}
                                          style={{alignItems:'flex-start',flex:2,}}>
                            <Image source={require('../image/back.png')} style={{width:30,height:30}}/>
                        </TouchableOpacity>
                        <Text style={{fontSize:20,flex:2,textAlign:'center',marginRight:20}}>新建BUG</Text>
                        <TouchableOpacity style={{alignItems:'center',flex:2}} onPress={()=>this.submit()}>
                            <Text style={{fontWeight:'bold',color:'blue',fontSize:18}}>提交</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <KeyboardAwareScrollView ref="scrollView" style={{flex:1}}>

                    <View style={{flex:1,padding: 10,backgroundColor:'#f2ecde'}}>

                        <TouchableHighlight style={{backgroundColor:'#fff',marginTop:10,height:40,justifyContent: 'center'}} underlayColor="transparent" onPress={ () =>
                            this.state.projects == [] ?
                            this.refs.toast.show('获取项目列表失败,请检查网络!',DURATION.LENGTH_LONG)
                            :this.setState({projectModal: true,projectVersionModal: false,assignModal: false,}) }>
                            <View style={{marginLeft:20,flexDirection:'row',alignItems:'center'}}>
                                {projectItem}
                                <Image source={require('../image/font.png')} style={{height:35,width:35}}></Image>
                            </View>
                        </TouchableHighlight>

                        <View style={{backgroundColor:'#fff',marginTop:10,justifyContent:'center'}}>
                            <TextInput
                                style={{marginLeft:20,height:40}}
                                placeholder='请输入标题'
                                numberOfLines={1}
                                underlineColorAndroid={'transparent'}
                                onChangeText={(text) => {
                            this.setState({
                                summary: text
                            })
                        }}
                            />
                            <View
                                style={{height:1,backgroundColor:'#f4f4f4'}}
                            />
                        </View>
                        <View >
                            <Text>Fix version:</Text>
                            <View style={{backgroundColor:'#fff',height:40,}}>
                                <TouchableHighlight style={{backgroundColor:'#fff',height:40,justifyContent: 'center'}} underlayColor="transparent" onPress={ () =>
                                this.state.versions.length == 0 ?
                                this.refs.toast.show('请先选择项目',DURATION.LENGTH_LONG)
                                : this.setState({projectVersionModal: true,projectModal: false,assignModal: false,},console.log('versions:'+this.state.versions)) }>
                                    <View style={{marginLeft:20,flexDirection:'row',alignItems:'center'}}>
                                        {projectVersion}
                                        <Image source={require('../image/font.png')} style={{height:35,width:35}}></Image>
                                    </View>
                                </TouchableHighlight>
                            </View>
                        </View>
                        <View >
                            <Text>Assign to:</Text>
                            <View style={{flex:1,backgroundColor:'#fff',height:40,flexDirection: 'row'}}>
                                <View style={{flex:2}}>
                                    <TextInput
                                        style={{backgroundColor:'#fff',justifyContent: 'center',height:40,marginLeft:20}}
                                        placeholder='输入拼音搜索'
                                        numberOfLines={1}
                                        keyboardType='email-address'
                                        underlineColorAndroid={'transparent'}
                                        onChangeText={(text) => {
                                this.setState({
                                    searchWord: text
                                });
                                this.searchAssignMan();
                            }}
                                    />
                                </View>
                                <View
                                    style={{width:1,backgroundColor:'#e0deec'}}
                                />
                                <View style={{flex:2}}>
                                    <TouchableHighlight style={{backgroundColor:'#fff',height:40,justifyContent: 'center'}} underlayColor="transparent" onPress={ () =>{this.state.assignables.length == 0?this.refs.toast.show('请先选择项目',DURATION.LENGTH_LONG):this.setState({assignModal: true,projectModal: false,projectVersionModal: false,})}}>
                                        <View style={{marginLeft:20,flexDirection:'row',alignItems:'center'}}>
                                            {assignableItem}
                                            <Image source={require('../image/font.png')} style={{height:35,width:35}}></Image>
                                        </View>
                                    </TouchableHighlight>
                                </View>
                            </View>
                        </View>
                        <Text>附件：</Text>
                        <View style={{flex: 1,padding:10,height:120,justifyContent: 'center',alignItems: 'center',backgroundColor: 'white',}}>
                            <View>
                                {addP}
                            </View>
                        </View>
                        <View >
                            <Text>描述:</Text>
                            <TextInput
                                ref="textInput"
                                style={{backgroundColor:'#fff',marginTop:10,height:200,fontSize: 16}}
                                defaultValue = {this.state.defultValue}
                                numberOfLines={10}
                                multiline={true}
                                textAlignVertical ='top'
                                blurOnSubmit={false}
                                underlineColorAndroid={'transparent'}
                                onChangeText={(text) => {
                            this.setState({
                                description: text
                            })
                        }}
                            />
                            <View
                                style={{height:1,backgroundColor:'#f4f4f4'}}
                            />
                        </View>
                        <View style={{height: 80}}></View>
                    </View>
                </KeyboardAwareScrollView>
                { this.state.projectModal ? <ProjectPicker closeModal={() => this.setState({ projectModal: false })} offSet={this.state.offSet} changProject={this.changProject.bind(this)}  projects={this.state.projects} project={this.state.project}/> : null }
                { this.state.projectVersionModal ? <ProjectVersionPicker closeModal={() => this.setState({ projectVersionModal: false })} offSet={this.state.offSet} changProjectVersion={this.changProjectVersion.bind(this)}  projectVersions={this.state.versions} projectVersion={this.state.fixVersions}/> : null }
                { this.state.assignModal ? <AssignablePicker closeModal={() => this.setState({ assignModal: false })} offSet={this.state.offSet} changAssignee={this.changAssignee.bind(this)}  assignMans={this.state.assignables} assignee={this.state.assignee}/> : null }
                <Toast ref="toast" position='center'/>
                <BusyIndicator Size={'large'}/>
            </View>
        );
    }
}
