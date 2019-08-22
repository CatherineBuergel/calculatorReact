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

  addSpacingToCurrent(currentEquation) {
    for (let i = 0; i < currentEquation.length; i++) {
      let char = currentEquation[i]
      //if character in array is not a number, then add spacing on the sides
      if (!isNumber(char) && i !== 0) {
        currentEquation[i] = " " + char + " "
      }
    }
    return currentEquation.join('')
  };
  formatCurrentEquation() {

    if (this.state.currentEquation.length > 0) {
      // use spread operator to break refrence to avoid mutating the state directly
      let currentEquation = [...this.state.currentEquation]
      //return the copy with the proper spacing
      return this.addSpacingToCurrent(currentEquation)
    } else if (this.state.total && this.state.currentEquation.length === 0) {
      //otherwise, if have a new total, reset current equation with new total so we can start a new equation based off of what we had. 
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
