import React from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Platform
} from 'react-native';
import { TabNavigator } from 'react-navigation';

//引入视图组件
import HomeTab  from './src/views/HomePage'
import MyFavourite from './src/views/MyFavourite'

//配置tab导航栏
const App = TabNavigator(
    {
        HomeTab: {
            screen: HomeTab,
            path: '/home',
            navigationOptions: Platform.OS === 'ios'?{
                style: {
                    backgroundColor: '#fff', // TabBar 背景色
                    height:80,
                },
                labelStyle: {
                    fontSize: 10, // 文字大小
                    marginTop:2
                },
                iconStyle:{
                    height:60,
                    width:60
                },
                tabBarLabel: 'BUG',
                tabBarIcon: ({ tintColor, focused }) => (
                    <Image
                        source={require('./src/image/bug.png')}
                        style={[{tintColor: tintColor},styles.icon]}
                    />
                ),
            }
            :
            {
                tabBarLabel: 'BUG',
                tabBarIcon: ({ tintColor, focused }) => (
                    <Image
                        source={require('./src/image/bug.png')}
                        style={[{tintColor: tintColor},styles.icon]}
                    />
                ),
            }
        },
        AuctionTab: {
            screen: MyFavourite,
            path: '/myFavourite',
            navigationOptions: Platform.OS === 'ios'?{
                style: {
                    backgroundColor: '#fff', // TabBar 背景色
                    height:80,
                },
                labelStyle: {
                    fontSize: 10, // 文字大小
                    marginTop:2
                },
                iconStyle:{
                    height:60,
                    width:60
                },
                tabBarLabel: '过滤器',
                tabBarIcon: ({ tintColor, focused }) => (
                    <Image
                        source={require('./src/image/task.png')}
                        style={[{tintColor: tintColor},styles.icon]}
                    />
                ),
            }
            :{
                tabBarLabel: '过滤器',
                tabBarIcon: ({ tintColor, focused }) => (
                    <Image
                        source={require('./src/image/task.png')}
                        style={[{tintColor: tintColor},styles.icon]}
                    />
                ),
            }
        },
    },{
        initialRouteName: 'HomeTab',
        animationEnabled: false,
        swipeEnabled: false,
        tabBarPosition: 'bottom', // 显示在底端，android 默认是显示在页面顶端的
        tabBarOptions: Platform.OS === 'android'?{
            activeTintColor: '#008AC9', // 文字和图片选中颜色
            inactiveTintColor: '#999', // 文字和图片默认颜色
            showIcon: true, // android 默认不显示 icon, 需要设置为 true 才会显示
            indicatorStyle: {height: 0}, // android 中TabBar下面会显示一条线，高度设为 0 后就不显示线了
            style: {
                backgroundColor: '#fff', // TabBar 背景色
                height:60,
            },
            labelStyle: {
                fontSize: 10, // 文字大小
                marginTop:2
            },
            iconStyle:{
                height:35,
                width:35
            }
        }:{
                activeTintColor: '#008AC9', // 文字和图片选中颜色
                inactiveTintColor: '#999', // 文字和图片默认颜色
                showIcon: true, // android 默认不显示 icon, 需要设置为 true 才会显示
            }
        ,

    }
)
const styles = StyleSheet.create({
    icon: {
        height: 22,
        width: 22,
        resizeMode: 'contain'
    }
});
export default App;