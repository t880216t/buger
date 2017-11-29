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
    StatusBar
} from 'react-native';
import React,{Component} from 'react';

export default class TaskDetail extends Component {
    static navigationOptions = {
        tabBarVisible:false,
    };
    // 构造
      constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            bugData:{}
        };
      }

    componentDidMount() {
        const {params} = this.props.navigation.state;
        const {bugData} = params.bugData;
        this.setState({
            bugData:bugData
        })
    }

    handlerLogWork=(e,navigate)=>{
        navigate('LogWork',{bugData:this.state.bugData})
    }

    formatTime=(txt)=>{
        var re1='((?:(?:[1]{1}\\d{1}\\d{1}\\d{1})|(?:[2]{1}\\d{3}))[-:\\/.](?:[0]?[1-9]|[1][012])[-:\\/.](?:(?:[0-2]?\\d{1})|(?:[3][01]{1})))(?![\\d])';	// YYYYMMDD 1
        var re2='.*?';	// Non-greedy match on filler
        var re3='((?:(?:[0-1][0-9])|(?:[2][0-3])|(?:[0-9])):(?:[0-5][0-9])?(?:\\s?(?:am|AM|pm|PM))?)';	// HourMinuteSec 1

        var p = new RegExp(re1+re2+re3,["i"]);
        var m = p.exec(txt);
        if (m != null)
        {
            var yyyymmdd1=m[1];
            var time1=m[2];
            var time = yyyymmdd1.replace(/</,"&lt;")+"\t\t"+time1.replace(/</,"&lt;");
            return time
        }
    }

    render() {
        const { navigate } = this.props.navigation;
        const {params} = this.props.navigation.state;
        const {bugData} = params.bugData;
        return (
            <View style={{flex: 1,backgroundColor: '#63B8FF'}}>
                <StatusBar backgroundColor='#63B8FF'></StatusBar>
                <View style={{backgroundColor:'#63B8FF',marginTop: Platform.OS === 'android' ? 0 : 20,}}>
                    <View
                        style={{padding: 15,marginLeft:10,justifyContent: 'center',alignItems: 'center',flexDirection:'row'}}>
                        <TouchableOpacity onPress={()=>{this.props.navigation.goBack()}}
                                          style={{alignItems:'flex-start',flex:2,}}>
                            <Image source={require('../image/back.png')} style={{width:25,height:25}}/>
                        </TouchableOpacity>
                        <Text style={{fontSize:17,flex:2,textAlign:'center',fontWeight:'bold'}}>详情</Text>
                        <TouchableOpacity onPress={(e)=>{this.handlerLogWork(e,navigate)}}
                                          style={{alignItems:'flex-end',flex:2,}}>
                            <Text style={{fontSize:15,color:'blue',textAlign:'center'}}>Log Work</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView style={{flex:1,backgroundColor:'#f2ecde'}}>
                    <View style={{padding:15, flexDirection:'row',backgroundColor:'#fff',}}>
                        <Text style={{flex:1,fontWeight: 'bold',fontSize:18}}>{bugData.fields.summary}</Text>
                    </View>
                    <Text style={{marginTop:15,marginLeft:5}}>详细描述：</Text>
                    <View style={{padding: 15,backgroundColor:'#fff'}}>
                        <Text style={{color: '#595351',fontSize:16}}>{bugData.fields.description}</Text>
                    </View>
                    {bugData.fields.attachment.map((item,index)=>{
                        var contentName = item.content.indexOf('jpg')
                        if(contentName > 0){
                            return(
                                <View key={index} style={{padding: 15,backgroundColor:'#fff'}}>
                                    <Image source={{uri:item.content}}
                                           style={{maxWidth:Dimensions.get('window').width-10,minHeight: Dimensions.get('window').height,resizeMode:'contain'}}
                                    ></Image>
                                </View>
                            )
                        }

                    })}
                    <Text style={{marginTop:15,marginLeft:5}}>工作日志：</Text>
                    {bugData.fields.worklog.worklogs.map((item,index)=>{
                        return(
                            <View key={index} style={{marginTop: 5,padding: 15,backgroundColor:'#fff'}}>
                                <View style={{marginTop:10,flexDirection:'row'}}>
                                    <Text style={{color:'#326ca6',fontWeight: 'bold',fontSize:13}}>{item.updateAuthor.displayName}</Text>
                                    <Text style={{color:'#000',fontSize:13,marginLeft: 30}}> logged work -</Text>
                                    <Text style={{color:'#000',fontSize:13,marginLeft: 10}}>{this.formatTime(item.updated)}</Text>
                                </View>
                                <View style={{marginTop:10,flexDirection:'row'}}>
                                    <Text style={{color:'#666',fontWeight: 'bold',fontSize:13}}>Time Spent:</Text>
                                    <Text style={{color:'#000',fontSize:13,marginLeft: 30}}>{item.timeSpent}</Text>
                                </View>
                                <View style={{marginTop:10,flexDirection:'row'}}>
                                    <Text style={{color:'#666',fontWeight: 'bold',fontSize:13}}>comment:</Text>
                                    <Text style={{color:'#000',fontSize:13,marginLeft: 30}}>{item.comment}</Text>
                                </View>
                            </View>
                        )
                    })}
                </ScrollView>
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
    backgroundImage:{
        flex:1,
        minHeight: Dimensions.get('window').height,
        resizeMode:'cover'
    },
})