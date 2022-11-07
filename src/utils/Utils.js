import intl from "react-intl-universal";
import { THEME_TYPE_LIGHT, THEME_TYPE_DARK } from "./ConstUtil";

/*
* 初始化国际化语言 使用插件react-intl-universal
* @param Object对象 oldLanguageData 已设置国际化对象
* @param Object对象 newLanguageData 新增设置国际化对象
* */
export function loadLocales(oldLanguageData, newLanguageData = {}) {
  const currentLocale = 'en_US';
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
    if (data.type === 2) {
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