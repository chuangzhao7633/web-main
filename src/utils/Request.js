import axios from "axios";
import intl from "react-intl-universal";

const Axios = axios.create();

const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]';
const isArray = arr => Array.isArray(arr);

let requestCount = 0;

// 当实例创建时设置默认配置
Axios.defaults.baseURL = process.env.NODE_ENV === "development" ? '' : window.location.origin;
/* Axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'; */ // 屏蔽后退出接口点击不跳转到登录页
Axios.defaults.timeout = 30000;

// 请求前拦截
Axios.interceptors.request.use(
  config => {
    requestCount++;
    return config;
  },
  err => {
    requestCount--;
    return Promise.reject(err);
  }
);

// 返回后拦截
Axios.interceptors.response.use(
  response => {
    requestCount--;
    console.log(requestCount);
    if (response.data && ["999999", "401", 401].indexOf(response.data.code) !== -1) {
      const msg = response.data.msg || intl.get('Request_Error_401').defaultMessage('访问被拒绝');
      console.log(msg);
      debugger;
      if (response.data && response.data.data) {
        window.location = response.data.data;
      } else {
        window.location = 'http://localhost:3001/login';
      }
      return null;
    } else if (response.data.code === "000000" || response.data.code === '000001') {
      return response.data;
    } else {
      const msg = response.data.msg;
      console.log(msg);
      return null;
    }
  },
  err => {
    requestCount--;
    if (err.response) {
      if (err.response.status === 504 || err.response.status === 404) {
        console.log(intl.get('Request_Error_404').defaultMessage('接口不存在'));
      } else if (err.response.status === 401) {
        console.log(intl.get('Request_Error_401').defaultMessage('访问被拒绝'));
      } else if (err.response.status === 500) {
        console.log(intl.get('Request_Error_500').defaultMessage('服务器连接失败，请稍后重试'));
      }
    } else if (err.code === 'ECONNABORTED') {
      console.log(intl.get('Request_Timeout').defaultMessage('请求超时30s，请检查网络/服务器'));
    }
    return Promise.reject(err);
  }
);

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