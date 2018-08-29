## 功能描述

基于React Native开发的简易版Jira Bug管理APP。
本人是测试，故而应用主要服务于测试过程中的，Bug新建，状态管理，回归备注，附件查看等测试流程。
一改了之前常规管理应用的列表到详情式设计，新版本采用更为直观的瀑布流式设计，使我们像刷朋友圈似的刷Bug单。结合PC上的收藏过滤器使用，可以让我们更准确的获取需要的信息列表。

## 功能演示

## 开发环境：

+ 本应用基于[react-native  0.55.4](http://facebook.github.io/react-native)开发
+ 用[react-native-dva-starter](https://github.com/nihgwu/react-native-dva-starter)脚手架创建
+ 采用了[dva-core 1.3.0](https://github.com/dvajs/dva/tree/dva-core%401.3.0)作为数据流管理框架
+ 部分控件来自[antd-mobile-rn 2.2.1](https://rn.mobile.ant.design/index-cn)组件库
+ 使用[react-navigation 2.5.1](https://reactnavigation.org/)导航框架
+ 兼容了IOS及Android大部分主流机型

## 项目结构简介
``` js
├── __tests__                   // jest测试脚本
├── android                     // 安卓原生文件
├── app                         
│   ├── components              // 通用组件
│   ├── containers              // 应用文件
│   ├── images                  // 静态资源文件
│   ├── models                  // 封装了redux的models
│   ├── services                // 请求api
│   ├── utils                   
│     ├── dva.js                // dva核心
│     ├── request.js            // 封装的fetch请求
│     ├── storage.js            // 本地存储封装
│     └── index.js              // 工具封装集合
│   ├── router.js               // 生产环境
│   └── index.js                // 测试环境
├── ios                         // 苹果原生文件
├── index.js                    // 入口文件
├── app.json                    // 应用名配置
├── .eslintrc                   // eslint语法限制配置
├── .flowconfig                 // flow语法配置
├── .gitignore                  // git上传配置
├── .babelrc                    // babel按需加载配置
├── README.md                   // 我
└── package.json                // npm应用包清单

```

## 历史版本
+ 2018-8    v3.0.0    
使用dva架构重构，移除了部分功能，优化了界面样式及稳定性

+ 2017-11    v2.0.0   
集成了任务管理及工作日志等功能

+ 2017-8    v1.0.0    
初始版本

## 联系方式

562746248@qq.com

