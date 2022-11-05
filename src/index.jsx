import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { getConfig } from '@service/global';
import App from './App';
import './style/App.less';

const Index = () => {
  useEffect(() => {
    // 设置前端的全局配置
    setWebConfig();
  }, []);

  const setWebConfig = () => {
    // 获取前端配置及用户信息
    getConfig((serviceRes, configRes) => {
      window.service = serviceRes?.data?.data;
      window.__Conf__ = configRes?.data?.data;
    });
  }

  return(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

const root = ReactDOM.createRoot(document.getElementById('web-main-root'));

root.render(<Index />);