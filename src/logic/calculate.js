import Big from "big.js";

import operate from "./operate";
import isNumber from "./isNumber";

/**
 * Given a button name and a calculator data object, return an updated
 * calculator data object.
 *
 * Calculator data object contains:
 *   total:String      the running total
 *   next:String       the next number to be operated on with the total
 *   operation:String  +, -, etc.
 */
function trackHistory(obj, buttonName) {
  let out = {
    next: buttonName,
    currentTotal: operate(obj.total, buttonName, obj.operation),
    totalHistory: obj.totalHistory

  }
  let lastIndex = obj.currentEquation.length - 1
  out.totalHistory[lastIndex] = out.currentTotal
  return out

}
export default function calculate(obj, buttonName) {
  if (buttonName !== "Del") {
    obj.currentEquation.push(buttonName)
    obj.currentEquation = [...obj.currentEquation]
  }
  if (buttonName === "AC") {
    return {
      total: null,
      next: null,
      operation: null,
      currentEquation: [],
      currentTotal: null
    };
  }
  if (buttonName === "Del") {
    obj.currentEquation.pop()
    if (obj.currentEquation.length === 0) {
      obj.currentEquation.push(0)
    }
    let length = obj.currentEquation.length
    let lastItem = obj.currentEquation[length - 1]
    return {
      currentEquation: obj.currentEquation,
      currentTotal: length === 1 ? 0 : obj.totalHistory[length - 1],
      totalHistory: length === 1 ? {} : obj.totalHistory,
      total: length === 1 ? 1 : obj.total,
      next: length === 1 ? null : obj.next,
      operation: !isNumber(lastItem) ? lastItem : obj.operation
    };
  }

  if (isNumber(buttonName)) {
    if (buttonName === "0" && obj.next === "0") {
      return {};
    }
    if (obj.total && !obj.next && !obj.operation) {
      return {
        next: buttonName,
        currentTotal: null,
        total: null,
        currentEquation: [buttonName]
      }
    }
    // If there is an operation, update next
    if (obj.operation) {
      if (obj.total && obj.next) {
        buttonName = obj.next + buttonName
        return trackHistory(obj, buttonName)
      }
      if (obj.total) {
        return trackHistory(obj, buttonName)
      }
      if (obj.next) {
        return { next: obj.next + buttonName };
      }
      return { next: buttonName };
    }
    // If there is no operation, update next and clear the value
    if (obj.next) {
      const next = obj.next === "0" ? buttonName : obj.next + buttonName;
      return {
        next,
        total: null,
      };
    }
    return {
      next: buttonName,
      total: null,
    };
  }

  if (buttonName === "%") {
    if (obj.operation && obj.next) {
      const result = operate(obj.total, obj.next, obj.operation);
      return {
        total: Big(result)
          .div(Big("100"))
          .toString(),
        next: null,
        operation: null,
      };
    }
    if (obj.next) {
      return {
        next: Big(obj.next)
          .div(Big("100"))
          .toString(),
      };
    }
    return {};
  }

  if (buttonName === ".") {
    if (obj.next) {
      // ignore a . if the next number already has one
      if (obj.next.includes(".")) {
        return {};
      }
      return { next: obj.next + "." };
    }
    return { next: "0." };
  }

  if (buttonName === "=") {
    if (!obj.next) {
      return {
        // total: null,
        next: null,
        operation: null,
        //currentEquation: [],

      };

    }
    if (obj.next && obj.operation) {
      return {
        total: operate(obj.total, obj.next, obj.operation),
        next: null,
        operation: null,
        currentEquation: []
      };

    } else {
      // '=' with no operation, nothing to do
      return {};
    }
  }

  if (buttonName === "+/-") {
    if (obj.next) {
      return { next: (-1 * parseFloat(obj.next)).toString() };
    }
    if (obj.total) {
      return { total: (-1 * parseFloat(obj.total)).toString() };
    }
    return {};
  }

  // Button must be an operation

  // When the user presses an operation button without having entered
  // a number first, do nothing.
  // if (!obj.next && !obj.total) {
  //   return {};
  // }

  // User pressed an operation button and there is an existing operation
  if (obj.operation) {
    return {
      total: operate(obj.total, obj.next, obj.operation),
      next: null,
      operation: buttonName,
    };
  }

  // no operation yet, but the user typed one

  // The user hasn't typed a number yet, just save the operation
  if (!obj.next) {
    return { operation: buttonName };
  }

  // save the operation and shift 'next' into 'total'
  return {
    total: obj.next,
    next: null,
    operation: buttonName,
  };
}
