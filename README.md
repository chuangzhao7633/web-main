## **微前端- 开发事项**

### 主项目设计
#### 1. 目的
主项目将不同的子项目融合成一个产品，应对不同的行业解决方案。

#### 2. 设计方案
###### 主项目功能：
菜单管理、国际化语言分发、用户统一分发、主题样式分发、按钮权限分发
###### 子项目功能：
  1. 国际化：子项目中的国际化在自己的配置项中，当前显示的语言由主项目分发
  2. 主题样式：子项目中的主题样式由主项目分发
  3. 按钮权限：子项目根据主项目分发的code获取当前项目的权限code
  4. 用户信息：子项目的用户信息由主项目下发
  5. 路由跳转：子项目路由跳转交由主项目控制跳转

#### 3. 主项目配置项目录结构：


```
--static // 配置项/静态资源
  --child // 子项目在主项目中的配置项
    --bdos // bdos子项目配置项
      --auth // 导航权限对应关系配置项
      --img // 子项目在主项目中需要显示的logo等图片资源
      --language // 子项目在主项目中的国际化配置文件
      --menu // 子项目的二级导航配置文件
    --tag // 同bdos
      ...
  --common // 公用资源
  --main // 主项目的配置项
    config.json // 主项目的app配置项
    service.json // 主项目与后端交互的服务配置项
    ...
```

### 主项目开发

#### 1. 样式：
  使用css变量形式（实现在线换肤）, 在template/index.html 中 加入：

```
<link rel="stylesheet" type="text/css" href="/static/common/style/css_default.css" />
```

#### 2. 导航/按钮权限：
   使用key-value格式，主项目中有实现导航的权限路由控制（static/child/{productName}/auth/auth.json）例如：
  
  
```
  // 获取按钮权限key-value数据
  getButtonAuthKey() {
    xhr({
      type: 'get',
      url: `${window.origin}/static/child/${productName}/auth/auth.json`,
      success:(res) => {
        window.__buttonAuthKeys__ = res;
      }
    });
  }
  <AuthButton renderType="a" data-code="DataSource_Manage_Edit" onClick={this.addOrEditHandler}> 编辑 </AuthButton>
```

  
#### 3. 国际化：
  使用读取配置文件的方式：
  
```
  // 获取按钮权限key-value数据
    getLanguage() {
      xhr({
        type: 'get',
        url: `${window.origin}/static/${productName}/language/language_${this.state.language}.json`,
        success:(res) => {
            /*加载到国际化内容中 可参考主项目*/
            ...
        }
      });
    }
```

#### 4. 二级导航 (左侧目录)

在主项目中进行控制,命名规则：static/产品/menu/一级导航中的key_menu.json
    
```
{
      "key": "DV_Access_View", // 国际化key
      "router": "/bdos/DataView/datafullview/fullview", // 路由
      "icon": "pie-chart", // 图标
      "parentKey": "DV_MasterData", // 父节点的key, 用于渲染面包屑
      "cn": "资产视图", // 国际化defaultMessage
      "code": "DV_AccessView_Nav" // 权限key
    }
```

### 子项目开发

#### 1. 子项目路由跳转问题
子项目路由跳转需要转到主项目中进行跳转，否则会有浏览器地址不正确问题导致跳转失败

在子项目的入口文件：index.jsx中添加：

```
// 子项目全局跳转方法。 url: 跳转路由地址， state: 路由参数
window.__qinkun_fun_routerChange = (url, state) => {
  if (window.__qiankun_props__ && window.__qiankun_props__.routerChange) {
    // 主路由暴露出来的路由跳转方法
    window.__qiankun_props__.routerChange(url, state)
  } else {
    // 子项目中单独部署时使用的跳转方式
    this.props.router.push({
      pathname: url,
      state
    });
  }
}

// 子项目接收路由参数方式：
const _query = this.props.location.state || window.history.state;

```


#### 2. 子项目与主项目对接需要暴露的接口：
在 src 目录新增文件 public-path.js：
    
```
if (window.__POWERED_BY_QIANKUN__) {
      __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
    }
```

修改 index.html 中项目初始化的容器，不要使用 #app ，避免与其他的项目冲突，建议换成项目 name 的驼峰写法
修改入口文件 index.js：
    
```
    import './public-path'; // 必须在最顶部导入 否则会有资源404的问题
    
    function renderApp(props) {
      ReactDOM.render(<Intl><Router/></Intl>, props && props.container ? props.container.querySelector('#bdos-root') : document.querySelector('#bdos-root'));
    }
    
    function storeTest(props) {
      props.onGlobalStateChange((value, prev) => {
        if(!window.__qiankun_props__ || window.__qiankun_props__ !== value) {
          window.__qiankun_props__ = value;
        }
      }, true);
      // props.setGlobalState({
      //  ignore: props.name,
      //  user: {
      //    name: props.name,
      //  },
      // });
    }
    
    
    export async function bootstrap() {
      console.log('[react15] react app bootstraped');
    }
    
    export async function mount(props) {
      if (props) {
        storeTest(props);
      } 
      renderApp(props);
    }
    
    export async function unmount(props) {
      const { container } = props;
      ReactDOM.unmountComponentAtNode(
        container ? container.querySelector('#bdos-root') : document.getElementById('bdos-root'),
      );
    }
    
    if (!window.__POWERED_BY_QIANKUN__) {
      bootstrap().then(mount);
    }
```

   
主要改动是引入修改 publicPath 的文件和 export 三个生命周期。
注意：

webpack 的 publicPath 值只能在入口文件修改，之所以单独写到一个文件并在入口文件最开始引入，是因为这样做可以让下面所有的代码都能使用这个。
    
    
```
修改打包配置 webpack.base.config.js:
    const { name } = require('./package');
    
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd',// 把子应用打包成 umd 库格式
      jsonpFunction: `webpackJsonp_${name}`,
    },
```

    
注： 这个 name 默认从 package.json 获取，可以自定义，只要和父项目注册时的 name 保持一致即可。
这个配置主要就两个，一个是允许跨域，另一个是打包成 umd 格式。为什么要打包成 umd 格式呢？是为了让 qiankun 拿到其 export 的生命周期函数。
root 在浏览器环境就是 window , qiankun 拿这三个生命周期，是根据注册应用时，你给的 name 值，name 不一致则会导致拿不到生命周期函数



## 子项目开发的一些注意事项

##### 1. 所有的资源（图片/音视频等）都应该放到 src 目录，不要放在 public 或 者static
资源放 src 目录，会经过 webpack 处理，能统一注入 publicPath。否则在主项目中会404。(有特殊处理的除外)
参考：vue-cli3的官方文档介绍：何时使用-public-文件夹
暴露给运维人员的配置文件 config.js，可以放在 public 目录，因为在 index.html 中 url 为相对链接的 js/css 资源，qiankun 会给其注入前缀。

##### 2. 请给 axios 实例添加拦截器，而不是 axios 对象
后续会考虑子项目共享公共插件，这时就需要避免公共插件的污染

```
// 正确做法：给 axios 实例添加拦截器
const instance = axios.create();
instance.interceptors.request.use(function () {/*...*/});
// 错误用法：直接给 axios 对象添加拦截器
axios.interceptors.request.use(function () {/*...*/});
```

##### 3. 避免 css 污染
组件内样式的 css-scoped 是必须的。
对于一些插入到 body 的弹窗，无法使用 scoped，请不要直接使用原 class 修改样式，请添加自己的 class，来修改样式。

```
.el-dialog{
  /* 不推荐使用组件原有的class */
}
.productName-el-dialog{
  /* 推荐使用自定义组件的class */
}
```

##### 4. 谨慎使用 position：fixed
在父项目中，这个定位未必准确，应尽量避免使用，确有相对于浏览器窗口定位需求，可以用 position: sticky，但是会有兼容性问题（IE不支持）。如果定位使用的是 bottom 和 right，则问题不大。
还有个办法，位置可以写成动态绑定 style 的形式:

```
<div style={{ top: isQiankun ? '10px' : '0'}}>
```


##### 5. 给 body 、 document 等绑定的事件，请在 unmount 周期清除
js 沙箱只劫持了 window.addEventListener，使用 document.body.addEventListener 或者 document.body.onClick 添加的事件并不会被沙箱移除，会对其他的页面产生影响，请在 unmount 周期清除
