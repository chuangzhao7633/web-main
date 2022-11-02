import React from 'react';
import './index.less';

export default props => {
  const { type, className, ...others } = props;
  return <span className={`iconfont ${type || ''} ${className || ''}`} {...others} />
}
