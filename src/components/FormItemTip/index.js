import React from 'react';
import Icon from '../Icon';
import './index.less';

const FormItemTip = (props) => {
  return (
    <div className={`web-main-form-tip ${props.className || ''}`}>
      <Icon type={props.type || "icon-info-circle"} />
      {props.title}
    </div>
  );
};

export default FormItemTip;