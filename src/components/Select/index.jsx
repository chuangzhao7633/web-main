import React, { useState } from 'react';
import Option from '@component/Select/Option';
import Input from '@component/Input';
import './index.less';

const Select = props => {
  const [isOpen, setIsOpen] = useState(false);

  const { className, value, children } = props;
  
  const handleClick = () => setIsOpen(!isOpen);

  return (
    <div className={`web-main-select-container ${className || ''}`}>
      <div className='web-main-select' onClick={handleClick}>
        <Input type="text" value={value} readOnly icon="icon-zhuanhuan" />
      </div>
      { isOpen && <ul className='web-main-options'>{ children.map(item => <Option {...item.props} />) }</ul> }
    </div>
  )
}

Select.Option = Option;

export default Select;