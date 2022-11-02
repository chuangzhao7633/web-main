import { request } from "@util/Request";

// 获取国际化语言
export async function appInitialRequest(language, callback) {
  const staticPrefix = process.env.NODE_ENV === "development" ? '' : '/portal';

  const result = request('get', `${staticPrefix}/static/language/language_${language}.json`);
  result.then(response => callback(response.data.data));
}