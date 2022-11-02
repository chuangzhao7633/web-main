import React from 'react';

export default props => {
  const { className, ...others } = props;

  return <li className={`web-main-option ${className || ''}`} test='test' {...others} />
}
