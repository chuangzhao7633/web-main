import reactCookie  from 'react-cookies';
import intl from "react-intl-universal";
import { pathToRegexp } from 'path-to-regexp';
import { USER_ADMIN, USER_SUPERADMIN, USER_NORMAL, USER_OWNER, THEME_TYPE_LIGHT, THEME_TYPE_DARK} from "./ConstUtil";

/*
* 从cookie中获取当前国际化语言 将zh-cn转成zh_CN
* return string 转换后的国际化语言 e.g zh_CN
* */
export function getLanguageFromCookie() {
  let _lang = reactCookie.load('cas_language') || reactCookie.load('language') || 'zh_CN';
  const _langArr = _lang.split('-');
  if (_langArr.length > 1) _lang = `${_langArr[0]}_${_langArr[1].toUpperCase()}`;
  return _lang;
}
/*
* 初始化国际化语言 使用插件react-intl-universal
* @param Object对象 oldLanguageData 已设置国际化对象
* @param Object对象 newLanguageData 新增设置国际化对象
* */
export function loadLocales(oldLanguageData, newLanguageData) {
  let currentLocale = getLanguageFromCookie();
  const locales = {
    [currentLocale]: oldLanguageData ? { ...oldLanguageData, ...newLanguageData } : { ...newLanguageData }
  };
  intl.init({
    currentLocale,
    locales
  });
}
/*
* 更换主题颜色文件
* */
export function resetStyle(data) {
  let themeType = THEME_TYPE_LIGHT;
  if (data) {
    let _cssUrl;
    // type : 0 自定义， 2 内置主题
    if(data.type === 2) {
      if (data.currentThemeCssFilePath) {
        _cssUrl = `${window.location.origin}/${data.currentThemeCssFilePath}`;
      } else {
        _cssUrl = `${window.location.origin}/static/common/style/css_black.css`;
        themeType = THEME_TYPE_DARK;
      }
      const _commonCssUrl = `${window.location.origin}/static/common/style/css_common.css`;
      const commonLinkNode = document.getElementsByTagName('link')[0];
      const linkNode = document.getElementsByTagName('link')[1];
      if (commonLinkNode.getAttribute('href') !== _commonCssUrl) commonLinkNode.setAttribute('href', _commonCssUrl);
      if (linkNode.getAttribute('href') !== _cssUrl) linkNode.setAttribute('href', _cssUrl);
    } else if (data.type === 0) {
      _cssUrl = `${window.service.portal}/${data.currentThemeCssFilePath}`;
      const _cssUrl1 = `${window.location.origin}/static/common/style/css_default.css`;
      const linkNode = document.getElementsByTagName('link')[0];
      const linkNode1 = document.getElementsByTagName('link')[1];
      if (linkNode.getAttribute('href') !== _cssUrl) linkNode.setAttribute('href', _cssUrl);
      if (linkNode1.getAttribute('href') !== _cssUrl1) linkNode1.setAttribute('href', _cssUrl1);
    }
    // _cssUrl = data.type === 2 ? `${window.location.origin}/${data.currentThemeCssFilePath}` : `${window.service.portal}/${data.currentThemeCssFilePath}`;
  }
  return themeType;
}

/*
* 将一级导航的key和desc转成前端国际化内容
* */
export function changeMenuToLocale(menus, languageMap) {
  const _map = languageMap ? { ...languageMap } : {};
  menus.map(_item => {
    _map[_item.code] = _item.name;
    if (_item.children && _item.children.length) {
      changeMenuToLocale(_item.children, _map);
    }
  });
  return _map;
}

export function isAdmin(user) {
  return [USER_SUPERADMIN, USER_ADMIN].indexOf(user.type.toString()) !== -1 ? true : false;
}

export function isTenantOwner(user) {
  return [USER_OWNER].indexOf(user.type.toString()) !== -1 ? true : false;
}

export function isNormalUser(user) {
  return [USER_NORMAL].indexOf(user.type.toString()) !== -1 ? true : false;
}

/**
 * 判断是否为空值/空对象
 */
export function isEmpty(value) {
  let a = false;
  if (Object.prototype.toString.call(value) == "[object Array]") {
    a = value.length == 0 ? true : false;
  } else if (Object.prototype.toString.call(value) == "[object Object]") {
    a = Object.keys(value).length == 0 ? true : false;
  } else if (Object.prototype.toString.call(value) == "[object String]") {
    a = value.replace('/s', "").length == 0 ? true : false;
  } else if (Object.prototype.toString.call(value) == "[object Number]") {
    a = isNaN(value) ? true : false;
  } else if (Object.prototype.toString.call(value) == "[object Null]") {
    a = true;
  } else if (Object.prototype.toString.call(value) == "[object Undefined]") {
    a = true;
  } else if (Object.prototype.toString.call(value) == "[object Boolean]") {
    a = value ? false : true;
  }
  return a;
}

/**
 * 过滤掉对象空值
 * @param {*} data 
 */
export function filterEmptyObj(trans) {
  let pam = {}
  for(let i in trans){
    if(!isEmpty(trans[i])){
      pam[i] = trans[i]
    }
  }
  return pam;
}

export const pathToMathRouter = (url) => {
  const keys = [];
  const result = pathToRegexp(url, keys);
  console.log(result, keys);
  return {
    result,
    keys
  };
};

/**
 * 查找符合条件的树单项
 * @param tree Array
 * @key treeItem对应的key
 * @value 条件值 
 */
export function filterTreeItem(tree, key, value) {
  // if (!tree || !tree.length || !key || !value) return;
  for (let i = 0; i < tree.length; i++) {
    if (tree[i][key] === value) {
      return tree[i];
    } else if (tree[i].children) {
      const _item = filterTreeItem(tree[i].children, key, value);
      if (_item) return _item;
    } 
  }
}

/**
 * 生成UUID
 * @param len 指定生成项的长度
 * @param radix 范围  比如设置 2 , 就只会生成 0101010之类的
 * @returns {string}
 */
export function generatorUUID(len, radix) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = [], i;
  radix = radix || chars.length;
  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  } else {
    var r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('');
}

