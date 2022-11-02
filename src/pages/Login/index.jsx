import React, { useState } from 'react';
import Button from '@component/Button';
import Select from '@component/Select';
import Input from '@component/Input';
import './index.less';

const { Option } = Select;

export default () => {
  const [language, setLanguage] = useState('zh_CN'); // 国际化默认中文

  const handleSelect = e => {
    const language = e.target.getAttribute('value');
    setLanguage(language);
  }

  return (
    <div className='login-root-container'>
      <div className='login-left'></div>
      <div className='login-right'>
        <div className='login-form'>
          <div className='login-title'>资源服务平台</div><br />
          <Input className='login-user' type='text' icon='icon-geren' placeholder='用户名' />
          <Input className='login-pwd' type='password' icon='icon-mima' placeholder='密码' />
          <Select className='login-language' value={language} onSelect={handleSelect}>
            <Option value='zh_CN'>中文</Option>
            <Option value='en_US'>英文</Option>
          </Select>
          <Button className='login-button'>登录</Button>
        </div>
      </div>
    </div>
  )
}
