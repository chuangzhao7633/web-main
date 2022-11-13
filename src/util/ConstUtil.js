/*
* SUPERADMIN: "0",// 超级管理员
* ADMIN: "1",// 管理员
* OWNER: "2",// 租户所有者
* USER: "3" //普通用户
* 用户类型(0超级管理员|1管理员|2租户管理员|3普通用户)
* */
export const USER_SUPERADMIN = "0";
export const USER_ADMIN = "1";
export const USER_OWNER = "2";
export const USER_NORMAL = "3";

// localStorage Const
export const HISTORY_TOP_MENU = 'historyTopMenu'; // 一级导航历史选择存储key
export const HISTORY_SUB_MENU = 'historySubMenu'; // 二级导航历史选择存储key
export const HISTORY_PROJECT_CODE = 'historyProjectCode'; // 项目选择存储key
export const HISTORY_HAS_PARAM_MENU = 'historyHasParamMenu'; // 有传参的路由存储key

// 数据源类型映射字段
export const DATASOURCE_TYPE_MAP = {
  'mysql': 'mysql',
  'hive': 'hive'
};

// 内置深色、浅色主题变量
export const THEME_TYPE_LIGHT = 1; // 浅色主题
export const THEME_TYPE_DARK = 2; // 深色主题

// 帮助列表
export const MAIN_HELP_TIP = '__MAIN_HELP_TIP';

// 菜单展示方式  1:新页签; 2:嵌入页面; 3:内部路由
export const MENU_METHOD_ROUTER = 3; // 内部路由
export const MENU_METHOD_NEWPAGE = 1; // 新页签
export const MENU_METHOD_IFRAME = 2; // iframe嵌入

// 项目类型
export const PROJECT_DBTYPE_COMMON = 0;
export const PROJECT_DBTYPE_MYSQL = 1;
export const PROJECT_DBTYPE_HIVE = 2;

export const PROJECT_DBTYPE_DIC = {
  "mysql": PROJECT_DBTYPE_MYSQL,
  "hive": PROJECT_DBTYPE_HIVE
};