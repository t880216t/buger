/**
 * Created by chenjian 17/2/11.
 * bug列表
 */

'use strict';

import {
    StyleSheet,
    ListView,
    Image,
    Text,
    View,
    Platform,
    BackHandler,
    Navigator,
    TouchableOpacity,
    InteractionManager,
    Alert,
    ScrollView,
    Picker,
    PiexRatio,
    TextInput,
    AsyncStorage,
    ToastAndroid,
} from 'react-native';

import React,{Component} from 'react';
import  ImagePicker from 'react-native-image-picker'; //第三方相机
var STORAGE_KEY_USERINFO="userinfo";
var STORAGE_KEY_PASSWORD="password";
var STORAGE_KEY_PROJECT="project";
var STORAGE_KEY_PROJECTVERSION="projectversion";
var STORAGE_KEY_BASEHOST="basehost";
var base64 = require('base-64');
var DeviceInfo = require('react-native-device-info');
var Device_Manufacturer = DeviceInfo.getManufacturer();
var Device_system_version = DeviceInfo.getSystemVersion();
var photoOptions = {
    //底部弹出框选项
    title:'请选择',
    cancelButtonTitle:'取消',
    takePhotoButtonTitle:Device_Manufacturer =='HUAWEI' && Device_system_version=='4.4.2'? null:'拍照',
    chooseFromLibraryButtonTitle:'选择相册',
    quality:0.5,
    allowsEditing:true,
    noData:false,
    storageOptions: {
        skipBackup: true,
        path:'images'
    }
}

var defultValue = '前置条件：'+'\n'+'\n'+'\n'+'步骤:'+'\n'+'\n'+'\n'+'预期结果：';

class CreateBugPage extends Component{
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
            assignee:'',
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
            defultValue:defultValue,
            submitButtonIsAble:true,
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
            BackHandler.addEventListener('hardwareBackPress', ()=>this._pressButton());
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', ()=>this._pressButton());
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
                var id = projectData.id;
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
        var url= this.state.basehost + '/rest/api/latest/project';
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
                ToastAndroid.show('服务器繁忙，请稍后再试!',ToastAndroid.LONG)
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
        var url= this.state.basehost + '/rest/api/latest/project/'+key;
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
                ToastAndroid.show('服务器繁忙，请稍后再试!',ToastAndroid.LONG)
            }
        })
            .then((response) => {
                if (response) {
                    this.setState({
                        allversions:response.versions,
                    }, ()=>{this.getUNR(this.state.allversions)

                    });
                }
            })
            .catch((err)=> {
                console.error(err)
            })
            .done();

    }

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
                ToastAndroid.show('服务器繁忙，请稍后再试!',ToastAndroid.LONG)
            }
        })
            .then((response) => {
                if (response) {
                    var customfields = []
                    if(response.projects.length === 0){
                        ToastAndroid.show('你没有权力!',ToastAndroid.LONG)
                        return
                    }
                    if(response.projects[0].issuetypes.length === 0){
                        ToastAndroid.show('这个项目不可以提交bug!',ToastAndroid.LONG)
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
        var url= this.state.basehost + '/rest/api/latest/user/assignable/search?project='+key+'&username='+this.state.searchWord;
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
                ToastAndroid.show('这个项目好像没有设置人员哦。',ToastAndroid.LONG)
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
        var url= this.state.basehost + '/rest/api/latest/issue';
        var loginInfo = this.state.loginuser+":"+this.state.loginpassword;
        var baseData = base64.encode(loginInfo);
        if(this.state.fixVersions===""||this.state.fixVersions===null){
            ToastAndroid.show("请尝试重新选择:Fix Version",ToastAndroid.LONG);
            return
        }
        var versionData = JSON.parse(this.state.fixVersions);
        var fixVersionName = versionData.name;
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
                            "name": this.state.assignee
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
                "description": this.state.description,
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
                ToastAndroid.show('服务器繁忙，请稍后再试!',ToastAndroid.LONG)
            }
        })
            .then((response) => {
                if (response) {
                    ToastAndroid.show("提交成功",ToastAndroid.LONG);
                    if (this.state.imagename != ''){
                        this.uploadImage(response.key,baseData);
                    }
                    if (this.state.imagename2 != ''){
                        this.uploadImage2(response.key,baseData);
                    }
                    if (this.state.imagename3 != ''){
                        this.uploadImage3(response.key,baseData);
                    }
                    this._pressButton();

                } else {
                    ToastAndroid.show("发送失败",ToastAndroid.LONG);
                }
            })
            .catch((err)=> {
                ToastAndroid.show('服务器繁忙，请稍后再试!',ToastAndroid.LONG)
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
    _appendMessage(message){
        this.setState({messages:message});
    }

    uploadImage(key,baseData){
        var url= this.state.basehost + '/rest/api/latest/issue/'+key+'/attachments';
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
                ToastAndroid.show('服务器繁忙，请稍后再试!',ToastAndroid.LONG)
            }
        })
            .then((response) => {
                if (response) {
                    ToastAndroid.show("上传截图1成功",ToastAndroid.LONG);

                } else {
                    ToastAndroid.show("上传截图1失败",ToastAndroid.LONG);
                }
            })
            .catch((err)=> {
                console.error(err)
            })
            .done();

    }

    uploadImage2(key,baseData){
        var url= this.state.basehost + '/rest/api/latest/issue/'+key+'/attachments';
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
                ToastAndroid.show('服务器繁忙，请稍后再试!',ToastAndroid.LONG)
            }
        })
            .then((response) => {
                if (response) {
                    ToastAndroid.show("上传截图2成功",ToastAndroid.LONG);


                } else {
                    ToastAndroid.show("上传截图2失败",ToastAndroid.LONG);
                }
            })
            .catch((err)=> {
                console.error(err)
            })
            .done();

    }

    uploadImage3(key,baseData){
        var url= this.state.basehost + '/rest/api/latest/issue/'+key+'/attachments';
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
                ToastAndroid.show('服务器繁忙，请稍后再试!',ToastAndroid.LONG)
            }
        })
            .then((response) => {
                if (response) {
                    ToastAndroid.show("上传截图3成功",ToastAndroid.LONG);


                } else {
                    ToastAndroid.show("上传截图3失败",ToastAndroid.LONG);
                }
            })
            .catch((err)=> {
                console.error(err)
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
        if (this.state.project != "") {
            var projectData = JSON.parse(this.state.project);
            var key = projectData.key;
            var id = projectData.id;
            ToastAndroid.show("正在提交...", ToastAndroid.LONG);
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
                Alert.alert("温馨提示","我不是秋香，别老是点我！");}
        }else {
            ToastAndroid.show("请补充BUG信息",ToastAndroid.LONG);
        }
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

    getProjectItem(projectItem) {
        return <Picker.Item label={projectItem.name} value={'{"id":'+'"'+projectItem.id+'","key":"'+projectItem.key+'"}'}/>;
    }

    getProjectVersion(projectVersion){
        return <Picker.Item label={projectVersion.name} value={'{"name":"'+projectVersion.name+'"}'} />;
    }

    getAssignableItem(assignable){
        return <Picker.Item label={assignable.displayName} value={assignable.name} />
    }

    searchAssignMan(){
        if (this.state.project != "") {
            var projectData = JSON.parse(this.state.project);
            var key = projectData.key;
            this.fetchAssignable(key)
        }else {
            ToastAndroid.show('请先选择项目',ToastAndroid.LONG);
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
        if (this.state.imageuri == ''&&this.state.imageuri2 == ''&&this.state.imageuri3 == ''){
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



    render(){
        let projectItem = this.state.projects.map((item)=>this.getProjectItem(item));
        let projectVersion = this.state.versions.map((item)=>this.getProjectVersion(item));
        let assignableItem = this.state.assignables.map((item)=>this.getAssignableItem(item));
        let addP = this.setAddPhotoCount();



        return (
            <View style={{flex: 1}}>
                <ScrollView>
                <View style={{backgroundColor:'#63B8FF',}}>
                    <View
                        style={{padding: 15,marginLeft:10,justifyContent: 'center',alignItems: 'center',flexDirection:'row'}}>
                        <TouchableOpacity onPress={()=>this._pressButton()}
                                          style={{alignItems:'flex-start',flex:2,}}>
                            <Image source={require('../image/back.png')} style={{width:30,height:30}}/>
                        </TouchableOpacity>
                        <Text style={{fontSize:20,flex:4,textAlign:'center',marginRight:20}}>新建BUG</Text>
                        <TouchableOpacity style={{alignItems:'center',flex:2,}} onPress={()=>this.submit()}>
                            <Text style={{fontWeight:'bold',color:'blue',fontSize:18}}>提交</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{flex:1,padding: 10}}>
                    <View  style={{backgroundColor:'#fff',marginTop:10,height:40,}}>
                        <Picker
                            selectedValue={this.state.project}
                            onValueChange={(lang) => {
                            this.setState({
                                project:lang
                            });
                            var projectData = JSON.parse(lang);
                            var key = projectData.key;
                            this.fetchProjectVersion(key);
                            this.fetchAssignable(key);
                            this._saveProjectHistoryValue(lang)
                        }}
                            mode="dialog"
                            style={{color:'#48464b'}}
                        >
                            {projectItem}

                        </Picker>

                    </View>
                    <View>
                        <TextInput
                            style={{backgroundColor:'#fff',marginTop:10,height:40,}}
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
                            <Picker
                                selectedValue={this.state.fixVersions}
                                onValueChange={(lang)=>{
                                    this.setState({fixVersions:lang});
                                    this._saveVersionHistoryValue(lang)
                                }}
                                mode="dialog"
                                style={{color:'#48464b'}}
                            >
                                {projectVersion}
                            </Picker>
                        </View>
                    </View>
                    <View >
                        <Text>Assign to:</Text>
                        <View style={{flex:1,backgroundColor:'#fff',height:40,flexDirection: 'row'}}>
                            <View style={{flex:2}}>
                                <TextInput
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
                                <Picker
                                    selectedValue={this.state.assignee}
                                    onValueChange={lang => this.setState({assignee:lang})}
                                    mode="dialog"
                                    style={{color:'#48464b'}}
                                >
                                    {assignableItem}
                                </Picker>
                            </View>
                        </View>
                    </View>
                    <Text>附件：</Text>
                    <View style={styles.container}>
                        <View>
                            {addP}
                        </View>
                    </View>
                    <View >
                        <Text>描述:</Text>
                        <TextInput
                            style={{backgroundColor:'#fff',marginTop:10,height:200,}}
                            defaultValue = {this.state.defultValue}
                            numberOfLines={10}
                            multiline={true}
                            textAlignVertical ='top'
                            underlineColorAndroid={'transparent'}
                            blurOnSubmit={false}
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
                </View>
                </ScrollView>
            </View>
        );
    }
}

export default CreateBugPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding:10,
        height:120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
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

