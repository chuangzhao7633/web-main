import React, { Fragment } from 'react';
import intl from 'react-intl-universal';

import { Tooltip, Popover, Dropdown, Menu } from 'antd';

import Icon from '@component/Icon';
import { MAIN_HELP_TIP } from '@util/ConstUtil';
import './index.less';

class HelpTip extends React.Component {
	constructor(props) {
		super(props)
	}

	getTitle = (type, _code, aLabel) => {
	  switch (type) {
      case '2': //鼠标滑过显示Tip，点击更多跳转
        return (
          <Fragment>
            <pre className={`${productName}-show-info-pre`}>{window[MAIN_HELP_TIP][_code]['content']}</pre>
            {window[MAIN_HELP_TIP][_code]['skip'] === 'Y' && <a href="javascript:void(0);" className={`web-main-a`} onClick={(evt) => {window.open(window[MAIN_HELP_TIP][_code]['url'])}}>{aLabel}</a>}
          </Fragment>
        );
      case '3':
        return (
          <p>
            {window[[MAIN_HELP_TIP]][_code]['content']}
            {window[[MAIN_HELP_TIP]][_code]['skip'] === 'Y' && <a href="javascript:void(0);" className={`web-main-a`} onClick={(evt) => {window.open(window[MAIN_HELP_TIP][_code]['url'])}}>
              {aLabel}
            </a>}
          </p>
        );
      case '4':
        return (
          <p>
            {window[MAIN_HELP_TIP][_code]['content']}
            {window[MAIN_HELP_TIP][_code]['skip'] === 'Y' && <a href="javascript:void(0);" className={`web-main-a`} onClick={(evt) => {window.open(this.props.url ? this.props.url : window[MAIN_HELP_TIP][_code]['url'])}}>
              {intl.get('Click_ToDownload_Template').defaultMessage('点击下载模板')}
            </a>}
          </p>
        );
      case '5':
        return (
          <Fragment>
            {window[MAIN_HELP_TIP][_code]['content'] ? <p>{window[MAIN_HELP_TIP][_code]['content']}</p> : ''}
            {window[MAIN_HELP_TIP][_code]['skip'] === 'Y' && <a href="javascript:void(0);" className={`web-main-a`} onClick={(evt) => {window.open(window[MAIN_HELP_TIP][_code]['url'])}}>{aLabel}</a>}
          </Fragment>
        );
      case '6':
        return (
          <Fragment>
            <p dangerouslySetInnerHTML={{__html: window[MAIN_HELP_TIP][_code]['content']}}></p>
            {window[MAIN_HELP_TIP][_code]['skip'] === 'Y' && <a href="javascript:void(0);" className={`web-main-a`} onClick={(evt) => {window.open(window[MAIN_HELP_TIP][_code]['url'])}}>{aLabel}</a>}
          </Fragment>
        );
      case '7': //鼠标滑过显示Tip，点击更多跳转
        return (
          <pre className={`${productName}-show-info-pre`}>{window[MAIN_HELP_TIP][_code]['content']}</pre>
        );
      case '8': //鼠标滑过显示Tip，点击更多跳转
        return (
          <p>{window[MAIN_HELP_TIP][_code]['content']}</p>
        );
      case '9':
        return (
          <Fragment>
            <p dangerouslySetInnerHTML={{__html: window[MAIN_HELP_TIP][_code]['content']}}></p>
          <a href="javascript:void(0);" onClick={(evt) => {window.open(this.props.url)}}>
            {intl.get('Click_ToDownload_Template').defaultMessage('点击下载模板')}
          </a>
          {window[MAIN_HELP_TIP][_code]['skip'] === 'Y' && <a href="javascript:void(0);" className={`web-main-a`} style={{marginLeft: '10px'}} onClick={(evt) => {window.open(window[MAIN_HELP_TIP][_code]['url'])}}>{aLabel}</a>}
          </Fragment>
        );
    }
  };

	renderTip() {
	  console.log(this.props);
		let _view = '';
		let _code = this.props.code;
		let _direction = this.props.direction ? this.props.direction : 'right';
		let dropdownMenuClass = this.props.dropdownMenuClass ? this.props.dropdownMenuClass : '';
		let iconStyle = this.props.iconStyle ? this.props.iconStyle : {};
		let iconClass = this.props.iconClass ? this.props.iconClass : '';
		let aLabel = this.props.aLabel ? this.props.aLabel : intl.get('Understand_More').defaultMessage('了解更多');
		switch (this.props.type) {
			case '1': //点击Icon直接跳转
				_view = <div className="help-tip-container">
							<Icon type="icon-question-circle"
                    className="help-icon" title={window[MAIN_HELP_TIP][_code]['content']} style={iconStyle}
										onClick={(evt) => window[MAIN_HELP_TIP][_code]['skip'] === 'Y' && window.open(window[MAIN_HELP_TIP][_code]['url'], '_blank')} />
						</div>
				break;
			case '2': //鼠标滑过显示Tip，点击更多跳转
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
				_view = <div className="help-tip-container">
          <Tooltip
            placement={_direction}
            className={dropdownMenuClass}
            title={this.getTitle(this.props.type, _code, aLabel)}
          >
            <span><Icon type="icon-question-circle" className={iconClass} /></span>
          </Tooltip>
					</div>;
				break;
			default:
				_view = '';
		}
		return _view;
	}

	render() {
		let view = window[MAIN_HELP_TIP] && window[MAIN_HELP_TIP][this.props.code] ? this.renderTip() : '';
		return view ? view : null;
	}
}

export default HelpTip