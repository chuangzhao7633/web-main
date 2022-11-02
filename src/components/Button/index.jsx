import React from 'react';
import './index.less';

export default props => {
  const { className, ...others } = props;
  return (
    <button className={`web-main-button ${props.className}`} {...others} />
  )
}