import { useEffect, useRef } from 'react';

/*
* 弹框中的表单update数据
* @param visible 弹框可见状态
* @param needFetchData 在弹框可见时，是否需要进行请求数据
* @param fetchFunc 请求弹框数据回调函数
* @param data 不需要请求表单数据时对表单进行设置的数据
* @param setDataFunc 将数据设置到弹框的回调函数
* @param clearDataFunc 清空数据的回调函数
* */
export function useSetDataOnModal({ visible, needFetchData, fetchFunc, data, setDataFunc, clearDataFunc }) {
  const preVisibleRef = useRef();
  useEffect(() => {
    preVisibleRef.current = visible;
  }, [visible]);
  const preVisible = preVisibleRef.current;
  useEffect(() => {
    // 设置form表单数据
    if (visible && visible !== preVisible) {
      if (needFetchData) {
        const func = async () => {
          const _data = await fetchFunc();
          if (_data) setDataFunc(_data);
        };
        func();
      }
      else if (data) setDataFunc(data);
    } else if (!visible && visible !== preVisible) {
      clearDataFunc ? clearDataFunc() : setDataFunc(); // 清空弹框数据
    }
  }, [visible])
}