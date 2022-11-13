(function flexible (window, document) {
  const docEl = document.documentElement;

  function setRemUnit () {
    const baseSize = 14;
    // 当前页面宽度相对于 1920宽的缩放比例，可根据自己需要修改。
    const scale = docEl.clientWidth / 1920;
    // 设置页面根节点字体大小（“Math.min(scale, 2)” 指最高放大比例为2，可根据实际业务需求调整）
    docEl.style.fontSize = baseSize * Math.min(scale, 2) + 'px';
  }
  // adjust body font size
  function setBodyFontSize () {
    if (document.body) {
      // document.body.style.fontSize = (14 * dpr) + 'px';
      setRemUnit();
    }
    else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize);
    }
  }
  setBodyFontSize();

  setRemUnit();

  // reset rem unit on page resize
  window.addEventListener('resize', setRemUnit);
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      setRemUnit();
    }
  });

}(window, document));