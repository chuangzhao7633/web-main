import React, { useState, useEffect } from 'react';
import { getInitSetting } from '@service/global';

export default function App() {
  const [currentUser, setCurrentUser] = useState();

  useEffect(() => {
    // 设置前端初始化配置
    setInitConfig();
  }, []);

  const setInitConfig = () => {
    // 获取初始化时需要的信息：用户信息，当前样式主题，页签相关信息
    getInitSetting(userRes => {
      setCurrentUser(userRes);
    });
  }

  return (
    <>
      <div>APP...</div>
    </>
  )
}
