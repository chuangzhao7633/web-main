/* *****************************************************************************
 *  @文件名: watermark.js
 *  @修  改: 2018-05-26 11:32:39
 *  @格  式: 1.module无关的const定义在外部. 2.let const function 属性 reder/return 为顺序.
 *  @说  明: 网页水印
 ***************************************************************************** */
// import React from 'react'
// //#region 定义全局const变量
// //#endregion

// // svg 实现 watermark
// const watermark = ({
//     // 使用 ES6 的函数默认值方式设置参数的默认取值
//     // 具体参见 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Default_parameters
//     container = document.body,
//     width = '300px',
//     height = '200px',
//     textAlign = 'center',
//     textBaseline = 'middle',
//     font = "20px Microsoft Yahei",
//     fillStyle = 'rgba(184, 184, 184, 0.4)',
//     content = 'Open Components',
//     rotate = '24',
//     zIndex = 1000,
// } = {}) => {
//     const args = arguments[0];
//     const canvas = document.createElement('canvas');

//     canvas.setAttribute('width', width);
//     canvas.setAttribute('height', height);
//     const ctx = canvas.getContext("2d");

//     ctx.textAlign = textAlign;
//     ctx.textBaseline = textBaseline;
//     ctx.font = font;
//     ctx.fillStyle = fillStyle;
//     ctx.rotate(Math.PI / 180 * rotate);
//     ctx.fillText(content, parseFloat(width) / 2, parseFloat(height) / 2);

//     const base64Url = canvas.toDataURL();
//     const __wm = document.querySelector('.__wm');

//     const watermarkDiv = __wm || document.createElement("div");
//     const styleStr = `
//     position:absolute;
//     top:0;
//     left:0;
//     width:100%;
//     height:100%;
//     z-index:${zIndex};
//     pointer-events:none;
//     background-repeat:repeat;
//     background-image:url('${base64Url}')`;

//     watermarkDiv.setAttribute('style', styleStr);
//     watermarkDiv.classList.add('__wm');

//     if (!__wm) {
//         container.style.position = 'relative';
//         container.insertBefore(watermarkDiv, container.firstChild);
//     }

//     const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
//     if (MutationObserver) {
//         let mo = new MutationObserver(function () {
//             const __wm = document.querySelector('.__wm');
//             // 只在__wm元素变动才重新调用 __canvasWM
//             if ((__wm && __wm.getAttribute('style') !== styleStr) || !__wm) {
//                 // 避免一直触发
//                 mo.disconnect();
//                 mo = null;
//                 watermark(JSON.parse(JSON.stringify(args)));
//             }
//         });

//         mo.observe(container, {
//             attributes: true,
//             subtree: true,
//             childList: true,
//         })
//     }

// }

// export default watermark;

Object.defineProperty(exports, "__esModule", {
  value: true
});

// svg 实现 watermark
const watermark = () => {
  /* eslint-disable */
  const _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    _ref$container = _ref.container,
    container = _ref$container === undefined ? document.body : _ref$container,
    _ref$width = _ref.width,
    width = _ref$width === undefined ? '300px' : _ref$width,
    _ref$height = _ref.height,
    height = _ref$height === undefined ? '200px' : _ref$height,
    _ref$textAlign = _ref.textAlign,
    textAlign = _ref$textAlign === undefined ? 'left' : _ref$textAlign,
    _ref$textBaseline = _ref.textBaseline,
    textBaseline = _ref$textBaseline === undefined ? 'top' : _ref$textBaseline,
    _ref$font = _ref.font,
    font = _ref$font === undefined ? "20px Microsoft Yahei" : _ref$font,
    _ref$fillStyle = _ref.fillStyle,
    fillStyle = _ref$fillStyle === undefined ? 'rgba(184, 184, 184, 0.4)' : _ref$fillStyle,
    _ref$content = _ref.content,
    content = _ref$content === undefined ? 'ZHAOCHUANG' : _ref$content,
    _ref$rotate = _ref.rotate,
    rotate = _ref$rotate === undefined ? '15' : _ref$rotate,
    _ref$zIndex = _ref.zIndex,
    zIndex = _ref$zIndex === undefined ? 1000 : _ref$zIndex,
    containerleft = _ref.containerleft || 0,
    containerTop = _ref.containerTop || 0;

  const args = arguments[0];
  const canvas = document.createElement('canvas');

  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
  const ctx = canvas.getContext("2d");

  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.font = font;
  ctx.fillStyle = fillStyle;
  ctx.rotate(Math.PI / 180 * rotate);
  const _contentArr = content.split('\n');
  _contentArr.map((_item, _index) => {
    ctx.fillText(_item, 60, 20 + _index * 35);
  });
  const base64Url = canvas.toDataURL();
  const __wm = document.querySelector('.__wm');

  const watermarkDiv = __wm || document.createElement("div");
  const styleStr = 'position:absolute; top:' + containerTop + '; left: ' + containerleft + '; width:100%; height:100%; z-index:' + zIndex + '; pointer-events:none; background-repeat:repeat; background-image:url(\'' + base64Url + '\')';
  watermarkDiv.setAttribute('style', styleStr);
  watermarkDiv.classList.add('__wm');

  if (!__wm) {
    container.style.position = 'relative';
    container.insertBefore(watermarkDiv, container.firstChild);
  }

  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  if (MutationObserver) {
    let mo = new MutationObserver(() => {
      const __wm = document.querySelector('.__wm');
      // 只在__wm元素变动才重新调用 __canvasWM
      if (__wm && __wm.getAttribute('style') !== styleStr || !__wm) {
        // 避免一直触发
        mo.disconnect();
        mo = null;
        watermark(JSON.parse(JSON.stringify(args)));
      }
    });

    mo.observe(container, {
      attributes: true,
      subtree: true,
      childList: true
    });
  }
};

exports.default = watermark;