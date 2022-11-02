/***************************************************
 * 说明: Loading 加载效果
 * 使用方式:
 * import loading from './loading'
 * loading.show(true)   //显示loading效果
 * loading.show(false)  //隐藏loading效果
 *
 ***************************************************/
import React from 'react';
import { render } from 'react-dom';

import './index.less'

class Loading extends React.Component {
  constructor(prop) {
    super(prop);
    this.state = {}
  }

  render() {
    const { show } = this.state;
    return (
        show ? (
          <div className="main-loading full-loading">
            <span className="ant-spin-dot ant-spin-dot-spin">
              <i className="ant-spin-dot-item"></i>
              <i className="ant-spin-dot-item"></i>
              <i className="ant-spin-dot-item"></i>
              <i className="ant-spin-dot-item"></i>
            </span>
          </div>
        ) : null
    )
  }
}

let instance;

/**
 * 把Loading 效果 添加的 body 上, 显示 loading
 * 这样只需要使用 函数的形式就可以调用 loading 效果
 * @param show
 */
function showLoading(show) {
  if (!instance) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    // container.style.height = `${window.innerHeight}px`;
    instance = render(<Loading/>, container);
  }
  instance.setState({
    show: show
  })
}

export default {
  show: showLoading
}