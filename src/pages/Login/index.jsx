import React, { useState, useEffect } from 'react';
import intl from "react-intl-universal";
import Button from '@component/Button';
import Select from '@component/Select';
import Input from '@component/Input';
import './index.less';

const { Option } = Select;

export default props => {
  const [language, setLanguage] = useState('zh_CN'); // 国际化默认中文

  useEffect(() => {
    props.changeLanguage(language);
  }, [language])

  const handleSelect = e => {
    const language = e.target.getAttribute('value');
    setLanguage(language);
  }

  return (
    <div className='login-root-container'>
      <div className='login-left'></div>
      <div className='login-right'>
        <div className='login-form'>
          <div className='login-title'>{intl.get('Sign_In').defaultMessage('登录')}</div><br />
          <Input className='login-user' type='text' icon='icon-geren' placeholder={intl.get('Username').defaultMessage('用户名')} />
          <Input className='login-pwd' type='password' icon='icon-mima' placeholder={intl.get('Password').defaultMessage('密码')} />
          <Select className='login-language' value={language} onSelect={handleSelect}>
            <Option value='zh_CN'>{intl.get('Chinese').defaultMessage('中文')}</Option>
            <Option value='en_US'>{intl.get('English').defaultMessage('英文')}</Option>
          </Select>
          <Button className='login-button'>{intl.get('Sign_In').defaultMessage('登录')}</Button>
        </div>
      </div>
    </div>
  )
}
