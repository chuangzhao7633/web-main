import axios from "axios";

const Axios = axios.create();

const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]';
const isArray = arr => Array.isArray(arr);

// 当实例创建时设置默认配置
Axios.defaults.baseURL = process.env.NODE_ENV === "development" ? '' : window.location.origin;
/* Axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'; */ // 屏蔽后退出接口点击不跳转到登录页
Axios.defaults.timeout = 30000;

// @Request Param请求
export async function request(method, _url, params) {
  const url = `${_url}`;
  if (method.toLowerCase() === 'get') {
    return getQuest(method, url, params);
  } else {
    return postQuest(method, url, params);
  }
}

async function getQuest(method, url, param) {
  let _url = '';
  if (param) {
    const _keys = Object.keys(param);
    if (_keys) {
      _url += '?';
      _keys.map(_key => _url += `${_url.lastIndexOf('?') === _url.length - 1 ? '' : '&'}${_key}=${param[_key]}`);
      url = `${url}${_url}`;
    }
  }
  return Axios({
    method,
    url
  });
}

async function postQuest(method, url, params) {
  return Axios({
    method,
    url,
    data: params,
    transformRequest: [
      data => {
        let sendData = { ...data };
        sendData = Object.keys(sendData).map(key => {
          let value = sendData[key];
          if (isArray(value) || isObject(value)) {
            value = JSON.stringify(value);
          }
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }).join('&');
        return sendData;
      }
    ],
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    }
  });
}

export async function multipleRequest(requestArray, callback) {
  axios.all(requestArray).then(axios.spread(callback));
}