import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import intl from "react-intl-universal";
import Button from '@component/Button';
import Select from '@component/Select';
import Input from '@component/Input';
import { loginRequest } from '@service/global';
import './index.less';

const { Option } = Select;

export default props => {
  const [language, setLanguage] = useState('zh_CN'); // 国际化默认中文 
  const [username, setUsername] = useState(''); // 用户名
  const [password, setPassword] = useState(''); // 密码
  const [errMsg, setErrMsg] = useState(); // 错误提示
  const { state } = useLocation();

  useEffect(() => {
    props.changeLanguage(language);
  }, [language])

  // 注册完成后自动补全用户名、密码、国际化
  useEffect(() => {
    if (state) {
      const { username, password, language } = state;
      setUsername(username || '');
      setPassword(password);
      setLanguage(language);
    }
  }, [state]);

  // 修改国际化
  const handleSelect = e => {
    const language = e.target.getAttribute('value');
    setLanguage(language);
  }

  // 输入用户名
  const handleChangeName = e => {
    setUsername(e.target.value);
  }

  // 输入密码
  const handleChangePaw = e => {
    setPassword(e.target.value);
  }

  // 处理登录
  const handleLogin = event => {
    event.preventDefault();
    if (!username || !password) return setErrMsg('用户名与密码不能为空');
    loginRequest({
      username,
      password,
      language
    }, res => {
      console.log(res);
      setErrMsg(res?.msg);
    });
  }

  return (
    <div className='login-root-container'>
      <div className='login-left'></div>
      <div className='login-right'>
        <form className='login-form'>
          <div className='login-title'>{intl.get('Sign_In').defaultMessage('登录')}</div><br />
          <Input 
            className='login-user' 
            type='text' 
            icon='icon-geren'
            value={username}
            onChange={handleChangeName}
            placeholder={intl.get('Username').defaultMessage('用户名')} 
          />
          <Input 
            className='login-pwd' 
            type='password' 
            icon='icon-mima' 
            value={password}
            onChange={handleChangePaw}
            placeholder={intl.get('Password').defaultMessage('密码')} 
          />
          <Select className='login-language' value={language} onSelect={handleSelect}>
            <Option value='zh_CN'>{intl.get('Chinese').defaultMessage('中文')}</Option>
            <Option value='en_US'>{intl.get('English').defaultMessage('英文')}</Option>
          </Select>
          <Button className='login-button' onClick={handleLogin}>{intl.get('Sign_In').defaultMessage('登录')}</Button>
          <div className='register-container'>
            {errMsg && <span className='login-err'>{errMsg}</span>}
            <NavLink className="register-user" to="/register">{intl.get('Register_User').defaultMessage('注册用户')}</NavLink>
          </div>
        </form>
      </div>
    </div>
  )
}
