import React, { useState, useEffect } from 'react';
import Option from '@component/Select/Option';
import Input from '@component/Input';
import './index.less';

const Select = props => {
  const { className, value, children, onSelect, ...others } = props;
  const [isOpen, setIsOpen] = useState(false); // 下拉框是否展开
  const [showValue, setShowValue] = useState(''); // 下拉框选中展示的值
  const [realValue, setRealValue] = useState(value); // 下拉框选中实际的值

  useEffect(() => {
    const showValue = children.filter(item => item.props.value === realValue)[0]?.props?.children;
    setShowValue(showValue || realValue);
  }, [realValue]);

  useEffect(() => {
    setRealValue(value);
  }, [value])
  
  const handleClick = () => setIsOpen(!isOpen);

  // 获取选中的 option 的值 
  const handleSelect = e => {
    onSelect ? onSelect(e) : setRealValue(e.target.getAttribute('value'));
    setIsOpen(false);
  }

  return (
    <div className={`web-main-select-container ${className || ''}`}>
      <div className='web-main-select' onClick={handleClick}>
        <Input type="select" placeholder={showValue} readOnly icon="icon-zhuanhuan" isOpen={isOpen} {...others} />
      </div>
      { isOpen && <ul className='web-main-options' onClick={handleSelect}>{ children }</ul> }
    </div>
  )
}

Select.Option = Option;

export default Select;