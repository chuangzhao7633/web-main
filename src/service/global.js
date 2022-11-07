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
    request('post', `${window.service.main}/appearance/getCurrentThemeCssFilePath`, { systemCode: window.__Conf__.product }),
    request('post', `${window.service.main}/appearance/queryAppearanceByType`, { type: 3, systemCode: window.__Conf__.product }) // 获取页签图标及title
  ], callback);
}

// 获取用户信息
export async function getUserInfo(callback) {
  const result = request('post', `${window.service.main}/oauth/token/getUser`);
  if (result && result.data) callback(result.data);
}

// 获取国际化语言
export async function appInitialRequest(language, callback) {
  const result = await request('get', `/static/language/language_${language}.json`);
  if (result && result.data) callback(result.data);
}

// 登录接口
export const loginRequest = async (param, callback) => {
  const result = await request('post', `${window.service.main}/login`, param);
  if (result) callback(result);
};

export const registerRequest = async (param, callback) => {
  const result = await request('post', `${window.service.main}/registeruser`, param);
  if (result && result.data) callback(result.data);
};

export const uniqueName = async param => {
  const result = await request('post', `${window.service.main}/uniqueName`, param);
  if (result && result.data) return result.data;
};