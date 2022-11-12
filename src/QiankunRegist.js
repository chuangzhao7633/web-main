import intl from 'react-intl-universal';
// 进度条插件
import Loading from "@component/Loading";
import { message } from "antd";
import {
  registerMicroApps,
  addGlobalUncaughtErrorHandler,
  runAfterFirstMounted,
  start,
} from "qiankun";

// 子应用注册信息
const getApps = () => {
  debugger;
  window.__Conf__.apps.map(_item => {
    _item.activeRuleStr = _item.activeRule;
    _item.activeRule = genActiveRule(_item.activeRule);
    return _item;
  });
  return window.__Conf__.apps;
};

const genActiveRule = (routerPrefix) => {
  return location => location.pathname.startsWith(routerPrefix);
};
/**
 * 注册子应用
 * 第一个参数 - 子应用的注册信息
 * 第二个参数 - 全局生命周期钩子
 */
registerMicroApps(getApps(), {
  // qiankun 生命周期钩子 - 加载前
  beforeLoad: (app) => {
    // 加载子应用前，加载进度条
    Loading.show(true);
    console.log("before load", app.name);
    return Promise.resolve();
  },
  // qiankun 生命周期钩子 - 挂载后
  afterMount: (app) => {
    // 加载子应用前，进度条加载完成
    Loading.show(false);
    console.log("after mount", app.name);
    return Promise.resolve();
  }
});

runAfterFirstMounted(() => {
  console.log('[MainApp] first app mounted');
});

/**
 * 添加全局的未捕获异常处理器
 */
addGlobalUncaughtErrorHandler((evt) => {
  const { msg } = evt;
  // 加载失败时提示
  if (msg && msg.includes("died in status")) {
    message.error(intl.get('LoadApp_Error').defaultMessage('子应用加载失败，请检查应用是否可运行'));
  }
});

// 导出 qiankun 的启动函数
export default start;