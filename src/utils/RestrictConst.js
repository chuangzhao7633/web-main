export default {
  // 只能输入字母、数字、下划线，且必须以字母开头；
  USERNAME: /^[a-zA-Z][a-zA-Z0-9\_]*$/i,
  // 密码长度至少8位，且须包含英文、数字、英文符号（不包含空格） @$!%*#?&
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/])[A-Za-z\d~!@#$%^&*()_+`\-={}:";'<>?,.\/]{8,}$/,

  // 字母
  CHAR: /[a-zA-Z]/,

  // 数字
  NUM: /[0-9]/,

  // 英文符号
  SYMBOL: /[~!@#$%^&*()_+`\-={}:";'<>?,.\/]/,

  // 数字 字母 下划线 中划线 .   大小128个字符
  NUM_STRING_UNDERLINE_POINT_128: /^[0-9a-zA-Z\_\.\-]{0,128}$/i,
  // 端口 1-8位数字
  PORT_8: /^[1-9][0-9]{0,7}$/,
  // 非汉字
  NOT_CHARS: /^[^\u4E00-\u9FA5]+$/,
  // 数字 字母 下划线
  NUM_STRING_UNDERLINE: /^[a-zA-Z0-9_]+$/i,

  NUM_Z: /^[1-9]\d*$/,
  
  // 1-40之间的数字
  NUM_RANGE: /^([1-9]||[1-3][0-9]||40)$/,
  // 只能输入中文、字母、数字、下划线
  NUM_STRING_CHARS_UNDERLINE: /^[0-9a-zA-Z\u4E00-\u9FA5\_]+$/i,
  // 邮件格式
  MAIL: /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/,
  // 分钟
  NUM_MINI: /^([0-5]?\d)$/,
  // 小时
  NUM_HOUR: /^([01]?\d|2[0-3])$/,

  PASSWORD1: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{8,10}$/,

  // 邮箱
  EMAIL: /^[a-z0-9A-Z]+[-|a-z0-9A-Z._]+@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\.)+[a-z]{2,}$/
};
