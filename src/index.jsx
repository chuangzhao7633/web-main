import React, { useEffect, Suspense, useState, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { message, Spin } from 'antd';
import { THEME_TYPE_LIGHT, THEME_TYPE_DARK } from '@util/ConstUtil';
import { loadLocales, resetStyle } from '@util/Utils';
import { getConfig, appInitialRequest, getInitSetting } from '@service/global';
import Login from "./pages/Login";
import Register from "./pages/Register";
/* import App from './App'; */
import './style/App.less';

const App = lazy(() => import('./App'));

const Index = () => {
  const [languageRes, setLanguageRes] = useState();
  const [theme, setTheme] = useState(THEME_TYPE_LIGHT);
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

  // 设置页签的图标及title
  const setDocument = docRes => {
    if (docRes.otherConfigJson){
      document.title = JSON.parse(docRes.otherConfigJson).browserTitleName || '';
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

  const setWebConfig = () => {
    // 获取前端配置及用户信息
    getConfig((serviceRes, configRes) => {
      window.service = serviceRes?.data;
      window.__Conf__ = configRes?.data;
      // 获取初始化时需要的信息：用户信息，当前样式主题，页签相关信息
      /* getInitSetting((themeRes, docRes) => {
        const themeType = resetStyle(themeRes.data);
        setDocument(docRes.data);
        setTheme(themeType);
        setConfigComplete(true);
      }); */
      setConfigComplete(true);
    });
  }

  const handleChange = language => {
    appInitialRequest(language, localLanguageRes => {
      loadLocales(localLanguageRes || {}, {});
      setLanguageRes(localLanguageRes);
    });
  }

  return(
    <BrowserRouter>
      <Suspense fallback={
        <div className="init-spin-loading">
          <Spin spinning={!configComplete} />
        </div>
      }>
        {
          configComplete && window.service && window.__Conf__ && 
            <Routes>
              <Route path='/index' element={<App />} />
              <Route path='/login' element={<Login changeLanguage={handleChange} />} />
              <Route path='/register' element={<Register changeLanguage={handleChange} />} />
              <Route path='/' element={<Navigate to='/login' />} />
            </Routes>
        }
      </Suspense>
    </BrowserRouter>
  )
}

const root = ReactDOM.createRoot(document.getElementById('web-main-root'));

root.render(<Index />);