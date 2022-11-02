import axios from "axios";

const Axios = axios.create({});

// 当实例创建时设置默认配置
Axios.defaults.baseURL = process.env.NODE_ENV === "development" ? '' : window.location.origin;
Axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'; // 屏蔽后退出接口点击不跳转到登录页
Axios.defaults.timeout = 30000;

// @RequestBody请求
export async function postRequestBody(options) {
  const { url, params, notLoading } = options;
  return axios({
    method: "post",
    url,
    loading: !notLoading,
    data: params,
    headers: {
      "Content-Type": "application/json",
      charset: "utf-8"
    }
  });
}

export async function request(method, url) {
  return axios({
    method,
    url
  });
}