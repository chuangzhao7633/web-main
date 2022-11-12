import React from 'react';
import { createFromIconfontCN } from '@ant-design/icons';

const IFont = createFromIconfontCN({
  scriptUrl: "/static/common/font/antdIconFont.js"
});

function IconFont(props) {
  const { type, className, other } = props;
  return <IFont className={className} type={type} {...other} />;
}

export default IconFont;