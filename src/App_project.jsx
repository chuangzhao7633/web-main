import React, { Fragment, Component } from 'react';
import intl from 'react-intl-universal';
import { ConfigProvider, Spin, Empty, Menu, Layout, Breadcrumb, Select, Divider, Dropdown, Modal } from 'antd';
import { appMultipleRequest, getAuthSubMenu, getProject, logout } from '@service/global';
import { getLanguageFromCookie, changeMenuToLocale, loadLocales } from '@util/Utils';
import {initGlobalState, setDefaultMountApp} from 'qiankun';
import watermark from '@component/watermark';
import { getPageStorage, setPageStorage } from '@util/StorageUtil';
import { HISTORY_TOP_MENU, HISTORY_SUB_MENU, DATASOURCE_TYPE_MAP, HISTORY_PROJECT_CODE } from '@util/ConstUtil';
import IconFont from './components/Icon';
import QiankunStart from './QiankunRegist';

import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';

import 'antd/dist/antd.less';
// import './style/App.less';
import { ThemeContext } from "./util/ThemeContext";
import UserInfoModal from "./modal/UserInfoModal";
import ChangePwdModal from './modal/ChangePwdModal';
import AboutModal from "./modal/AboutModal";
import { isAdmin, isTenantOwner, pathToMathRouter } from "./util/Utils";

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;
const { Option } = Select;
const { confirm } = Modal;

class App extends Component {
  constructor(props) {
    super(props);
    const _language = getLanguageFromCookie();
    this.state = {
      menu: [],
      loading: true,
      locale: _language,
      user: this.props.currentUser
    };
    this.qiankunState = {
      language: _language,
      theme: this.context,
      systemCode: window.__Conf__.product,
      routerChange: this.routerChange,
      routerLeaveTip: false,
      routerLeaveTipChange: this.routerLeaveTipChange
    };
    this.qiankunHadRegist = false;
    this.topMenuMap = {};
    this.subMenuMap = {};
    this.projectMap = {};
    this.projectList = [];
  }

  languageMap = {
    'zh_CN': zhCN,
    'en_US': enUS
  };

  componentDidMount() {
    // setPageStorage(HISTORY_PROJECT_CODE, {}); // 清除缓存的项目code
    // 获取国际化文件、top导航、logo、水印信息、后台控制前端的配置信息
    appMultipleRequest(this.state.locale, this.state.user, (languageRes, menuRes, logoRes, waterMarkRes, frontConfigRes, clusterInfoRes, routerConfigRes) => {
      const _menus = menuRes && menuRes.data || [];
      loadLocales(languageRes && languageRes.data || {}, changeMenuToLocale(_menus));
      // 根据配置 分割顶部导航- 部分放到更多里面
      const _newMenus = _menus.length && _menus.slice(0, window.__Conf__.displayNav[this.state.locale]) || [];
      _menus.length && (_menus.length > window.__Conf__.displayNav[this.state.locale]) && _newMenus.push({ code: 'more', name: intl.get('More').defaultMessage('更多'), children: _menus.slice(window.__Conf__.displayNav[this.state.locale]) });
      const { topMenu, subMenu } = this.setJumpNewDefaultMenu(_menus, routerConfigRes.data.jumpRouter);
      const _defaultMenu = this.getDefaultMenu(_newMenus);
      this.setState({
        menu: _newMenus,
        currentMenu: _defaultMenu,
        logo: logoRes.data,
        waterMark: waterMarkRes.data,
        frontConfig: frontConfigRes.data,
        clusterInfo: clusterInfoRes.data[0],
        routerConfig: routerConfigRes.data.jumpRouter,
        routerLeaveTipConfig: routerConfigRes.data.leaveTipRouter
      }, () => {
        this.setWaterMark();
        if (_defaultMenu) {
          if (_defaultMenu.projectFlag) {
            this.getProjectList(false, _defaultMenu, null, _defaultMenu);
          } else {
            setPageStorage(HISTORY_TOP_MENU, _defaultMenu);
            if (!_defaultMenu.childrenNav) {
              this.getAuthSubMenuByMenu(_defaultMenu.code, _defaultMenu.functionCode, null, true);
            }
          }
          // _defaultMenu.projectFlag && this.getProjectList(false, _defaultMenu);
          // if (!_defaultMenu.childrenNav && !_defaultMenu.projectFlag) {
          //   debugger;
          //   this.getAuthSubMenuByMenu(_defaultMenu.code, _defaultMenu.functionCode, null, true);
          // } else {
          //   this.setState({ subMenu: [], curSubMenu: [], openKeys: null, loading: false })
          // }
        }
      });
    });
  }

  // 新打开页面路由处理
  setJumpNewDefaultMenu = (menus, routerConfig) => {
    let historyMenu = getPageStorage(HISTORY_TOP_MENU);
    let _historyTopMenuKey = historyMenu ? historyMenu.code : '';
    let _subMenu = getPageStorage(HISTORY_SUB_MENU)[_historyTopMenuKey];
    const _dealRouterConfigKeys  = Object.keys(routerConfig).filter(_key => routerConfig[_key].isOpenNew);
    _dealRouterConfigKeys.map(_item => {
      const {result, keys} = pathToMathRouter(_item);
      const match = result.exec(window.location.pathname);
      if (match) {
        const _routerConf = routerConfig[_item];
        if (_historyTopMenuKey === _routerConf.topKey) {
          historyMenu = historyMenu && Object.keys(historyMenu).length ? historyMenu : null;
          _subMenu.router = window.location.pathname;
        } else {
          _historyTopMenuKey = _routerConf.topKey;
          _subMenu = _routerConf.leftMenu;
          historyMenu = menus.filter(_item => _item.code === _routerConf.topKey);
          _subMenu.router = window.location.pathname;
        }
        setPageStorage(HISTORY_TOP_MENU, historyMenu);
        setPageStorage(HISTORY_SUB_MENU, { ...getPageStorage(HISTORY_SUB_MENU), [_historyTopMenuKey]: _subMenu });
      } else {
        historyMenu = null;
        _subMenu = null;
      }
    });
    return {
      topMenu: historyMenu,
      subMenu: _subMenu
    };
  };

  setWaterMark = () => {
    const { user, waterMark } = this.state;
    if (!waterMark) return;
    const _other = waterMark.otherConfigJson ? JSON.parse(waterMark.otherConfigJson) : {};
    const _userName = Number(_other.usernameFlag) === 0 && user ? user.name : '';
    Number(_other.watermarkFlag) === 0 && watermark({
      content: Number(_other.usernameFlag) === 0 ? _other.watermarkContent + '\n' + _userName : _other.watermarkContent,
      fillStyle: `rgba(184, 184, 184, ${_other.watermarkValue ? Number(_other.watermarkValue) : 0.2})`,
      width: '500px', height: '250px', rotate: '16'
    });
  };

  getCurrentAppEntry = (pathname) => {
    const _config = window.__Conf__;
    const curProd = pathname.split('/')[1];
    return _config.apps.filter(_item => _item.name === curProd)[0].entry;
  };

  /**
   * 获取项目列表
   * @param isRouterJump  true 是从别的菜单跳转到另一个菜单
   * @param menu  获取二级菜单的顶部菜单数据
   * @param subMenu  将要选中的二级菜单
   */
  getProjectList = (isRouterJump, menu, subMenu, currentMenu) => {
    getProject((projectRes) => {
      if (projectRes) {
        let { currentProject } = this.state;
        currentProject = currentProject || getPageStorage(HISTORY_PROJECT_CODE);
        // 跳转后获取
        this.projectList = projectRes;
        this.projectMap = {};
        if (isRouterJump) {
          this.setState({});
        } else {
          const defaultProject = currentProject && Object.keys(currentProject).length ? currentProject : this.projectList.length ? this.projectList[0] : {};
          this.setState({ currentProject: (currentProject && Object.keys(currentProject).length) ? currentProject : { ...defaultProject, projectCode: defaultProject.code, projectName: defaultProject.cnName, projectId: defaultProject.id }}, () => {
            if (defaultProject && defaultProject.type)  {
              defaultProject && Object.keys(defaultProject).length && currentProject !== defaultProject ? setPageStorage(HISTORY_PROJECT_CODE, this.state.currentProject) : '';
              setPageStorage(HISTORY_TOP_MENU, currentMenu);
            }
            this.qiankunStateChange('project', this.state.currentProject);
            this.getAuthSubMenuByMenu(menu.code, menu.functionCode, subMenu, this.state.currentProject, menu);
            // this.getAuthSubMenuByMenu(menu.code, menu.functionCode, subMenu, this.state.currentProject);
          });
        }
      }
    });
  };

  getDefaultMenu = (menus) => {
    const historyMenu = getPageStorage(HISTORY_TOP_MENU);
    if (historyMenu && Object.keys(historyMenu).length) {
      return historyMenu;
    } else {
      const _defaultMenus = menus.filter(_item => !_item.redirect);
      if (_defaultMenus.length) {
        // setPageStorage(HISTORY_TOP_MENU, _defaultMenus[0]);
        return _defaultMenus[0];
      }
    }
    return null;
  };

  // 获取有权限的二级菜单
  getAuthSubMenuByMenu = (key, authCode, currentSubMenu, currentProject, menu) => {
    const dataType = currentProject ? currentProject.type : '';
    getAuthSubMenu(key, authCode,  (subMenuRes, authMapRes, authListRes) => {
      const authList = authListRes && authListRes.data && authListRes.data.nav || [];
      subMenuRes = subMenuRes && subMenuRes.data || [];
      this.authMap = authMapRes && authMapRes.data || {};
      if (menu && menu.projectFlag) {
        if(dataType) { // 需要展示项目且有项目数参类型
          // 二级菜单的值：对象/数组，如果是对象先提取成数组
          subMenuRes = this.getSubMenuByMap(this.getSubMenuByDataTypeMap(subMenuRes, dataType));
          this.filterAuthMenu(subMenuRes, authList); // 根据返回的权限code过滤二级菜单导航
          const _curSubMenu = currentSubMenu || this.getCurSubMenu(subMenuRes);
          this.setState({ subMenu: subMenuRes, curSubMenu: _curSubMenu, openKeys: _curSubMenu.parentKey ? [_curSubMenu.parentKey] : null, loading: false, subMenuReq: true }, () => {
            if (!currentSubMenu) this.registQiankun();
          });
        } else {
          const _historyTopMenuCode = getPageStorage(HISTORY_TOP_MENU).code;
          const _historySubMenuObj = getPageStorage(HISTORY_SUB_MENU);
          setPageStorage(HISTORY_SUB_MENU, { ..._historySubMenuObj, [_historyTopMenuCode]: null });
          this.setState({ subMenu: [], curSubMenu: null, openKeys: [], loading: false, subMenuReq: true }, () => {
            // if (!currentSubMenu) this.registQiankun();
          });
        }
      } else {
        // 二级菜单的值：对象/数组，如果是对象先提取成数组
        subMenuRes = this.getSubMenuByMap(this.getSubMenuByDataTypeMap(subMenuRes, dataType));
        this.filterAuthMenu(subMenuRes, authList); // 根据返回的权限code过滤二级菜单导航
        const _curSubMenu = currentSubMenu || this.getCurSubMenu(subMenuRes);

        this.setState({ subMenu: subMenuRes, curSubMenu: _curSubMenu, openKeys: _curSubMenu.parentKey ? [_curSubMenu.parentKey] : null, loading: false, subMenuReq: true }, () => {
          if (!currentSubMenu) this.registQiankun();
        });
      }

    });
  };

  registQiankun = () => {
    // 注册子应用， 只需注册一次
    if (!this.qiankunHadRegist) {
      this.qiankunRegist();
      this.qiankunHadRegist = true;
    }
    // 加载子应用
    this.loadApp();
  };

  getSubMenuByDataTypeMap = (subMenuRes, dataType) => {
    if (Array.isArray(subMenuRes)) return subMenuRes;
    // 数据处理菜单处理
    if (dataType) {
      let _dataType;
      Object.keys(DATASOURCE_TYPE_MAP).map(key => {
        if(dataType.toLowerCase() === key) _dataType = DATASOURCE_TYPE_MAP[key];
      })
      const _MenuObj = subMenuRes[_dataType];
      if (Array.isArray(_MenuObj)) return _MenuObj;
      return subMenuRes;
    }
    return subMenuRes;
  };

  // 从对象中提取菜单数组
  getSubMenuByMap = (subMenuRes) => {
    if (Array.isArray(subMenuRes)) return subMenuRes;
    // 安全中心菜单处理
    const { user, clusterInfo } = this.state;
    const _key = isAdmin(user) ? 'admin' : isTenantOwner(user) ? 'tenant' : 'user';
    const _obj = subMenuRes[_key];
    if (Array.isArray(_obj)) return _obj;
    if (clusterInfo.isControllable) {
      return _obj.control;
    }
    return _obj.unControl;
  };

  // 设置默认路由跳转、注册主子项目通信监听
  qiankunRegist = () => {
    const { currentMenu, curSubMenu } = this.state;
    let _registMenu;
    if (!currentMenu.childrenNav) _registMenu = curSubMenu;
    else _registMenu = currentMenu; // 如果只有一级导航，没有二级导航时。
    if (_registMenu) {
      setDefaultMountApp(_registMenu.router);
      this.qiankunState.questUrl = this.getCurrentAppEntry(_registMenu.router);
      this.qiankunInitState = initGlobalState(this.qiankunState);
      this.qiankunInitState.onGlobalStateChange(this.qiankunGlobalStateChange);
      QiankunStart();
    }
  };

  // 主子项目通信监听处理函数
  qiankunGlobalStateChange = (value, prev) => {
    console.log('[onGlobalStateChange - master]:', value, prev);
    this.qiankunState = value;
  };

  // 子项目- 路由控制跳转
  routerChange = (targetRouter, param, product) => {
    const router = `/${product || window.__Conf__.product}${targetRouter}`;
    const _routerJump = !(this.state.routerConfig[router] && this.state.routerConfig[router].isOpenNew) ? this.state.routerConfig && this.state.routerConfig[router] : null;
    if(_routerJump) {
      const _currentMenu = this.state.menu.filter(_item => _item.code === _routerJump.topKey)[0];
      const _subMenu = _routerJump.leftMenu;
      _subMenu.param = param;
      _subMenu.router = router;
      setPageStorage(HISTORY_TOP_MENU, _currentMenu);
      setPageStorage(HISTORY_SUB_MENU, { ...getPageStorage(HISTORY_SUB_MENU), [_routerJump.topKey]: _subMenu });
      this.setState({
        currentMenu: _currentMenu
      }, () => {
        if(_currentMenu.projectFlag) {
          this.getProjectList(true, { code: _routerJump.topKey, functionCode: _currentMenu.functionCode, projectFlag: _currentMenu.projectFlag }, null, _currentMenu);
        } else {
          this.setState({ currentProject: null});
        }
        this.getAuthSubMenuByMenu(_routerJump.topKey, _currentMenu.functionCode, _subMenu);
      });
    } else {
      const _historyTopMenuCode = getPageStorage(HISTORY_TOP_MENU).code;
      const _subMenu = getPageStorage(HISTORY_SUB_MENU)[_historyTopMenuCode];
      _subMenu.router = router;
      _subMenu.param = param;
      setPageStorage(HISTORY_SUB_MENU, { ...getPageStorage(HISTORY_SUB_MENU), [_historyTopMenuCode]: _subMenu });
    }
    this.validateRouterLeaveTip(() => {
      window.history.pushState(param, null, router);
    });
  };

  routerLeaveTipChange = (changeFlag) => {
    this.qiankunState.routerLeaveTip = changeFlag;
  };

  // 工作流、etl路由离开时，如果未保存会进行提示
  validateRouterLeaveTip = (callback) => {
    let hasRouter = false;
    for(let i = 0; i < this.state.routerLeaveTipConfig.length; i++) {
      if (window.location.pathname.indexOf(this.state.routerLeaveTipConfig[i]) !== -1) {
        hasRouter = true;
        break;
      }
    }
    if(this.qiankunState.routerLeaveTip && hasRouter) {
      confirm({
        title: intl.get('Router_leave_Tip').defaultMessage('操作数据还未保存，确定离开当前页面？'),
        onOk: () => {
          this.qiankunState.routerLeaveTip = false;
          callback();
        }
      });
    } else {
      callback();
    }
  };

  // 面包屑控制跳转
  breadcrumbClick = (curSubMenu) => {
    this.validateRouterLeaveTip(() => {
      window.history.pushState(null, null, curSubMenu.router);
    });
  };

  // 根据返回的权限code过滤二级菜单导航 authList中包含的是无权限的code码
  filterAuthMenu = (subMenu, authList) => {
    for (let i = 0; i < subMenu.length; i++) {
      if (subMenu[i].code && authList.indexOf(this.authMap[subMenu[i].code]) !== -1) {
        subMenu.splice(i, 1);
        i--;
      } else if (subMenu[i].children && subMenu[i].children.length) {
        this.filterAuthMenu(subMenu[i].children, authList);
      }
    }
  };

  // 设置当前模块下默认展示的二级模块目录
  getCurSubMenu = (subMenu) => {
    const _historyTopMenuCode = getPageStorage(HISTORY_TOP_MENU).code;
    const _historySubMenuObj = getPageStorage(HISTORY_SUB_MENU);
    const _historySubMenu = _historySubMenuObj[_historyTopMenuCode];
    if ( _historySubMenu && Object.keys(_historySubMenu).length) {
      return _historySubMenu;
    }
    if (subMenu.length && (!subMenu[0].children || (subMenu[0].children && !subMenu[0].children.length))) {
      setPageStorage(HISTORY_SUB_MENU, { ..._historySubMenuObj, [_historyTopMenuCode]: subMenu[0] });
      return subMenu[0];
    }
    if (subMenu.length && subMenu[0].children && subMenu[0].children.length) {
      setPageStorage(HISTORY_SUB_MENU, { ..._historySubMenuObj, [_historyTopMenuCode]: subMenu[0].children[0] });
      return subMenu[0].children[0];
    }
  };

  // 根据url中的路由匹配导航
  filterSubMenu = (subMenu, pathname) => {
    for (let i = 0; i < subMenu.length; i++) {
      const _item = subMenu[i];
      if ((pathname.includes(_item.router)) && !(_item.children && _item.children.length)) {
        return {..._item, router: pathname !== window.location.pathname ? window.location.pathname : pathname }
      }
      if (_item.children && _item.children.length) {
        const _filterChild = this.filterSubMenu(_item.children, pathname);
        if (_filterChild) return _filterChild;
      }
    }
  };

  // 控制路由跳转
  loadApp = () => {
    const { curSubMenu } = this.state
    if (curSubMenu && Object.keys(curSubMenu).length){
      this.qiankunState.questUrl = this.getCurrentAppEntry(curSubMenu.router);
      this.dispatchAppState();
      window.history.pushState(curSubMenu.param || null, null, curSubMenu.router);
    }
  }

  // 一级导航目录点击时，获取二级导航目录，并获取一级导航目录下的所有按钮权限
  menuClick = (menuData) => {
    this.validateRouterLeaveTip(() => {
      const { currentMenu } = this.state;
      if (menuData.key === currentMenu.code) return;
      const _curMenu = this.topMenuMap[menuData.key];
      this.setState({ currentMenu: _curMenu, subMenuReq: false }, () => {
        // 如果是重定向则先打开窗口否则获取二级导航菜单
        if (_curMenu.redirect) {
          this.openNewPage(_curMenu)
        } else {
          if (_curMenu.projectFlag) {
            _curMenu.projectFlag && this.getProjectList(false, { code: menuData.key, functionCode: _curMenu.functionCode, projectFlag: _curMenu.projectFlag }, null, _curMenu);
          } else {
            setPageStorage(HISTORY_TOP_MENU, _curMenu);
            this.setState({ currentProject: null});
            this.getAuthSubMenuByMenu(menuData.key, _curMenu.functionCode, null);
          }
        }
      });
    });
  };

  // 打开新页签
  openNewPage = (curMenu) => {
    window.open(curMenu.url, 'blank');
  };

  dispatchAppState = () => {
    // 当前菜单的权限code下发到子项目中
    const _curMenu = this.topMenuMap[this.state.currentMenu.code];
    this.qiankunState.moduleAuthCode = _curMenu.functionCode;
    this.qiankunState.theme = this.context;
    this.qiankunState.user = {...this.state.user};
    this.qiankunInitState.setGlobalState(this.qiankunState);
  };

  /*
   * 二级导航点击时，加载对应的子项目app
   * */
  subMenuClick = (menuItem) => {
    this.validateRouterLeaveTip(() => {
      if (menuItem.key === this.state.curSubMenu.key) return;
      setPageStorage(HISTORY_SUB_MENU, { ...getPageStorage(HISTORY_SUB_MENU), [getPageStorage(HISTORY_TOP_MENU).code]: this.subMenuMap[menuItem.key] });
      this.setState({ curSubMenu: this.subMenuMap[menuItem.key] }, () => {
        this.loadApp();
      });
    });
  };

  /*
   * 更改项目时，向子项目下发当前选中的项目信息
   * */
  projectChange = (val) => {
    const _project = this.projectMap[val];
    const { currentProject, currentMenu } = this.state;
    for( var key in _project ){
      currentProject[key] = _project[key]
    }
    currentProject.projectCode = val;
    currentProject.projectName = _project.cnName;
    currentProject.projectId = _project.id;
    this.setState({}, () => {
      setPageStorage(HISTORY_PROJECT_CODE, currentProject);
      this.qiankunStateChange('project', currentProject);
      // this.setProjectCookie(currentProject.projectCode);
      // 项目更改后, 需要重新渲染二级菜单
      this.getAuthSubMenuByMenu(currentMenu.code, currentMenu.functionCode, null, _project)
    });
  };

  /*
   * 向子项目下发更改信息
   * */
  qiankunStateChange = (key, val) => {
    this.qiankunState[key] = val;
    this.qiankunInitState && this.qiankunInitState.setGlobalState(this.qiankunState);
  };

  /*
   * 二级导航打开下拉菜单
   * */
  onOpenChange = (openKeys) => {
    this.setState({ openKeys });
  };

  onCollapse = collapsed => {
    this.setState({ collapsed });
  };

  /*
   * 弹框的可见状态公用处理方法
   * */
  modalHandle = (key) => {
    this.setState({ [key]: !this.state[key] });
  };

  /*
   * 退出系统时，向子项目下发退出消息，子项目进行一些清除缓存等操作
   * */
  exitHandle = (evt) => {
    evt.preventDefault();
    this.qiankunStateChange('logout', true);
    window.localStorage.clear();
    logout();
  };

  helpHandle = () => {
    window.open(window.service.helpUrl, '_blank');
  };

  renderUserList = () => {
    return (
      <Menu>
        <Menu.Item>
          <a onClick={this.modalHandle.bind(this, 'userModalVisible')}>
            {intl.get('Account_Info').defaultMessage('账号信息')}
          </a>
        </Menu.Item>
        <Menu.Item>
          <a onClick={this.modalHandle.bind(this, 'pwdModalVisible')}>
            {intl.get('Modify_Psw').defaultMessage('修改密码')}
          </a>
        </Menu.Item>
      </Menu>
    );
  };

  /**主内容区 */
  renderLayout = (flag) => {
    const { currentMenu, curSubMenu, subMenu, currentProject, openKeys, collapsed, subMenuReq } = this.state;
    const displayStr = flag ? 'block' : 'none';
    return (
      !currentMenu.childrenNav ?
        <>
        <Sider width={237} className="qiankun-left-nav-sider" style={{ display: displayStr }} collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
          {
            currentMenu.projectFlag ?
              <div className="project-container">
                <Select value={ currentProject ? currentProject.projectCode : null } onChange={this.projectChange}>
                  {
                    this.projectList.map(_item => {
                      this.projectMap[_item.code] = _item;
                      return <Option key={_item.code} value={_item.code} >{_item.cnName}</Option>;
                    })
                  }
                </Select>
              </div> : null
          }
          <Menu
            style={{ display: displayStr }}
            mode="inline"
            openKeys={openKeys}
            selectedKeys={curSubMenu ? [curSubMenu.key] : []}
            onOpenChange={this.onOpenChange}
            inlineCollapsed={collapsed}
            onClick={this.subMenuClick}>
            {
              subMenu.map(_item => {
                this.subMenuMap[_item.key] = _item;
                if (_item.children && _item.children.length) {
                  return (
                    <SubMenu icon={<IconFont type={_item.icon} />} key={_item.key} title={intl.get(_item.key).defaultMessage(_item.cn)}>
                      {
                        _item.children.map(_cItem => {
                          this.subMenuMap[_cItem.key] = _cItem;
                          return <Menu.Item key={_cItem.key}>{intl.get(_cItem.key).defaultMessage(_cItem.cn)}</Menu.Item>;
                        })
                      }
                    </SubMenu>
                  );
                }
                return <Menu.Item icon={<IconFont type={_item.icon} />} key={_item.key}>{intl.get(_item.key).defaultMessage(_item.cn)}</Menu.Item>
              })
            }
          </Menu>
        </Sider>
        <Layout className="qiankun-main-layout">
          <Breadcrumb className="main-breadcrumb" style={{ display: displayStr }} separator=">">
            <Breadcrumb.Item>{intl.get(currentMenu.code).defaultMessage(currentMenu.name)}</Breadcrumb.Item>
            {
              curSubMenu
                ?
                <Fragment>
                  {
                    curSubMenu.parentKey ?
                      <Breadcrumb.Item>{intl.get(curSubMenu.parentKey).defaultMessage( this.subMenuMap[curSubMenu.parentKey] && this.subMenuMap[curSubMenu.parentKey].cn)}</Breadcrumb.Item> :
                      null
                  }
                  <Breadcrumb.Item><a href="javascript:;" onClick={this.breadcrumbClick.bind(this, curSubMenu)}>{intl.get(curSubMenu.key).defaultMessage(curSubMenu.cn)}</a></Breadcrumb.Item>
                </Fragment>
                : null
            }

          </Breadcrumb>
          <Content
            id="app-container"
            style={{ display: displayStr }}
            className="qiankun-site-layout-background">

          </Content>
          <div style={{ display: !subMenuReq ? 'none' : flag ? 'none' : 'block' }}>
            <Empty image="/static/common/img/not-found.png" description={intl.get('Project_Empty_Tip').defaultMessage('没有项目，请先创建项目！')} />
          </div>
        </Layout>
        </> :
        <Content
          id="app-container"
          className="qiankun-main-layout">
        </Content>
    )
  };

  render() {
    const { loading, menu, locale, logo, currentMenu, curSubMenu, subMenu, currentProject, openKeys, collapsed, user, userModalVisible, pwdModalVisible, frontConfig, aboutModalVisible } = this.state;
    if (loading) {
      return (
        <div className="init-spin-loading">
          <Spin spinning={loading} />
        </div>
      );
    } else if (!menu.length) {
      return <Empty description={intl.get('Page_Auth_Refused').defaultMessage('您无权限访问，请联系管理员')} />;
    }
    const _productName = window.__Conf__.product;
    return (
      <ConfigProvider locale={this.languageMap[locale]} prefixCls="main-ant">
        <Layout>
          <Header className="qiankun-header">
            <div className="logo" style={window.__Conf__.logoStyle}>
              {logo && logo.fileUrl ? <img src={`${window.service.portal}/${logo.fileUrl}`} style={window.__Conf__.logoImgStyle} alt=""/> : ''}
              {/* {!logo.status ? <img src={`/static/common/img/${locale.toLowerCase() === 'zh_cn' ? `logo.png`: `logo_en.png`}`} style={window.__Conf__.logoImgStyle} alt=""/> : null} */}
            </div>
            <Menu onClick={this.menuClick} selectedKeys={currentMenu ? [currentMenu.code] : []} mode="horizontal">
              {menu.map(_menu => {
                if (_menu.children) {
                  return (
                    <SubMenu popupClassName="top-more-sub-menu" key={_menu.code} title={_menu.name}>
                      {
                        _menu.children.map(_cItem => {
                          this.topMenuMap[_cItem.code] = _cItem;
                          return <Menu.Item key={_cItem.code}>{_cItem.name}</Menu.Item>;
                        })
                      }
                    </SubMenu>
                  );
                } else {
                  this.topMenuMap[_menu.code] = _menu;
                  return <Menu.Item key={_menu.code}>{_menu.name}</Menu.Item>;
                }
              })}
            </Menu>
            <div className="header-right">
              <span>
                {intl.get('H_Welcome').defaultMessage('欢迎您')}，
                <Dropdown overlayClassName="main-top-person-menu" overlay={this.renderUserList()} trigger="click">
                  <span className="">
                    <IconFont type="icon-user" />
                    <span>{user.name}</span>
                  </span>
                </Dropdown>
              </span>
              <Divider type="vertical" />
              <span onClick={this.exitHandle}>{intl.get('Exit').defaultMessage('退出')}</span>
              <Divider type="vertical" />
              <span onClick={this.helpHandle}>{intl.get('Help').defaultMessage('帮助')}</span>
              <Divider type="vertical" />
              <span onClick={this.modalHandle.bind(this, 'aboutModalVisible')}>{intl.get('About').defaultMessage('关于')}</span>
            </div>
          </Header>
          <Layout className="qiankun-content-layout">
            {
              currentMenu.projectFlag ?
                currentProject && currentProject.type ?
                  this.renderLayout(true)
                  : this.renderLayout(false)
                : this.renderLayout(true)
            }
          </Layout>
        </Layout>
        <UserInfoModal visible={userModalVisible} user={user} onCancel={this.modalHandle.bind(this, 'userModalVisible')} />
        <ChangePwdModal visible={pwdModalVisible} user={user} onCancel={this.modalHandle.bind(this, 'pwdModalVisible')} />
        <AboutModal visible={aboutModalVisible} user={user} productNames={ frontConfig && frontConfig.productName || ""} onCancel={this.modalHandle.bind(this, 'aboutModalVisible')} />
      </ConfigProvider>
    );
  }
}
App.contextType = ThemeContext;
export default App;
