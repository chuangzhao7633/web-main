import HelpTip from '@component/HelpTip';
import watermark from '@component/watermark';
import { appInitialRequest, getAuthAndSubMenu, getProject, logout } from '@service/global';
import { DATASOURCE_TYPE_MAP, HISTORY_PROJECT_CODE, HISTORY_HAS_PARAM_MENU, MAIN_HELP_TIP, MENU_METHOD_NEWPAGE, MENU_METHOD_IFRAME, MENU_METHOD_ROUTER, PROJECT_DBTYPE_DIC } from '@util/ConstUtil';
import { getPageStorage, setPageStorage, removePageStorage, setCurrentPage, getCurrentPage } from '@util/StorageUtil';
import { getLanguageFromCookie, isEmpty, loadLocales, generatorUUID, isAdmin, isTenantOwner, pathToMathRouter } from '@util/Utils';
import { Breadcrumb, ConfigProvider, Divider, Dropdown, Empty, Layout, Menu, Modal, Select, Spin } from 'antd';
import 'antd/dist/antd.less';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import { initGlobalState, setDefaultMountApp } from 'qiankun';
import React, { Component } from 'react';
import intl from 'react-intl-universal';
import IconFont from './components/Icon';
import QiankunStart from './QiankunRegist';

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;
const { Option } = Select;
const { confirm } = Modal;
const UUID_LENGTH = 8;

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
      theme: this.props.theme,
      systemCode: window.__Conf__.product,
      routerChange: this.routerChange,
      goBack: this.goBack,
      routerLeaveTip: false,
      routerLeaveTipChange: this.routerLeaveTipChange,
      resetStyle: this.changeResetStyle
    };
    this.qiankunHadRegist = false;
    this.topMenuMap = {};
    this.subMenuMap = {};
    this.projectMap = {};
    this.projectList = [];
    this.helpAuthMap = {};
  }

  languageMap = {
    'zh_CN': zhCN,
    'en_US': enUS
  };

  componentDidMount() {
    // 获取国际化文件、top导航、logo、水印信息、后台控制前端的配置信息
    appInitialRequest(this.state.locale, this.state.user, (localLanguageRes, dbLanguageRes, menuRes, logoRes, waterMarkRes, clusterInfoRes, routerConfigRes) => {
      const _menus = menuRes && menuRes.data || [];
      loadLocales(localLanguageRes && localLanguageRes.data || {}, dbLanguageRes ? dbLanguageRes.data : {});
      const { maps, leaveRouters } = this.setRouterMap(routerConfigRes.data);
      // const { topMenu, subMenu } = this.setJumpNewDefaultMenu(_menus, routerConfigRes.data.jumpRouter);
      let { topMenu, subMenu } = this.setTopDefaultMenu(_menus, maps);
      // if (Array.isArray(_defaultMenu) && _defaultMenu.length) _defaultMenu = _defaultMenu[0];
      this.setState({
        menu: _menus,
        curTopMenu: topMenu,
        logo: logoRes.data,
        waterMark: waterMarkRes.data,
        clusterInfo: clusterInfoRes.data[0],
        routerConfig: maps,
        routerLeaveTipConfig: leaveRouters
      }, () => {
        this.setWaterMark();
        if (topMenu.pageRefType === MENU_METHOD_IFRAME) {
          if (topMenu.url.indexOf('${user}') !== -1) topMenu.url = topMenu.url.replace('${user}', this.state.user.name);
          if (!topMenu.router) topMenu.router = generatorUUID(UUID_LENGTH);
          this.setState({ loading: false }, () => this.setIframe(topMenu));
          return;
        }
        // 设置默认导航及路由
        if (topMenu) {
          topMenu.projectFlag && this.getProjectList(topMenu, subMenu);
          if (topMenu.childrenNav && !topMenu.projectFlag) {
            this.getAuthSubMenuByMenu(topMenu.code, topMenu.code, subMenu, true);
          }
        }
      });
    });

    const _this = this;
    window.addEventListener("popstate", function (e) {
      if (e.isTrusted) {
        const { menu, routerConfig } = _this.state;
        const { pathname } = window.location;
        _this.qiankunState.questUrl = _this.getCurrentAppEntry(pathname);
        _this.qiankunInitState = initGlobalState(_this.qiankunState);
        let { topMenu, subMenu } = _this.setTopDefaultMenu(menu, routerConfig);
        // 设置默认导航及路由
        _this.setState({
          curTopMenu: topMenu
        })
        if (topMenu) {
          topMenu.projectFlag && _this.getProjectList(topMenu, subMenu, false, true);
          if (topMenu.childrenNav && !topMenu.projectFlag) {
            _this.getAuthSubMenuByMenu(topMenu.code, topMenu.code, subMenu, false, false, true);
          }
        }
      }
    }, false);
  }

  // 设置路由的映射关系
  setRouterMap = (routerList) => {
    const maps = {};
    const leaveRouters = [];
    routerList.map(_item => {
      maps[_item.router] = _item;
      if (_item.jumpTipFlag) leaveRouters.push(_item.router);
    });
    return { maps, leaveRouters };
  };

  // 设置默认顶部导航
  setTopDefaultMenu = (menus, routerMap) => {
    const _router = window.location.pathname;
    let _defaultMenus;
    let _subMenu;
    if (!_router || _router === '/') {
      _defaultMenus = menus.filter(_item => _item.pageRefType !== MENU_METHOD_NEWPAGE);
    } else {
      const _dealRouterConfigKeys = Object.keys(routerMap).filter(_key => routerMap[_key].isNewPage);
      let matchFlag = false;
      let pathname = decodeURIComponent(_router); // 对url进行解码
      _dealRouterConfigKeys.map(_item => {
        const _newItem = _item.replace(/\|/g, '\\|');
        console.log(_newItem);
        const { result, keys } = pathToMathRouter(_newItem);
        const match = result.exec(pathname);
        if (match) {
          matchFlag = true;
          const _routerConf = routerMap[_item];
          const newPathname = pathname.split('|')[0];
          // _routerConf.router = newPathname;
          _subMenu = { ...routerMap[_routerConf.router].leftMenu, router: newPathname };
          _defaultMenus = menus.filter(_m => _m.code === routerMap[_routerConf.router].topMenu.code)
        }
      });
      if (!matchFlag) _defaultMenus = menus.filter(_m => _m.code === routerMap[_router].topMenu.code)
    }
    return {
      topMenu: _defaultMenus.length ? _defaultMenus[0] : null,
      subMenu: _subMenu
    };
  };

  setWaterMark = () => {
    const { user, waterMark } = this.state;
    if (!waterMark) return;
    const _other = waterMark.otherConfigJson ? waterMark.otherConfigJson : {};
    const _userName = Number(_other.usernameFlag) === 0 && user ? user.name : '';
    const _systemTime = Number(_other.timeFlag) === 0 ? _other.systemTime || '' : '';
    const content = `${_other.watermarkContent}${_userName ? '\n' + _userName : ''}${_systemTime ? '\n' + _systemTime : ''}`;
    Number(_other.watermarkFlag) === 0 && watermark({
      content,
      fillStyle: `rgba(184, 184, 184, ${_other.watermarkValue ? Number(_other.watermarkValue) : 0.2})`,
      width: '500px', height: '250px', rotate: '16',
      containerTop: '70px', containerleft: '180px'
    });
  };

  getCurrentAppEntry = (pathname) => {
    const _config = window.__Conf__;
    const curProd = pathname.split('/')[1];
    const _fapps = _config.apps.filter(_item => _item.activeRuleStr.split('/')[1] === curProd);
    return _fapps[0].entry;
  };

  // 获取项目列表
  getProjectList = (menu, subMenu, isTopMenuClick, isTrusted) => {
    getProject((projectRes) => {
      if (projectRes) {
        let { currentProject } = this.state;
        currentProject = currentProject || getPageStorage(HISTORY_PROJECT_CODE);
        // 跳转后获取
        this.projectList = projectRes;
        this.projectMap = {};
        const defaultProject = !isEmpty(currentProject) ? currentProject : this.projectList.length ? this.projectList[0] : {};
        this.setState({ currentProject: !isEmpty(currentProject) ? currentProject : { ...defaultProject, projectCode: defaultProject.code, projectName: defaultProject.cnName, projectId: defaultProject.id } }, () => {
          !isEmpty(defaultProject) && currentProject !== defaultProject ? setPageStorage(HISTORY_PROJECT_CODE, this.state.currentProject) : '';
          this.qiankunStateChange('project', this.state.currentProject);
          this.getAuthSubMenuByMenu(menu.code, menu.code, subMenu, this.state.currentProject, isTopMenuClick, isTrusted);
        });
      }
    });
  };

  /**
   * 获取有权限的二级菜单
   * @param key: code 菜单唯一标识（现在用的权限code）
   * @param authCode: 权限code
   * @param leftMenu: 定位的左侧菜单, 从allRoute里面过滤出来的
   * @param currentProject： 当前项目
   * @param isTopMenuClick： 是否是点击顶部菜单请求二级菜单的，点击顶部菜单进来，需要单独处理默认子菜单， 因为window.location.pathname还是原来的，没更新过来
   */
  getAuthSubMenuByMenu = (key, authCode, leftMenu, currentProject, isTopMenuClick, isTrusted) => {
    const dataType = currentProject && currentProject.type ? PROJECT_DBTYPE_DIC[currentProject.type.toLowerCase()] : '';
    const clusterInfo = this.state.clusterInfo;
    getAuthAndSubMenu(authCode, authCode, clusterInfo.controlStatus, dataType ? dataType : 0, (subMenuRes, webAuthMapRes, dbAuthMapRes, helpAuthMapRes, helpServerRes, helpMsgList) => {
      // const authList = authListRes && authListRes.data && authListRes.data.nav || [];
      subMenuRes = subMenuRes && subMenuRes.data || [];
      webAuthMapRes = webAuthMapRes && webAuthMapRes.data || {};
      dbAuthMapRes = dbAuthMapRes && dbAuthMapRes.data || {};
      this.authMap = { ...webAuthMapRes, ...dbAuthMapRes };
      this.helpAuthMap = { ...(helpAuthMapRes.data || {}), ...(helpServerRes?.data || {}) };
      window[MAIN_HELP_TIP] = {};
      helpMsgList.data && helpMsgList.data.length && helpMsgList.data.map(_item => {
        window[MAIN_HELP_TIP][_item.navigatorCode] = _item;
      });
      // 二级菜单的值：对象/数组，如果是对象先提取成数组
      subMenuRes = this.getSubMenuByMap(this.getSubMenuByDataTypeMap(subMenuRes, dataType));
      // this.filterAuthMenu(subMenuRes, authList); // 根据返回的权限code过滤二级菜单导航
      let _curSubMenu;
      if (leftMenu) { // 新打开页面，需要重写左侧菜单的router 还有传给页面的参数
        _curSubMenu = this.filterSubMenu(subMenuRes, leftMenu.code);
        _curSubMenu.router = leftMenu.router;
        _curSubMenu.param = leftMenu.param;
        _curSubMenu.parentCode = leftMenu.allParentCode;
      } else {
        _curSubMenu = this.getCurSubMenu(subMenuRes, isTopMenuClick);
        const storageParamMenu = getPageStorage(HISTORY_HAS_PARAM_MENU);
        if (storageParamMenu && storageParamMenu.router === _curSubMenu.router) {
          _curSubMenu.param = storageParamMenu.param;
        }
      }
      if (_curSubMenu.showPage) { // 左侧菜单点击直接跳转页面，当前页面显示空白
        this.setState({ subMenu: subMenuRes, curSubMenu: _curSubMenu, openKeys: _curSubMenu && _curSubMenu.parentCode ? _curSubMenu.parentCode.split(',') : null, loading: false, isEmptyPage: _curSubMenu.isOpenNew });
      }
      if (_curSubMenu.pageRefType === MENU_METHOD_IFRAME) {
        if (_curSubMenu.url.indexOf('${user}') !== -1) _curSubMenu.url = _curSubMenu.url.replace('${user}', this.state.user.name);
        if (!_curSubMenu.router) _curSubMenu.router = generatorUUID(UUID_LENGTH);
        // _curSubMenu.url = _curSubMenu.url.indexOf('?') > -1 ? `${_curSubMenu.url}&time=${new Date().getTime()}` : `${_curSubMenu.url}?time=${new Date().getTime()}`;
      }
      this.setState({ subMenu: subMenuRes, curSubMenu: _curSubMenu, openKeys: _curSubMenu && _curSubMenu.parentCode ? _curSubMenu.parentCode.split(',') : null, loading: false, isEmptyPage: false }, () => {
        if (_curSubMenu.pageRefType === MENU_METHOD_ROUTER && !isTrusted) { // 需要iframe嵌入
          this.registQiankun();
        } else if (_curSubMenu.pageRefType === MENU_METHOD_IFRAME) {
          this.setIframe(_curSubMenu);
          return;
        }
      });
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
    dataType = dataType || 'hive'; // 默认加载hive类型的菜单
    if (Array.isArray(subMenuRes)) return subMenuRes;
    // 数据处理菜单处理
    if (dataType) {
      let _dataType;
      Object.keys(DATASOURCE_TYPE_MAP).map(key => {
        if (dataType.toLowerCase() === key) _dataType = DATASOURCE_TYPE_MAP[key];
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
    if (clusterInfo.controlStatus) {
      return _obj.control;
    }
    return _obj.unControl;
  };

  // 设置默认路由跳转、注册主子项目通信监听
  qiankunRegist = () => {
    const { curTopMenu, curSubMenu } = this.state;
    let _registMenu;
    if (curTopMenu.childrenNav) _registMenu = curSubMenu;
    else _registMenu = curTopMenu; // 如果只有一级导航，没有二级导航时。
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

  // 返回上一页
  goBack = (url) => {
    const prevUrl = getCurrentPage();
    const { curSubMenu } = this.state;
    const menus = this.subMenuMap[curSubMenu.parentCode]
    const subMenu = this.filterSubMenu(menus.children, curSubMenu.code);
    const targetUrl = url ? url : prevUrl.url ? prevUrl.url : subMenu.url;
    const params = window.history.state?.returnObj ? window.history.state.returnObj.params : window.history.state;
    this.routerChange(targetUrl, params, null, true)
  }

  // 子项目- 路由控制跳转， product 为子项目路由前缀
  routerChange = (targetRouter, param, product, noProductName) => {
    setCurrentPage(window.location.pathname)
    const routerUrl = noProductName ? targetRouter : `/${product || window.__Conf__.product}${targetRouter}`;
    const _routerJump = !(this.state.routerConfig[routerUrl] && this.state.routerConfig[routerUrl].isNewPage) ? this.state.routerConfig && this.state.routerConfig[routerUrl] : null;
    if (_routerJump) {
      const _currentMenu = this.state.menu.filter(_item => _item.code === _routerJump.topMenu.code)[0];
      const _subMenu = _routerJump.leftMenu;
      _subMenu.param = param;
      _subMenu.router = routerUrl;
      _subMenu.parentCode = _subMenu.allParentCode;
      if (param) {
        setPageStorage(HISTORY_HAS_PARAM_MENU, _subMenu);
      } else {
        removePageStorage(HISTORY_HAS_PARAM_MENU);
      }
      this.setState({
        curTopMenu: _currentMenu,
      }, () => {
        this.validateRouterLeaveTip(() => {
          if (_currentMenu.projectFlag) {
            this.getProjectList({ code: _currentMenu.code, functionCode: _currentMenu.code }, _subMenu);
          } else {
            this.setState({ currentProject: null });
            this.getAuthSubMenuByMenu(_currentMenu.code, _currentMenu.code, _subMenu);
          }
        });
      });
    } else {
      this.validateRouterLeaveTip(() => {
        if (param) {
          setPageStorage(HISTORY_HAS_PARAM_MENU, { param, router: routerUrl });
        } else {
          removePageStorage(HISTORY_HAS_PARAM_MENU);
        }
        window.history.pushState(param, null, routerUrl);
      });
    }
  };

  setIframe = (menuParam, urlKey = 'url') => {
    const frame = document.getElementById('web-main-iframe-content')
    if (frame) {
      frame.src = '';
      setTimeout(() => {
        frame.contentWindow.location.reload(true);
        frame.src = menuParam[urlKey];
      }, 200);
    }
    window.history.pushState(menuParam.param || null, null, menuParam.router || menuParam.url);
  };

  routerLeaveTipChange = (changeFlag) => {
    this.qiankunState.routerLeaveTip = changeFlag;
  };

  // 更改主题
  changeResetStyle = (data) => {
    const _themeType = this.props.resetStyle(data);
    this.qiankunStateChange('theme', _themeType);
  };

  // 工作流、etl路由离开时，如果未保存会进行提示
  validateRouterLeaveTip = (callback) => {
    let hasRouter = false;
    for (let i = 0; i < this.state.routerLeaveTipConfig.length; i++) {
      let _tipRouter = this.state.routerLeaveTipConfig[i];
      const pathname = window.location.pathname;
      const _newItem = _tipRouter.replace(/\|/g, '\\|');
      const { result, keys } = pathToMathRouter(_newItem);
      const match = result.exec(pathname);
      if (match) {
        _tipRouter = pathname.split('|')[0];
      }
      if (window.location.pathname.indexOf(_tipRouter) !== -1) {
        hasRouter = true;
        break;
      }
    }
    if (this.qiankunState.routerLeaveTip && hasRouter) {
      confirm({
        title: intl.get('Router_leave_Tip').defaultMessage('操作数据还未保存，确定离开当前页面？'),
        onOk: () => {
          this.qiankunState.routerLeaveTip = false;
          callback();
        },
        getContainer: () => document.getElementById('web-main')
      });
    } else {
      callback();
    }
  };

  // 面包屑控制跳转
  breadcrumbClick = (curSubMenu) => {
    curSubMenu && this.validateRouterLeaveTip(() => {
      window.history.pushState(null, null, curSubMenu.router);
    });
  };

  // 设置当前模块下默认展示的二级模块目录
  getCurSubMenu = (subMenus, isTopMenuClick) => {
    const { routerConfig } = this.state;
    const pathname = window.location.pathname;
    const _curRouter = routerConfig[pathname];
    if (!_curRouter || isTopMenuClick) {
      if (subMenus.length && (!subMenus[0].children || (subMenus[0].children && !subMenus[0].children.length))) return subMenus[0];
      if (subMenus.length && subMenus[0].children && subMenus[0].children.length) return subMenus[0].children[0];
    } else {
      const subMenu = this.filterSubMenu(subMenus, _curRouter.leftMenu.code);
      // parentCode: 是以逗号分隔的字符串
      return { ..._curRouter.leftMenu, parentCode: _curRouter.leftMenu.allParentCode, name: subMenu ? subMenu.name : '', router: pathname, subSystemCode: subMenu ? subMenu.subSystemCode || '' : '' };
    }
    return null;
  };

  // 根据code从左侧菜单列表中过滤
  filterSubMenu = (subMenus, code) => {
    for (let i = 0; i < subMenus.length; i++) {
      const _item = subMenus[i]
      if (_item.code === code) {
        return { ..._item };
      } else if (_item.children && _item.children.length) {
        const _filterChild = this.filterSubMenu(_item.children, code);
        if (_filterChild) return _filterChild;
      }
    }
  };

  // 控制路由跳转
  loadApp = () => {
    const { curSubMenu } = this.state;
    if (!curSubMenu) return;
    this.qiankunState.questUrl = this.getCurrentAppEntry(curSubMenu.router);
    this.dispatchAppState();
    window.history.pushState(curSubMenu.param || null, null, curSubMenu.router);
  }

  // 一级导航目录点击时，获取二级导航目录，并获取一级导航目录下的所有按钮权限
  menuClick = (menuData) => {
    removePageStorage(HISTORY_HAS_PARAM_MENU);
    this.validateRouterLeaveTip(() => {
      const { curTopMenu } = this.state;
      if (menuData.key === curTopMenu.code) return;
      const _curMenu = this.topMenuMap[menuData.key];
      if (_curMenu.pageRefType === MENU_METHOD_NEWPAGE) { // 新打开页签
        if (_curMenu.url.indexOf('${user}') !== -1) _curMenu.url = _curMenu.url.replace('${user}', this.state.user.name);
        this.openNewPage(_curMenu);
      } else if (_curMenu.pageRefType === MENU_METHOD_IFRAME) { // iframe嵌入
        if (_curMenu.url.indexOf('${user}') !== -1) _curMenu.url = _curMenu.url.replace('${user}', this.state.user.name);
        if (!_curMenu.router) _curMenu.router = generatorUUID(UUID_LENGTH);
        this.setState({ curTopMenu: _curMenu }, () => this.setIframe(_curMenu));
      } else { // 内部路由跳转
        this.setState({ curTopMenu: _curMenu }, () => {
          if (_curMenu.projectFlag) {
            this.getProjectList({ code: menuData.key, functionCode: _curMenu.code }, null, true);
          } else {
            this.setState({ currentProject: null });
            if (_curMenu.childrenNav) {
              this.getAuthSubMenuByMenu(menuData.key, _curMenu.code, null, false, true);
            }
          }
        });
      }
    });
  };

  // 打开新页签
  openNewPage = (curMenu) => {
    window.open(curMenu.url, '_blank');
  };

  // 下发数据到子项目
  dispatchAppState = () => {
    // 当前菜单的权限code下发到子项目中
    const _curMenu = this.topMenuMap[this.state.curTopMenu.code];
    const { curSubMenu, user } = this.state;
    this.qiankunState.moduleAuthCode = _curMenu.code;
    this.qiankunState.theme = this.qiankunState.theme || this.props.theme;
    this.qiankunState.user = { ...user };
    this.qiankunState.subProCode = curSubMenu.subSystemCode || '';
    this.qiankunInitState.setGlobalState(this.qiankunState);
  };

  /*
  * 二级导航点击时，加载对应的子项目app
  * */
  subMenuClick = (menuItem) => {
    removePageStorage(HISTORY_HAS_PARAM_MENU);
    this.validateRouterLeaveTip(() => {
      const { curSubMenu } = this.state;
      if (!curSubMenu || menuItem.key === curSubMenu.code) {
        if (curSubMenu && curSubMenu.pageRefType === MENU_METHOD_NEWPAGE) {
          if (curSubMenu.url.indexOf('${user}') !== -1) curSubMenu.url = curSubMenu.url.replace('${user}', this.state.user.name);
          window.open(curSubMenu.url, '_blank');
        }
        return;
      }
      const _currentSubMenu = this.subMenuMap[menuItem.key];
      if (_currentSubMenu.pageRefType === MENU_METHOD_NEWPAGE) {
        if (_currentSubMenu.url.indexOf('${user}') !== -1) _currentSubMenu.url = _currentSubMenu.url.replace('${user}', this.state.user.name);
        window.open(_currentSubMenu.url, '_blank');
      } else {
        if (_currentSubMenu.pageRefType === MENU_METHOD_IFRAME) {
          _currentSubMenu.url = _currentSubMenu.url.replace('${user}', this.state.user.name);
          if (!_currentSubMenu.router) _currentSubMenu.router = generatorUUID(UUID_LENGTH);
        }
        this.setState({ curSubMenu: this.subMenuMap[menuItem.key] }, () => {
          if (_currentSubMenu.pageRefType === MENU_METHOD_ROUTER) {
            if (this.qiankunInitState) {
              this.loadApp();
            } else {
              this.registQiankun();
            }
          } else {
            this.setIframe(_currentSubMenu);
          }
        });
      }
    });
  };

  /*
  * 更改项目时，向子项目下发当前选中的项目信息
  * */
  projectChange = (val) => {
    const _project = this.projectMap[val];
    const { currentProject, curTopMenu } = this.state;
    for (var key in _project) {
      currentProject[key] = _project[key]
    }
    currentProject.projectCode = val;
    currentProject.projectName = _project.cnName;
    currentProject.projectId = _project.id;
    this.setState({}, () => {
      setPageStorage(HISTORY_PROJECT_CODE, currentProject);
      this.qiankunStateChange('project', currentProject);
      // 项目更改后, 需要重新渲染二级菜单
      this.getAuthSubMenuByMenu(curTopMenu.code, curTopMenu.code, null, _project)
    });
  };

  /*
   * 向子项目下发更改信息
   * */
  qiankunStateChange = (key, val) => {
    this.qiankunState[key] = val;
    this.setState({});
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

  /**跳转首页 */
  goHome = () => {
    window.open(window.service.homeUrl, '_blank');
  }

  loopLeftSubMenu = (subMenu) => {
    return subMenu?.map(_item => {
      this.subMenuMap[_item.code] = _item;
      if (_item.children && _item.children.length) {
        return (
          <SubMenu icon={_item.icon ? <IconFont type={_item.icon} /> : null} key={_item.code} title={_item.name}>
            {this.loopLeftSubMenu(_item.children)}
          </SubMenu>
        );
      }
      return <Menu.Item icon={_item.icon ? <IconFont type={_item.icon} /> : null} key={_item.code}>{_item.name}</Menu.Item>;
    })
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

  render() {
    const { isEmptyPage, loading, menu, locale, logo, curTopMenu, curSubMenu, subMenu, currentProject, openKeys, collapsed, user, userModalVisible, pwdModalVisible, aboutModalVisible } = this.state;
    const helpCode = curSubMenu && this.helpAuthMap ? this.helpAuthMap[curSubMenu.code] : '';
    console.log(helpCode);
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
      <ConfigProvider locale={this.languageMap[locale]} getPopupContainer={() => document.getElementById('web-main')}>
        <Layout>
          <Header className="qiankun-header">
            <a className="home-icon" onClick={this.goHome}>
              <IconFont type="icon-a-home-4-fill2" />
            </a>

            <div className="logo" style={window.__Conf__.logoStyle}>
              {
                logo && logo.fileUrl ?
                  <img src={`${window.service.portal}/${logo.fileUrl}`} style={window.__Conf__.logoImgStyle} alt="" />
                  : null
              }
            </div>
            <Menu
              style={{ width: `calc(100% - 280px - 80px - ${window.__Conf__.logoStyle.width})`, maxWidth: `calc(100% - 280px - 80px - ${window.__Conf__.logoStyle.width})` }}
              onClick={this.menuClick} triggerSubMenuAction="click" overflowedIndicator={intl.get('More').defaultMessage('更多')}
              selectedKeys={curTopMenu ? [curTopMenu.code] : []} mode="horizontal" >
              {menu.map(_menu => {
                this.topMenuMap[_menu.code] = _menu;
                return <Menu.Item popupClassName="top-more-sub-menu" key={_menu.code} title={_menu.name}>{_menu.name}</Menu.Item>;
              })}
            </Menu>
            <div className="header-right">
              <div className="header-right-other">
                <Divider type="vertical" />
                <span onClick={this.exitHandle}>{intl.get('Exit').defaultMessage('退出')}</span>
                <Divider type="vertical" />
                <span onClick={this.helpHandle}>{intl.get('Help').defaultMessage('帮助')}</span>
                <Divider type="vertical" />
                <span onClick={this.modalHandle.bind(this, 'aboutModalVisible')}>{intl.get('About').defaultMessage('关于')}</span>
              </div>
              <div className="header-right-name">
                {intl.get('H_Welcome').defaultMessage('欢迎您')}，
                <Dropdown overlayClassName="main-top-person-menu" overlay={this.renderUserList()} trigger="click">
                  <span className="">
                    <IconFont type="icon-user" />
                    <span>{user.name}</span>
                  </span>
                </Dropdown>
              </div>
            </div>
          </Header>
        </Layout>
      </ConfigProvider>
    );
  }
}
export default App;
