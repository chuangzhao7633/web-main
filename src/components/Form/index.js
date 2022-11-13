/*
* 未实践使用
* */
import React from 'react';
import {Form, Input, Radio, Select} from "antd";

const { TextArea } = Input;
const { Option } = Select;

const renderFormItem = (options) => {
  const { type, dataList, labelProps, valueProps, placeholder, label, ...other } = options;
  switch (type) {
    case 'input':
      return <Input placeholder={placeholder} {...other} />;
    case 'Select':
      return (
        <Select placeholder={placeholder} {...other}>
          {
            dataList.map((_item, _key) => {
              const _itemIsObj = typeof _item === 'object';
              return <Option key={_key} value={ _itemIsObj ? _item[valueProps] : _item }>{ _itemIsObj ? _item[labelProps] : _item }</Option>;
            })
          }
        </Select>
      );
    case 'textarea':
      return <TextArea placeholder={placeholder} {...other} />;
    case 'radio':
      return <Radio {...other}>{label}</Radio>;
    default:
      return null;
  }
};

/*
* @param form 表单示例
* @param formConfig 表单配置项
* @param formItem 表单字段配置列表
*   formItem: {
*     componentConfig: { // 组件配置项
*       type: 'select',
*       dataList: [ // 渲染option 需要的list
*         {
*           "name": "aaaaa",
*           "value": "aaaaa"
*         }
*       ],
*       labelProps: "name" // 组件label 显示取值需要的字段
*       valueProps: "value" // 组件value 取值需要的字段
*       label: // 组件label 显示
*       ...
*     }
*     config: Form.Item 中需要的字段配置
*   }
* */
function Form({ formConfig, formItem }) {
  return (
    <Form { ...formConfig }>
      {formItem.map(_item => {
        const { render, componentConfig, ...config } = _item;
        return (
          <Form.Item { ...config }>
            {renderFormItem(componentConfig)}
          </Form.Item>
        );
      })}
    </Form>
  );
}

export default Form;