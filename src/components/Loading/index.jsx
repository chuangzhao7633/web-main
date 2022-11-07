/***************************************************
 * 说明: Loading 加载效果
 * 使用方式:
 * import loading from './loading'
 * loading.show(true)   //显示loading效果
 * loading.show(false)  //隐藏loading效果
 *
 ***************************************************/
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Spin } from 'antd';

import './index.less'

class Loading extends React.Component {
  render() {
    const { show } = this.props;
    return (
        show ? (
          <div className="main-loading full-loading">
            <Spin />
          </div>
        ) : null
    )
  }
}

const container = document.getElementById('web-main-loading');

/**
 * 把Loading 效果 添加的 body 上, 显示 loading
 * 这样只需要使用 函数的形式就可以调用 loading 效果
 * @param show
 */
function showLoading(show) {
  ReactDOM.createRoot(container).render(<Loading show={show} />);
}
 
export default {
  show: showLoading
}