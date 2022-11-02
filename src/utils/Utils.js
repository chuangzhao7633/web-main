import intl from "react-intl-universal";

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