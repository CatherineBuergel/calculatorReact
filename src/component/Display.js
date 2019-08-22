import React from "react";
import PropTypes from "prop-types";
import isNumber from "../logic/isNumber";

import "./Display.css";

export default class Display extends React.Component {
  static propTypes = {
    currentEquation: PropTypes.string,
    currentTotal: PropTypes.string
  };

  shouldDisplayTotal() {
    // debugger
    let lastIndex = this.props.currentEquation.length - 1
    let lastChar = this.props.currentEquation[lastIndex]
    if (!isNumber(lastChar)) {
      return " "
    } else {
      return this.props.currentTotal
    }
  }

  render() {
    return (
      <div className="component-display">
        <div>{this.props.currentEquation}</div>
        <small>{this.shouldDisplayTotal()}</small>
      </div>
    );
  }
}
