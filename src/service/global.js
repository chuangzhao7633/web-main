import { request, multipleRequest } from "@util/Request";

// 获取主项目的配置文件
export async function getConfig(callback) {
  multipleRequest([
    request('get', `/static/main/service.json`), 
    request('get', process.env.NODE_ENV === "development" ? '/static/main/config_dev.json' : '/static/main/config.json')
  ], callback);
}

// 获取初始化配置
export async function getInitSetting(callback) {
  multipleRequest([
    request('post', `${window.service.main}/oauth/token/getUser`),
    request('post', `${window.service.main}/appearance/getCurrentThemeCssFilePath`, { systemCode: window.__Conf__.product }),
    request('post', `${window.service.main}/appearance/queryAppearanceByType`, { type: 3, systemCode: window.__Conf__.product }) // 获取页签图标及title
  ], callback);
}

// 获取国际化语言，当前一级目录菜单
export async function appInitialRequest(language, user, callback) {
  multipleRequest([
    request('get', `/static/child/language/language_${language}.json`),
    request('post', `${window.service.main}/multiMenu/manage/mapping/language/query`, {
      languageCode: language ? language.split('_')[0] : 'zh',
      subSystemCode: 'main',
      systemCode: window.__Conf__.product
    }),
    request('post', `${window.service.main}/multiMenu/view/top`, { systemCode: window.__Conf__.product }), // `${window.service.aegis}/auth/viewMainpageMenuInfo`)
    request('post', `${window.service.main}/appearance/queryAppearanceByType`, { type: 1, systemCode: window.__Conf__.product }), // 获取logo
    request('post', `${window.service.main}/appearance/queryAppearanceByType`, { type: 4, systemCode: window.__Conf__.product }), // 获取水印
    request('post', `${window.service.main}/clusterCenterApi/getClusterCenterByQuery`), // 获取集群信息
    request('post', `${window.service.main}/multiMenu/view/allRoute`, { systemCode: window.__Conf__.product })
  ], callback);     
}

// 获取当前的主题,并替换
export async function getProject(callback) {
  const result = await request('post', `${window.service.main}/project/list`);
  if (result && result.data) callback(result.data);
}

// 获取当前一级菜单下的二级菜单配置项及权限
export async function getAuthAndSubMenu(parentMenuKey, parentAuthCode, controlFlag, dbType, callback) {
  multipleRequest([
    // request('get', `/static/child/${window.__Conf__.product}/menu/${parentMenuKey}_menu.json`), // 获取二级菜单
    request('post', `${window.service.main}/multiMenu/view/children`, {
      parentCode: parentMenuKey,
      systemCode: window.__Conf__.product,
      controlFlag,
      dbType
    }), // 获取二级菜单
    request('get', `/static/child/auth/auth.json`), // 获取前端权限code
    request('post', `${window.service.main}/multiMenu/manage/mapping/authCode/query`, {
      subSystemCode: 'main',
      systemCode: window.__Conf__.product
    }), // 获取后端权限code, 以后端为主，如果后端权限code不全时，使用前端配置文件中的code
    // request('post', `${window.service.portal}/auth/getProjectFunctionAuth`, { functionCode: parentAuthCode, systemCode: window.__Conf__.product }), // 获取无权限的code
    request('get', `/static/child/auth/helpAuth.json`), // 获取提示信息的一些code
    request('post', `${window.service.main}/multiMenu/manage/mapping/helpCode/query`, {
      subSystemCode: 'main',
      systemCode: window.__Conf__.product
    }),
    request('post', `${window.service.main}/help/getHelpMsgList`, { code: parentAuthCode, systemCode: window.__Conf__.product })
  ], callback);
}

// 退出接口
export async function logout(param) {
  request('post', `${window.service.portal}/portal/portal-logout`, param);
}