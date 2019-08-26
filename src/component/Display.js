import React from "react";
import PropTypes from "prop-types";
import isNumber from "../logic/isNumber";

import "./Display.css";

export default class Display extends React.Component {
  static propTypes = {
    currentEquationString: PropTypes.string,
    currentTotal: PropTypes.string,
    currentEquationArray: PropTypes.array
  };

  shouldDisplayTotal() {
    // debugger
    let lastIndex = this.props.currentEquationArray.length - 1
    let lastChar = this.props.currentEquationArray[lastIndex]
    if (!isNumber(lastChar) && lastChar !== '%') {
      console.log(lastChar)
      return " "
    } else {
      return this.props.currentTotal
    }
  }

  render() {
    return (
      <div className="component-display">
        <div>{this.props.currentEquationString}</div>
        <small>{this.shouldDisplayTotal()}</small>
      </div>
    );
  }
}
