import React, { useEffect, Suspense, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getConfig, appInitialRequest } from '@service/global';
import { loadLocales } from '@util/Utils';
import Login from "./pages/Login";
import Register from "./pages/Register";
import App from './App';
import './style/App.less';

const Index = () => {
  const [languageRes, setLanguageRes] = useState();
  const [configComplete, setConfigComplete] = useState(false);

  useEffect(() => {
    // 设置前端的全局配置
    setWebConfig();
  }, []);

  const handleChange = language => {
    appInitialRequest(language, localLanguageRes => {
      loadLocales(localLanguageRes || {}, {});
      setLanguageRes(localLanguageRes);
    });
  }

  const setWebConfig = () => {
    // 获取前端配置及用户信息
    getConfig((serviceRes, configRes) => {
      window.service = serviceRes?.data;
      window.__Conf__ = configRes?.data;
      setConfigComplete(true);
    });
  }

  return(
    <BrowserRouter>
      {
        configComplete && window.service && window.__Conf__ && 
        <Suspense fallback={<div>loading...</div>}>
          <Routes>
            <Route path='/index' element={<App />} />
            <Route path='/login' element={<Login changeLanguage={handleChange} />} />
            <Route path='/register' element={<Register changeLanguage={handleChange} />} />
            <Route path='/' element={<Navigate to='/login' />} />
          </Routes>
        </Suspense>
      }
    </BrowserRouter>
  )
}

const root = ReactDOM.createRoot(document.getElementById('web-main-root'));

root.render(<Index />);