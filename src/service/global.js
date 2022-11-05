import { request, multipleRequest } from "@util/Request";

// 获取主项目的配置文件
export async function getConfig(callback) {
  multipleRequest([
    request('get', `/static/main/service.json`), 
    request('get', process.env.NODE_ENV === "development" ? '/static/main/config_dev.json' : '/static/main/config.json')
  ], callback);
}

// 获取国际化语言
export async function appInitialRequest(language, callback) {
  const staticPrefix = process.env.NODE_ENV === "development" ? '' : '';

  const result = await request('get', `${staticPrefix}/static/language/language_${language}.json`);
  if (result && result.data) callback(result.data);
}

// 登录接口
export const loginRequest = async (param, callback) => {
  const result = await request('post', `${window.service.base}/login`, param);
  if (result && result.data) callback(result.data);
};

export const registerRequest = async (param, callback) => {
  const result = await request('post', `${window.service.base}/registeruser`, param);
  if (result && result.data) callback(result.data);
};

export const uniqueName = async param => {
  const result = await request('post', `${window.service.base}/uniqueName`, param);
  if (result && result.data) return result.data;
};