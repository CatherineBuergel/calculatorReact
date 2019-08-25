import Big from "big.js";
import operate from "./operate";
import isNumber from "./isNumber";

export default function calculate(state, buttonName) {
  if (isNumber(buttonName)) {
    return this.handleNumber(state, buttonName)
  } else {
    return this.handleCommand(state, buttonName)
  }
}

function handleNumber(state, buttonName) {

}

function handleCommand(state, buttonName) {

}