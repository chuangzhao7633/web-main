import React, {useEffect} from 'react';
import intl from "react-intl-universal";
import { Modal, Form, Input, message } from 'antd';
import FormItemTip from '../components/FormItemTip';
// import IconFont from '../components/Icon';
import { checkPwd, savePwd } from '../service/global';

// 密码验证规则
const pwd = /^((?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{8,16}$)|((?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$)|((?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$)|((?=.*[a-zA-Z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$)$/;

function ChangePwdModal({ visible, user, onCancel }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible]);

  const handleOk = () => {
    form.submit();
  };

  // 校验旧密码是否正确
  const validateOldPwd = async (rule, value) => {
    if (value) {
      const _res = await checkPwd({
        userName: user.name,
        userPassword: value
      });
      if (_res) {
        return Promise.resolve();
      }
      return Promise.reject(intl.get('Old_Password_Err').defaultMessage('旧密码不正确'));
    }
    return Promise.resolve();
  };

  // 校验密码是否符合特定规则
  const checkPwdReg = async (rule, value) => {
    if (!pwd.test(value)) return Promise.reject(intl.get('Pwd_Reg_Err').defaultMessage('必须包含大小写字母、数字、特殊字符中的两种'));
    else if (value.split('').reverse().join('') === user.name) return Promise.reject(intl.get('Pwd_Reverse_Err').defaultMessage('不能与用户名倒写一致'));
    else return Promise.resolve();
  };

  // 修改密码保存
  const saveNewPwd = (values) => {
    savePwd({
      userId: user.id,
      userName: user.name,
      newPassword: values.newPassword,
      oldPassword: values.oldPassword
    }, () => {
      message.success(intl.get('Modify_Pwd_Success').defaultMessage('修改密码成功!'));
      onCancel();
    })
  };

  const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 16 },
  };
  return (
    <Modal
      title={intl.get('Modify_Pwd').defaultMessage('修改密码')}
      visible={visible}
      maskClosable={false}
      onOk={handleOk}
      onCancel={onCancel}>

      <Form {...layout} form={form} onFinish={saveNewPwd}>
        <Form.Item
          name="oldPassword"
          validateFirst={true}
          label={intl.get('Old_Password').defaultMessage('旧密码')}
          validateTrigger="onBlur"
          rules={[
            {
              required: true,
              message: intl.get('Label_NotNull', { label: intl.get('Old_Password').defaultMessage('旧密码') }).defaultMessage('旧密码不能为空')
            },
           {/* {
              validator: validateOldPwd
            }*/}
          ]}
        >
          <Input type="password" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          validateFirst={true}
          validateTrigger="onBlur"
          label={intl.get('New_Password').defaultMessage('新密码')}
          // help={}
          rules={[
            {
              required: true,
              message: intl.get('Label_NotNull', { label: intl.get('New_Password').defaultMessage('新密码') }).defaultMessage('新密码不能为空')
            },
            {
              validator: checkPwdReg
            }
          ]}
        >
          <div>
            <Input type="password" />
            <FormItemTip title={intl.get('Pwd_Rule_Tip').defaultMessage('必须包含大小写字母、数字、特殊字符中的两种；长度为8-16个字符；不能与用户名或用户名倒写重名')} />
          </div>
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          validateFirst={true}
          validateTrigger="onBlur"
          label={intl.get('Confirm_Password').defaultMessage('确认密码')}
          dependencies={['newPassword']}
          rules={[
            {
              required: true,
              message: intl.get('Label_NotNull', { label: intl.get('Confirm_Password').defaultMessage('确认密码') }).defaultMessage('确认密码不能为空')
            },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(intl.get('Confirm_Pwd_Match_Err').defaultMessage('两次输入密码不一致'));
              },
            })
          ]}
        >
          <Input type="password" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ChangePwdModal;