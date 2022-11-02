import React, {useState, useEffect} from 'react';
import Icon from '@component/Icon';
import './index.less';

export default props => {
  const { className, icon, type, ...others } = props;
  const [isPaw, setIsPaw] = useState(type === 'password');
  const [inputType, setInputType] = useState(type);

  useEffect(() => {
    setInputType(isPaw ? 'password' : 'text');
  }, [isPaw]);

  const changePawView = () => setIsPaw(!isPaw);

  return (
    <div className={`web-main-input-container ${className || ''}`}>
      <Icon className='input-icon' type={icon || ''} />
      <input className={icon ? 'web-main-input-icon' : 'web-main-input'} {...others} type={inputType} />
      {type === 'password' && <Icon className='input-icon-paw' type={isPaw ? 'icon-dakaiyanjing' : 'icon-guanbiyanjing'} onClick={changePawView} />}
    </div>
  )
}
