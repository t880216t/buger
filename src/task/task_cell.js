import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Dimensions,
    TouchableOpacity
} from 'react-native';

export default class TaskCell extends Component {
    constructor(props) {
        super(props);
        this.state = {
            createTime:null,
        };
    }

    componentDidMount(){
        let {bugData} = this.props;
        var txt= bugData.fields.created;

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
            this.setState({createTime:time});
        }
    }

    render() {
        let bugData = this.props.bugData;
        var displayName = bugData.fields.assignee ? bugData.fields.assignee.displayName:'未知目标';
        return (
            <TouchableOpacity
                onPress={this.props.onSelect}
                underlayColor='gray'>
                <View style={{ flex:1,backgroundColor:'#FFF'}}>
                    <View style={{marginTop:10,marginRight:5,marginLeft:5, flexDirection:'row'}}>
                        <View style={{flex: 1}}>
                            <Text style={{fontSize:15}}>{bugData.key}</Text>
                        </View>
                        <View  style={{flex: 1,alignItems:'flex-end',marginRight:5}}>
                            <Text style={{fontSize:14}}>{this.state.createTime}</Text>
                        </View>
                    </View>
                    <View style={{padding:5, flexDirection:'row'}}>
                        <View style={{flex:9,}}>
                            <Text style={{fontSize:17,fontWeight:'bold'}} numberOfLines={2}>{bugData.fields.summary}</Text>
                        </View>
                        <View style={{flex:1,}}>
                            <Image
                                style={{width:25,height:25,marginRight:8}}
                                source={{uri:bugData.fields.status.iconUrl}}/>
                        </View>
                    </View>
                    <View style={{flex:1,marginRight:5,marginLeft:5,marginBottom:5, flexDirection:'row'}}>
                        <View style={{flex: 1}}>
                            <Text style={{fontSize:14}}>Assignee:{displayName}</Text>
                        </View>
                        <View  style={{flex: 1,alignItems:'flex-end',marginRight:5}}>
                            <Text style={{fontSize:14}}>{bugData.fields.status.name}</Text>
                        </View>
                    </View>
                    <View style={styles.separator}></View>
                </View>
            </TouchableOpacity>)
    }
}

const styles = StyleSheet.create({
    thumb: {
        width: 64,
        height: 64,
    },
    separator: {
        height: 1,
        backgroundColor: '#E8E8E8',
    },
    companyTag: {
        color: '#999',
        fontSize: 12,
        marginLeft: 5,
        marginRight: 5,
        height: 20,
        paddingTop: 3,
        paddingLeft: 5,
        paddingRight: 5,
        borderWidth: 0.5,
        borderRadius: 10,
        borderColor: '#E8E8E8'
    },
})