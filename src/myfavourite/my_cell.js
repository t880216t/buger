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

export default class MyCell extends Component {
    constructor(props) {
        super(props);
        this.state = {
            createTime:null,
        };
    }

    componentDidMount(){
    }

    render() {
        let FavouriteData = this.props.FavouriteData;
        return (
            <TouchableOpacity
                onPress={this.props.onSelect}
                underlayColor='gray'>
                <View style={{ flex:1,backgroundColor:'#FFF'}}>
                    <View style={{padding:10,marginRight:5,marginLeft:15, flexDirection:'row'}}>
                        <Text style={{fontSize:17,fontWeight:'bold'}}>{FavouriteData.name}</Text>
                    </View>
                </View>
                <View style={styles.separator}></View>
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