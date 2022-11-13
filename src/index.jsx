import React, { Component, Suspense } from 'react';
import ReactDOM from 'react-dom';
import intl from 'react-intl-universal';
import reactCookie  from 'react-cookies';
import { Spin, notification, message } from 'antd';
import { resetStyle } from '@util/Utils';
import { THEME_TYPE_LIGHT, THEME_TYPE_DARK } from '@util/ConstUtil';
import { ThemeContext } from '@util/ThemeContext';
import { getConfig, getInitSetting } from '@service/global';
import Icon from './components/Icon';
import './util/Flexible';
import './util/InitObjectFunc';
import './style/App.less';

const App = React.lazy(() => import('./App'));
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: THEME_TYPE_LIGHT,
      configComplete: false
    };
  }

  componentDidMount() {
    // 设置antd组件的全局配置
    this.setAntGlobalConfig();
    // 设置前端的全局配置
    this.setWebConfig();
  }

  setAntGlobalConfig = () => {
    message.config({
      top: 30,
      duration: 2,
      maxCount: 3,
      getContainer: () => document.getElementById('web-main')
    });
  };

  setWebConfig = () => {
    // 获取前端配置及用户信息
    getConfig((serviceRes, configRes) => {
      window.service = serviceRes.data;
      window.__Conf__ = configRes.data;
      // 获取初始化时需要的信息：用户信息，当前样式主题，页签相关信息
      getInitSetting((userRes, themeRes, docRes ) => {
        // const _theme = process.env.NODE_ENV === 'production' ? themeRes.data || 'static/common/style/css_default.css' : 'static/common/style/css_default.css';
        // resetStyle(_theme, process.env.NODE_ENV !== 'production' ? true : themeRes.data ? false : true);
        const themeType = resetStyle(themeRes.data);
        this.setDocument(docRes.data);
        if(userRes && userRes.data.warn) {
          setTimeout(() => {
            notification.open({
              message: intl.get('Warning').defaultMessage('警告'),
              description: <span><Icon className="web-main-notice-icon" type="icon-info-circle"/><span className="web-main-notice-desc">{userRes.data.warnInfo}</span></span>,
              duration: 10,
              className: 'web-main-ant-notification'
            });
          });
        }
        reactCookie.save('sessionId', userRes && userRes.data.accessToken);
        this.setState({ currentUser: userRes && userRes.data, configComplete: true, theme: themeType });
      });
    });
  };

  // 设置页签的图标及title
  setDocument = (docRes) => {
    if(docRes.otherConfigJson){
      document.title = docRes.otherConfigJson.browserTitleName || '';
    }
    let _flink = document.getElementById('faviconLink');
    if(!_flink) return;
    if(docRes.fileUrl){
      _flink.href = window.service.portal + '/' + docRes.fileUrl + '?r=' + new Date().getTime();
      _flink.type = '';
      _flink.type = 'image/x-icon';
    } else {
      _flink.href = '/favicon.ico';
      _flink.type = '';
      _flink.type = 'image/x-icon';
    }
  };

  render() {
    const { configComplete, theme, currentUser } = this.state;
    return (
      <ThemeContext.Provider value={theme}>
        <Suspense fallback={
          <div className="init-spin-loading">
            <Spin spinning={!configComplete} />
          </div>
        }>
          {
            configComplete && window.service && window.__Conf__ ?
              <App currentUser={currentUser} resetStyle={resetStyle} /> :
              <div className="init-spin-loading">
                <Spin spinning={!configComplete} />
              </div>
          }
        </Suspense>
      </ThemeContext.Provider>
    );
  }
}

ReactDOM.render(<Index />, document.getElementById('web-main'));