import React from "react";
import Display from "./Display";
import ButtonPanel from "./ButtonPanel";
import calculate from "../logic/calculate";
import isNumber from "../logic/isNumber";
import "./App.css";

export default class App extends React.Component {
  state = {
    total: null,
    next: null,
    operation: null,
    currentEquation: [],
    currentTotal: null,
    totalHistory: {},
  };

  handleClick = buttonName => {

    this.setState(calculate(this.state, buttonName));

  };

  //if character in array is not a number, then add spacing on the sides
  addSpacingToCurrent(currentEquation) {
    for (let i = 0; i < currentEquation.length; i++) {
      let char = currentEquation[i]
      if (!isNumber(char) && i !== 0 && char !== '.') {
        currentEquation[i] = " " + char + " "
      }
    }
    return currentEquation.join('')
  };
  //if more than one item is in currentEquation, break reference and format it; else assign current total as firt item in currentEquation
  formatCurrentEquation() {
    if (this.state.currentEquation.length > 0) {
      let currentEquation = [...this.state.currentEquation]
      return this.addSpacingToCurrent(currentEquation)
    } else if (this.state.total && this.state.currentEquation.length === 0) {
      this.setState({ currentEquation: [this.state.total] })
    }
  };


  render() {
    return (
      <div className="component-app">
        <Display currentEquation={this.formatCurrentEquation() || "0"} currentTotal={this.state.currentTotal || ""} />
        <ButtonPanel clickHandler={this.handleClick} />
      </div>
    );
  }

}
