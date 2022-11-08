import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import intl from "react-intl-universal";
import Button from '@component/Button';
import Select from '@component/Select';
import Input from '@component/Input';
import { registerRequest, uniqueName } from '@service/global';
import RestrictConst from '@util/RestrictConst';
import { PAW_STRENGTH_WEAK, PAW_STRENGTH_MEDIUM, PAW_STRENGTH_HIGH } from '@util/ConstUtil';
import './index.less';

const { Option } = Select;

export default props => {
  const [language, setLanguage] = useState('zh_CN'); // 国际化默认中文
  const [username, setUsername] = useState(); // 用户名
  const [password, setPassword] = useState(); // 密码
  const [rePassword, setRePassword] = useState();
  const [nameErr, setNameErr] = useState();
  const [passwordErr, setPasswordErr] = useState();
  const [rePasswordErr, setRePasswordErr] = useState();
  const [isRegister, setIsRegister] = useState(true);
  const [pawStrength, setPawStrength] = useState(0); // 设置密码强度
  const [pawStreList] = useState([ PAW_STRENGTH_WEAK, PAW_STRENGTH_MEDIUM, PAW_STRENGTH_HIGH ]);

  const navigate = useNavigate();

  useEffect(() => {
    props.changeLanguage(language);
  }, [language])

  useEffect(() => {
    setIsRegister(!username || !password || !rePassword || nameErr || passwordErr || rePasswordErr);
  }, [nameErr, passwordErr, rePasswordErr]);

  const handleSelect = e => {
    const language = e.target.getAttribute('value');
    setLanguage(language);
  }

  const handleSubmit = event => {
    event.preventDefault();
    registerRequest({ username, password, language } ,res => {
      const { username, password, language } = res;
      navigate('/login',{
        replace:false,
        state:{
          username,
          password,
          language
        }
      })
    });
  }

  const checkNameErr = async username => {
    let msg = '';
    if (!username) {
      msg = intl.get('Username_Null_Tip').defaultMessage('用户名不能为空');
    } else if (!RestrictConst.USERNAME.test(username)) {
      msg = intl.get('Username_Null_Error').defaultMessage('以字母开头，包含字母、数字、下划线');
    } else {
      const result = await uniqueName({ username });
      msg= result ? intl.get('Username_Exist').defaultMessage('该用户名已存在') : '';
    }
    setNameErr(msg);
  }

  const checkRePaw = rePassword => {
    let msg = '';
    if (!rePassword) {
      msg = intl.get('Password_Null_Tip').defaultMessage('密码不能为空');
    } else if(rePassword !== password) {
      msg = intl.get('Password_Err_Tip').defaultMessage('两次密码不一致');
    }
    setRePasswordErr(msg);
  }

  const checkPawErr = password => {
    let msg = '';
    if (!password) {
      msg = intl.get('Password_Null_Tip').defaultMessage('密码不能为空');
    } else if (!RestrictConst.PASSWORD.test(password)) {
      msg = msg = intl.get('Password_Strength_Tip').defaultMessage('密码长度至少8位, 且强度不能过低');
    }
    setPasswordErr(msg);
  }

  const changePaw = value => {
    let pawStre = 0;

    RestrictConst.NUM.test(value) && pawStre ++;
    RestrictConst.CHAR.test(value) && pawStre ++;
    RestrictConst.SYMBOL.test(value) && pawStre ++;

    setPassword(value);
    checkPawErr(value);
    setPawStrength(pawStre);
  }

  const handleChange = key => e => {
    const { value } = e.target;
    switch (key) {
      case 'username':
        setUsername(value);
        checkNameErr(value);
        break;

      case 'password':
        changePaw(value);
        break;
      
      case 'repeatPassword':
        setRePassword(value);
        checkRePaw(value);
        break;

      default:
        break;
    }
  }

  return (
    <div className='register-root-container'>
      <div className='register-left'></div>
      <div className='register-right'>
        <form className='register-form'>
          <div className='register-title'>{intl.get('Register').defaultMessage('注册')}</div><br />
          <Input 
            className='register-user' 
            type='text' 
            icon='icon-geren' 
            placeholder={intl.get('Username').defaultMessage('用户名')} 
            errMsg={nameErr}
            onChange={handleChange('username')} 
          />
          <Input 
            className='register-pwd' 
            type='password' 
            icon='icon-mima' 
            placeholder={intl.get('Password').defaultMessage('密码')} 
            errMsg={passwordErr}
            onChange={handleChange('password')} 
          />
          {
            password && 
              <ul className={`paw-stre-container ${passwordErr && 'paw-stre-container-err'}`}>
                {
                  pawStreList.map(item => <li key={item} className={pawStrength >= item ? 'paw-stre-full' : ''} />)
                }
              </ul>
          }
          <Input
            className='register-pwd' 
            type='password' 
            icon='icon-mima' 
            placeholder={intl.get('Repeat_Password').defaultMessage('重复密码')}
            errMsg={rePasswordErr}
            onChange={handleChange('repeatPassword')} 
          />
          <Select className='register-language' value={language} onSelect={handleSelect}>
            <Option value='zh_CN'>{intl.get('Chinese').defaultMessage('中文')}</Option>
            <Option value='en_US'>{intl.get('English').defaultMessage('英文')}</Option>
          </Select>
          <Button className='register-button' disabled={isRegister} onClick={handleSubmit}>{intl.get('Register').defaultMessage('注册')}</Button>
        </form>
      </div>
    </div>
  )
}
