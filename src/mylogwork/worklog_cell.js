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

export default class WorklogCell extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount(){
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
        let item = this.props.item;
        return (
            <View style={{marginTop: 5,padding: 15,backgroundColor:'#fff'}}>
                <TouchableOpacity
                    style={{flex:1,alignItems: 'flex-end'}}
                    onPress={this.props.onSelect}
                >
                    <Text style={{color:'#ed1a17',fontSize:13,marginLeft: 30}}>删除</Text>
                </TouchableOpacity>
                <View style={{flexDirection:'row'}}>
                    <Text style={{color:'#666',fontWeight: 'bold',fontSize:13}}>{item.key}</Text>
                    <Text style={{color:'#666',fontWeight: 'bold',fontSize:13,marginLeft: 30}}>{item.summary}</Text>

                </View>
                <View style={{marginTop:10,flexDirection:'row'}}>
                    <Text style={{color:'#666',fontWeight: 'bold',fontSize:13}}>logwork time:</Text>
                    <Text style={{color:'#000',fontSize:13,marginLeft: 30}}>{this.formatTime(item.started)}</Text>
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