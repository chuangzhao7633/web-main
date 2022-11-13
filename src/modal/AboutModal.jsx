import React, { useState } from 'react';
import { Modal, Button } from "antd";
import intl from "react-intl-universal";
import IconFont from '../components/Icon';
import { isAdmin } from "../util/Utils";
import { useSetDataOnModal } from "../util/HookUtil";
import { getLicenseInfo } from "../service/global";

const getLicList = (data) =>{
  data && data.length > 0 && data.map(_item => {
    if (_item.productExtends && _item.productExtends.length) {
      let obj = {};
      _item.productExtends && _item.productExtends.map(_extenditem => {
        obj = obj || {};
        obj = {
          ...obj,
          ..._extenditem
        }
      });
      let keys =  Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] === 'nodeNum') {
          _item.nodeNum = obj[keys[i]];
        }
      }
      return _item;
    }
  });
  return data || [];
};

function AboutModal({ visible, onCancel, user, productNames, version }) {
  const [customer, setCustomer] = useState("");
  const [warnInfo, setWarnInfo] = useState([]);
  const [productInfo, setProductInfo] = useState([]);
  useSetDataOnModal({
    visible,
    needFetchData: true,
    fetchFunc: () => {
      return getLicenseInfo({ productNames: productNames.join(',') });
    },
    setDataFunc: res => {
      const licList = res ? getLicList(res.licList) : [];
      setCustomer(licList[0] && licList[0].customer || '');
      setWarnInfo(res && res.warnInfo || []);
      setProductInfo(licList);
    }
  });

  const detailHandle = () => {
    window.open(window.service.licenseUrl,'_blank');
   };

  const showWarnInfo = warnInfo && warnInfo.length > 0;
  const footer = [];
  if (showWarnInfo) footer.push(<Button onClick={detailHandle}>{intl.get('About_License_Update').defaultMessage('更新license')}</Button>);
  if (isAdmin(user)) footer.push(<Button onClick={detailHandle}>{intl.get('View_Detail').defaultMessage('查看详情')}</Button>);
  return (
    <Modal
      title={intl.get('About').defaultMessage('关于')}
      visible={visible}
      width={600}
      maskClosable={false}
      wrapClassName="web-main-modal--usm main-web-about-modal"
      footer={footer && footer.length ? footer : null}
      onCancel={onCancel}
    >
      {customer ?
        <div className="license-div">
          <div className="about-div">
            <span className="label-span">{intl.get('About_License_User').defaultMessage('授权用户')}：</span>
            {customer}
          </div>
        </div>
        : null }
      {productInfo && productInfo.map((item,index) => {
        return <div className="license-div" key={index}>
          <div className="about-div">
            <span className="label-span">{intl.get('About_License_Product').defaultMessage('授权产品')}：</span>{item.productName}
          </div>
          <div className="about-div">
            <span className="label-span">{intl.get('About_License_Time').defaultMessage('授权时长')}：</span>
            {`${new Date(item.productStartDate).format('yyyy.MM.dd')}~${new Date(item.productEndDate).format('yyyy.MM.dd')}`}
          </div>
          {
            item.nodeNum ?
              <div className="about-div">
                <span className="label-span">{intl.get('About_License_NodeNum').defaultMessage('节点数')}：</span>{item.nodeNum}
              </div>
              : null
          }
        </div>
      })}
      <div className="license-div">
        <div className="about-div">
          <span className="label-span">{intl.get('CurrentVersion').defaultMessage('当前版本')}：</span>
          {version}
        </div>
      </div>
      {
        showWarnInfo ?
          <div className="license-div">
            <ul>
              {warnInfo && warnInfo.map((item) => {
                return (
                  <li className="item">
                    <IconFont type="icon-warning-circle" className="item-warning"/>
                    {item}
                  </li>
                );
              })}
            </ul>
          </div> :
          null
      }
    </Modal>
  );
}

export default AboutModal;