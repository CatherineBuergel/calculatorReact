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

/*
Calculate will first call 'pushCurrentEquation' which will handle what gets pushed into the currentEquation array (which is used to format the string in the display, as well as track stateHistory). Returns a copy of the state.

Copy of state gets passed along to either handleNumber or handleCommand. 

handleNumber retains most of previous logic, assigning values to 'total' or 'next'. It also tracks currentTotal. All roads lead to buildHistory which adds to the stateHistory dictionary.

handleCommand handles all values that are not a number. 
 -If 'Del' was passed in, it calls 'Del' which will pop off the last item in the currentEquation array and return the values from the most recent point in stateHistory. This does not call buildHistory. Any future values will not create redundant stateHistories because they are based off of currentEquation indices. It will simply overwrite irrelevant histories. 

 -AC calls 'reset' as well as 'del' - if the last item in the array has been popped off. reset puts
 all values in the state back to empty or null. 

 other commands in handleCommand retained almost all of the same original logic. Added a way to update current operator if multiple have been chosen in a row. 
 
*/


function del(obj) {
  obj.currentEquation.pop()
  if (obj.currentEquation.length === 0) {
    return reset()
  }
  let length = obj.currentEquation.length
  let mostRecentHistory = obj.stateHistory[length - 1]
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
    stateHistory: obj.stateHistory,
    total: checkRecent('total'),
    next: checkRecent('next'),
    operation: checkRecent('operation')
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
  }
  // If there is an operation, update next
  if (obj.operation) {
    if (obj.total && obj.next) {
      obj.next = obj.next + buttonName
      obj.currentTotal = operate(obj.total, obj.next, obj.operation)
      return buildHistory(obj)
    }
    if (obj.total) {
      obj.next = buttonName
      obj.currentTotal = operate(obj.total, obj.next, obj.operation)
      return buildHistory(obj)
    }
    if (obj.next) {
      obj.next = obj.next + buttonName
      return buildHistory(obj)
    }
    obj.next = buttonName
    return buildHistory(obj)
  }
  // If there is no operation, update next and clear the value
  if (obj.next) {
    const next = obj.next === "0" ? buttonName : obj.next + buttonName;
    obj.next = next
    obj.total = null
    return buildHistory(obj)
  }
  obj.next = buttonName
  obj.total = null
  return buildHistory(obj)
}

function handleCommand(obj, buttonName) {
  if (buttonName === "AC") {
    return reset()
  }
  if (buttonName === "Del") {
    return del(obj)
  }
  if (buttonName === "%") {
    // debugger
    if (obj.operation && obj.next) {
      const result = operate(obj.total, obj.next, obj.operation);
      obj.total = Big(result).div(Big("100").toString()).toString()
      obj.next = null
      obj.operation = null
      obj.currentTotal = obj.total
      return buildHistory(obj)
    }
    if (obj.next) {
      obj.next = Big(obj.next)
        .div(Big("100"))
        .toString()
      return buildHistory(obj)
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
    }
    obj.next = "0."
    return buildHistory(obj)
  }
  if (buttonName === "=") {
    if (!obj.next) {
      obj.next = null
      obj.operation = null
      obj.currentEquation = []
      obj.stateHistory = {}
      obj.currentTotal = null
      return buildHistory(obj)
    }
    if (obj.next && obj.operation) {
      return {
        total: operate(obj.total, obj.next, obj.operation),
        next: null,
        operation: null,
        currentEquation: [],
        currentTotal: null,
        stateHistory: {}
      };
    } else {
      // '=' with no operation, nothing to do
      return {};
    }
  }
  if (buttonName === "+/-") {
    if (obj.next) {
      obj.next = (-1 * parseFloat(obj.next)).toString()
      return buildHistory(obj)
    }
    if (obj.total) {
      obj.total = (-1 * parseFloat(obj.total)).toString()
      return buildHistory(obj)
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
    //keeps display of current operation up to date
    obj.currentEquation.splice(obj.currentEquation.length - 1, 1, buttonName)
    return buildHistory(obj)
  }
  // no operation yet, but the user typed one

  // The user hasn't typed a number yet, just save the operation
  if (!obj.next) {
    obj.operation = buttonName
    return buildHistory(obj)
  }
  // save the operation and shift 'next' into 'total'
  obj.total = obj.next
  obj.next = null
  obj.operation = buttonName
  return buildHistory(obj)
}

function reset() {
  return {
    total: null,
    next: null,
    operation: null,
    currentEquation: [],
    currentTotal: null,
    stateHistory: {}
  };
}

function pushCurrentEquation(obj, buttonName) {
  //breaks reference with the array
  let current = [...obj.currentEquation]
  let lastChar = current[current.length - 1]
  if (buttonName !== "Del" && buttonName !== "=") {
    //don't push 'del' or '=' into the array
    //if it's a number it can always be added
    //if it's a character, only add it if it's immediately preceding character is a number
    if (current.length > 0 && isNumber(lastChar)) {
      current.push(buttonName)
    }
    //only first char can be a number
    else if (current.length === 0 && isNumber(buttonName)) {
      current.push(buttonName)
    } else if (isNumber(buttonName)) {
      current.push(buttonName)
    }
  }
  //creats copy of object; allows us to reassign values without directly manipulating the state
  //then the copy will eventually be tracked in stateHistory
  let copyObj = { ...obj }
  copyObj["currentEquation"] = current
  return copyObj
}

//All roads lead to build History. adds to stateHistory dictionary which is a key/value pair
//where the key is index of currentEquation array, and the value is the state that occurred at that point in time
function buildHistory(obj) {
  let lastIndex = obj.currentEquation.length - 1
  //prevents creation at negative indices
  if (lastIndex < 0) {
    return obj
  }
  let out = {}
  for (let key in obj) {
    if (key !== 'currentEquation' && key !== 'stateHistory') {
      out[key] = obj[key]
    }
  }
  obj.stateHistory[lastIndex] = out
  console.log(out)
  return obj
}

export default function calculate(obj, buttonName) {
  //will return a copu of object for future manipulation
  obj = pushCurrentEquation(obj, buttonName)

  if (isNumber(buttonName)) {
    return handleNumber(obj, buttonName)

  } else {
    return handleCommand(obj, buttonName)
  }

}
