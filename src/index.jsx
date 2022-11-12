import React, { useEffect, Suspense, useState, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import intl from "react-intl-universal";
import reactCookie  from 'react-cookies';
import { Spin, notification, message } from 'antd';
import { resetStyle } from '@util/Utils';
import { THEME_TYPE_LIGHT } from '@util/ConstUtil';
import { getConfig, getInitSetting } from '@service/global';
import Icon from '@component/Icon';
import './style/App.less';

const App = lazy(() => import('./App'));

const Index = () => {
  const [theme, setTheme] = useState(THEME_TYPE_LIGHT);
  const [currentUser, setCurrentUser] = useState();
  const [configComplete, setConfigComplete] = useState(false);

  useEffect(() => {
    // 设置antd组件的全局配置
    setAntGlobalConfig()
    // 设置前端的全局配置
    setWebConfig();
  }, []);

  const setAntGlobalConfig = () => {
    message.config({
      top: 30,
      duration: 2,
      maxCount: 3,
      getContainer: () => document.getElementById('web-main')
    });
  };

  const setWebConfig = () => {
    // 获取前端配置及用户信息
    getConfig((serviceRes, configRes) => {
      window.service = serviceRes?.data;
      window.__Conf__ = configRes?.data;
      debugger;
      // 获取初始化时需要的信息：用户信息，当前样式主题，页签相关信息
      getInitSetting((userRes, themeRes, docRes ) => {
        const themeType = resetStyle(themeRes.data);
        setDocument(docRes.data);
        if(userRes && userRes.data.warn) {
          setTimeout(() => {
            notification.open({
              message: intl.get('Warning').defaultMessage('警告'),
              description: <span><Icon className="web-main-notice-icon" type="icon-info-circle"/><span className="web-main-notice-desc">{userRes.data.warnInfo}</span></span>,
              duration: 10,
              className: 'web-main-ant-notification'
            });
          });
        }
        reactCookie.save('sessionId', userRes && userRes.data.accessToken);
        setCurrentUser(userRes && userRes.data);
        setConfigComplete(true);
        setTheme(themeType);
      });
    });
  }

  // 设置页签的图标及title
  const setDocument = (docRes) => {
    if(docRes.otherConfigJson){
      document.title = docRes.otherConfigJson.browserTitleName || '';
    }
    let _flink = document.getElementById('faviconLink');
    if(!_flink) return;
    if(docRes.fileUrl){
      _flink.href = window.service.portal + '/' + docRes.fileUrl + '?r=' + new Date().getTime();
      _flink.type = '';
      _flink.type = 'image/x-icon';
    } else {
      _flink.href = '/favicon.ico';
      _flink.type = '';
      _flink.type = 'image/x-icon';
    }
  };

  return(
    <Suspense fallback={
      <div className="init-spin-loading">
        <Spin spinning={!configComplete} />
      </div>
    }>
      {
        configComplete && window.service && window.__Conf__ ?
          <App currentUser={currentUser} theme={theme} resetStyle={resetStyle} /> :
          <div className="init-spin-loading">
            <Spin spinning={!configComplete} />
          </div>
      }
    </Suspense>
  )
}

const root = ReactDOM.createRoot(document.getElementById('web-main'));

root.render(<Index />);