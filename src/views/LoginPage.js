import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    ToastAndroid,
    AsyncStorage,
    Keyboard
} from 'react-native';
import APP from '../../app'
import BaseLoginPage from '../login/BaseLoginPage'
import { StackNavigator } from 'react-navigation';
import CardStackStyleInterpolator from 'react-navigation/lib/views/CardStack/CardStackStyleInterpolator';

const LoginPage = StackNavigator({
    _LoginPage: {screen: BaseLoginPage,
    },
    HomePage:{screen: APP,
    },

},{
    initialRouteName: '_LoginPage',
    mode: 'card ',
    headerMode: 'none',
    //解决安卓push无效果
    transitionConfig:()=>({
        screenInterpolator:CardStackStyleInterpolator.forHorizontal,
    })
});

export default LoginPage;