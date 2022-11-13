import React  from 'react';
import intl from 'react-intl-universal';
import { Modal, Form, Input, message } from 'antd';
import { getUserInfo, saveUserInfo } from '../service/global';
import { useSetDataOnModal } from '../util/HookUtil';
import { filterEmptyObj } from '../util/Utils';

/**
 * 获取用户类型
 * */
const getUserType = (userType, user) => {
  switch (userType) {
    case 0:
      return intl.get('Super_Admin').defaultMessage('超级管理员');
    case 1:
      return intl.get("Admin").defaultMessage("管理员");
    case 2:
      return intl.get("User_Tenant_Owner").defaultMessage("租户所有者");
    case 3:
      return intl.get("Normal_User").defaultMessage("普通用户");
  }
};

function UserInfoModal({ visible, user, onCancel }) {
  const [form] = Form.useForm();

  useSetDataOnModal({
    visible,
    needFetchData: true,
    fetchFunc: () => {
      return getUserInfo({ id: user.id });
    },
    setDataFunc: form.setFieldsValue,
    clearDataFunc: form.resetFields
  });
  const handleOk = () => {
    form.submit();
  };

  const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 16 },
  };

  const onFinish = values => {
    const params = {id: user.id, name: user.name, tenantId: user.tenantId || '', ...values};
    saveUserInfo(filterEmptyObj(params), (res) => {
      if(res && res.data) {
        message.success(intl.get("Modify_UserInfo_Success").defaultMessage("修改用户信息成功!"));
        onCancel();
      } else {
        message.error(res.msg);
      }
    });
  };
  return (
    <Modal
      title={intl.get('User_Info').defaultMessage('用户信息')}
      visible={visible}
      onOk={handleOk}
      maskClosable={false}
      onCancel={onCancel}
    >
      <Form {...layout} form={form} name="userInfoForm" onFinish={onFinish} initialValues={{
        ...user, tenantName: '', phone: '', email: ''
      }} >
        <Form.Item
          shouldUpdate={(prevValues, curValues) => prevValues.userName !== curValues.userName}
          label={intl.get('User_Name').defaultMessage('用户名')}
        >
          <span>
            { user.name }
          </span>
        </Form.Item>
        <Form.Item
          label={intl.get('User_Type').defaultMessage('用户类型')}
        >
          <span>
            { getUserType(user.type) }
          </span>
        </Form.Item>
        <Form.Item
          label={intl.get('Tenant_Owner').defaultMessage('所属租户')}
        >
          <span>
            {user.tenantName}
          </span>
        </Form.Item>
        <Form.Item
          name="phone"
          label={intl.get('Mobile_Phone').defaultMessage('手机')}
          rules={[
            {
              pattern: /^1[0-9]{10}$/,
              message: intl.get('Mobile_Phone_Error_Msg').defaultMessage('请输入正确的电话格式')
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label={intl.get('Mail').defaultMessage('邮箱')}
          rules={[
            {
              pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              message: intl.get('Mail_Input_Error_Msg').defaultMessage('请输入正确的邮箱格式')
            }
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default UserInfoModal;