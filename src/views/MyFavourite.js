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
import {StackNavigator,TabNavigator} from 'react-navigation';
import CardStackStyleInterpolator from 'react-navigation/lib/views/CardStack/CardStackStyleInterpolator';
//自定义组件
import FavouriteDetail from './Task';
import MyFavourite from '../myfavourite/BaseMyFavourite'
import WorkLogs from '../mylogwork/worklog'

const _FavouritePage = StackNavigator({
    FavouritePage: {screen: MyFavourite,
    },
    FavouriteDetail:{screen: FavouriteDetail,
    },

},{
    initialRouteName: 'FavouritePage',
    mode: 'card ',
    headerMode: 'none',
    //解决安卓push无效果
    transitionConfig:()=>({
        screenInterpolator:CardStackStyleInterpolator.forHorizontal,
    })
});

const taskPage = TabNavigator({
    我的收藏: {
        screen: _FavouritePage,
    },
    待提交日志: {
        screen: WorkLogs,
    },
},
    {
        animationEnabled: false, // 切换页面时不显示动画
        swipeEnabled: true, // 禁止左右滑动,和tabbar的滑动冲突
        backBehavior: 'none', // 按 back 键是否跳转到第一个 Tab， none 为不跳转
        showLabel:true,
        tabBarPosition: 'top',
        tabBarOptions:Platform.OS === 'android'?{
            style: {
                backgroundColor: '#63B8FF', // TabBar 背景色
            },
            labelStyle: {
                fontSize: 16, // 文字大小
            },
        }:{
                style: {
                    backgroundColor: '#63B8FF', // TabBar 背景色
                    height: 80
                },
                labelStyle: {
                    fontSize: 16, // 文字大小
                    marginBottom:10,
                },
            }
    }
);

export default taskPage;

