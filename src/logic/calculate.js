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
    currentEquation: obj.currentEquation,
    next: buttonName,
    currentTotal: operate(obj.total, buttonName, obj.operation),
    totalHistory: obj.totalHistory
  }
  // let lastIndex = obj.currentEquation.length - 1
  // out.totalHistory[lastIndex] = out.currentTotal
  // out.totalHistory[lastIndex] = { currentTotal: out.currentTotal, next: out.next, total: obj.total, operation: obj.operation }
  return buildHistory(out)
}

function del(obj) {
  obj.currentEquation.pop()
  if (obj.currentEquation.length === 0) {
    return reset()
  }
  let length = obj.currentEquation.length
  // let lastItem = obj.currentEquation[length - 1]

  let mostRecentHistory = obj.totalHistory[length - 1]
  function checkRecent(key) {
    if (!mostRecentHistory) {
      return null
    } else {
      return mostRecentHistory[key]
    }
  }
  return {
    currentEquation: obj.currentEquation,
    currentTotal: checkRecent('currentTotal'),
    totalHistory: obj.totalHistory,
    total: checkRecent('total'),
    next: checkRecent('next'),
    operation: checkRecent('operation')
    // operation: !isNumber(lastItem) ? lastItem : obj.operation
  };
}

function handleNumber(obj, buttonName) {
  if (buttonName === "0" && obj.next === "0") {
    return {};
  }
  //after we recieve total from first equation, reset current equation so that the starting point is the previous total
  if (obj.total && !obj.next && !obj.operation) {
    obj.next = buttonName
    obj.currentTotal = null
    obj.total = null
    obj.currentEquation = [buttonName]
    return buildHistory(obj)
    // return {
    //   next: buttonName,
    //   currentTotal: null,
    //   total: null,
    //   currentEquation: [buttonName]
    // }
  }
  // If there is an operation, update next
  if (obj.operation) {
    if (obj.total && obj.next) {
      //if we have a total, an operation, and a next and we get another number, then add the new number to the last number ex: 3 + 6 3 vs 3 + 63
      // buttonName = obj.next + buttonName
      // return trackHistory(obj, buttonName)
      obj.next = obj.next + buttonName
      obj.currentTotal = operate(obj.total, obj.next, obj.operation)
      return buildHistory(obj)
    }
    if (obj.total) {
      // return trackHistory(obj, buttonName)
      obj.next = buttonName
      obj.currentTotal = operate(obj.total, obj.next, obj.operation)
      return buildHistory(obj)
    }
    if (obj.next) {
      obj.next = obj.next + buttonName
      return buildHistory(obj)
      // return {
      //   currentEquation: obj.currentEquation,
      //   next: obj.next + buttonName
      // };
    }
    obj.next = buttonName
    return buildHistory(obj)
    // return {
    //   currentEquation: obj.currentEquation,
    //   next: buttonName
    // };
  }
  // If there is no operation, update next and clear the value
  if (obj.next) {
    const next = obj.next === "0" ? buttonName : obj.next + buttonName;
    obj.next = next
    obj.total = null
    return buildHistory(obj)
    // return {
    //   currentEquation: obj.currentEquation,
    //   next,
    //   total: null,
    // };
  }
  obj.next = buttonName
  obj.total = null
  return buildHistory(obj)
  // return {
  //   currentEquation: obj.currentEquation,
  //   next: buttonName,
  //   total: null,
  // };
}

function handleCommand(obj, buttonName) {
  if (buttonName === "AC") {
    return reset()
  }
  if (buttonName === "Del") {
    return del(obj)
  }
  if (buttonName === "%") {
    if (obj.operation && obj.next) {
      const result = operate(obj.total, obj.next, obj.operation);
      obj.total = Big(result).div(Big("100").toString())
      obj.next = null
      obj.operation = null
      return buildHistory(obj)
      // return {
      //   total: Big(result)
      //     .div(Big("100"))
      //     .toString(),
      //   next: null,
      //   operation: null,
      //   currentEquation: obj.currentEquation,
      // };
    }
    if (obj.next) {
      obj.next = Big(obj.next)
        .div(Big("100"))
        .toString()
      return buildHistory(obj)
      // return {
      //   next: Big(obj.next)
      //     .div(Big("100"))
      //     .toString(),
      // };
    }
    return {};
  }
  if (buttonName === ".") {
    if (obj.next) {
      // ignore a . if the next number already has one
      if (obj.next.includes(".")) {
        return {};
      }
      obj.next = obj.next + "."
      return buildHistory(obj)
      // return {
      //   currentEquation: obj.currentEquation,
      //   next: obj.next + "."
      // };
    }
    obj.next = "0."
    return buildHistory(obj)
    // return {
    //   currentEquation: obj.currentEquation,
    //   next: "0."
    // };
  }
  if (buttonName === "=") {
    // debugger
    if (!obj.next) {
      obj.next = null
      obj.operation = null
      obj.currentEquation = []
      obj.totalHistory = {}

      return buildHistory(obj)
      // return {
      //   next: null,
      //   operation: null,
      //   currentEquation: [],
      // };
    }
    //NOTE ended here
    if (obj.next && obj.operation) {

      return {
        total: operate(obj.total, obj.next, obj.operation),
        next: null,
        operation: null,
        currentEquation: [],
        currentTotal: null,
        totalHistory: {}
      };
    } else {
      // '=' with no operation, nothing to do
      return {};
    }
  }
  if (buttonName === "+/-") {
    if (obj.next) {
      return {
        currentEquation: obj.currentEquation,
        next: (-1 * parseFloat(obj.next)).toString()
      };
    }
    if (obj.total) {
      return {
        currentEquation: obj.currentEquation,
        total: (-1 * parseFloat(obj.total)).toString()
      };
    }
    return {};
  }
  // Button must be an operation

  // When the user presses an operation button without having entered
  // a number first, do nothing.
  if (!obj.next && !obj.total) {
    return {};
  }
  // User pressed an operation button and there is an existing operation
  if (obj.operation) {
    obj.total = operate(obj.total, obj.next, obj.operation)
    obj.next = null
    obj.operation = buttonName
    return buildHistory(obj)
    // return {
    //   currentEquation: obj.currentEquation,
    //   total: operate(obj.total, obj.next, obj.operation),
    //   next: null,
    //   operation: buttonName,
    // };
  }
  // no operation yet, but the user typed one

  // The user hasn't typed a number yet, just save the operation
  if (!obj.next) {
    obj.operation = buttonName
    return buildHistory(obj)
    // return {
    //   currentEquation: obj.currentEquation,
    //   operation: buttonName
    // };
  }
  // save the operation and shift 'next' into 'total'
  obj.total = obj.next
  obj.next = null
  obj.operation = buttonName
  return buildHistory(obj)
  // return {
  //   currentEquation: obj.currentEquation,
  //   total: obj.next,
  //   next: null,
  //   operation: buttonName,
  // };
}

function reset() {
  return {
    total: null,
    next: null,
    operation: null,
    currentEquation: [],
    currentTotal: null,
    totalHistory: {}
  };
}

function pushCurrentEquation(obj, buttonName) {
  let current = [...obj.currentEquation]
  let lastChar = current[current.length - 1]
  if (buttonName !== "Del" && buttonName !== "=") {

    if (current.length > 0 && isNumber(lastChar)) {
      current.push(buttonName)
    }
    else if (current.length === 0 && isNumber(buttonName)) {
      current.push(buttonName)
    } else if (isNumber(buttonName)) {
      current.push(buttonName)
    }
  }
  let copyObj = { ...obj }
  copyObj["currentEquation"] = current
  return copyObj
}
//if it's a number it can always be added
//if it's a character, only add it if it's immediately preceding character is a number

function buildHistory(obj) {
  // debugger
  let lastIndex = obj.currentEquation.length - 1
  if (lastIndex < 0) {
    return obj
  }
  let out = {}
  for (let key in obj) {
    if (key !== 'currentEquation' && key !== 'totalHistory') {
      out[key] = obj[key]
    }
  }
  obj.totalHistory[lastIndex] = out
  console.log(out)
  return obj
}

export default function calculate(obj, buttonName) {
  // if (buttonName !== "Del" && buttonName !== "=") {

  //   obj.currentEquation.push(buttonName)
  // }
  obj = pushCurrentEquation(obj, buttonName)

  if (isNumber(buttonName)) {
    return handleNumber(obj, buttonName)

  } else {
    return handleCommand(obj, buttonName)
  }

}
