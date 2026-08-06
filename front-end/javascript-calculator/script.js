const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const statusEl = document.getElementById("status");

let currentInput = "0";
let previousInput = null;
let operator = null;
let justEvaluated = false;
let lastResult = null;

const MAX_DISPLAY_LENGTH = 16;

function updateDisplay() {
  const formatted = formatNumber(currentInput);
  resultEl.textContent = formatted;
  resultEl.classList.toggle("small", formatted.length > 10);
  resultEl.classList.remove("error");

  if (operator && previousInput !== null) {
    expressionEl.textContent = `${formatNumber(previousInput)} ${operatorSymbol(operator)}`;
  } else if (justEvaluated && previousInput !== null) {
    expressionEl.textContent = `${formatNumber(previousInput)} ${operatorSymbol(operator)} ${formatNumber(currentInput)} =`;
  } else {
    expressionEl.innerHTML = "&nbsp;";
  }
}

function operatorSymbol(op) {
  switch (op) {
    case "+":
      return "+";
    case "-":
      return "−";
    case "*":
      return "×";
    case "/":
      return "÷";
    default:
      return op;
  }
}

function formatNumber(value) {
  if (value === "Error") return "Error";

  const num = parseFloat(value);
  if (Number.isNaN(num)) return "0";

  // Handle very large or very small numbers with exponential notation
  if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-9 && num !== 0)) {
    return num.toExponential(6).replace(/\.?0+e/, "e");
  }

  // Round to avoid floating point artifacts
  const rounded = parseFloat(num.toPrecision(12));

  let str = String(rounded);

  // Limit display length
  if (str.length > MAX_DISPLAY_LENGTH) {
    str = rounded.toPrecision(MAX_DISPLAY_LENGTH - 2);
    if (str.includes("e")) {
      str = rounded.toExponential(6).replace(/\.?0+e/, "e");
    } else {
      str = parseFloat(str).toString();
    }
  }

  return str;
}

function setStatus(message) {
  statusEl.textContent = message;
}

function showError(message) {
  currentInput = "Error";
  previousInput = null;
  operator = null;
  justEvaluated = false;
  resultEl.textContent = message;
  resultEl.classList.add("error");
  expressionEl.innerHTML = "&nbsp;";
  setStatus("Error");
}

function inputDigit(digit) {
  if (currentInput === "Error") {
    clearAll();
  }

  if (justEvaluated) {
    currentInput = digit;
    previousInput = null;
    operator = null;
    justEvaluated = false;
  } else if (currentInput === "0") {
    currentInput = digit;
  } else {
    if (
      currentInput.replace("-", "").replace(".", "").length >=
      MAX_DISPLAY_LENGTH
    ) {
      return;
    }
    currentInput += digit;
  }

  setStatus("Ready");
  updateDisplay();
}

function inputDecimal() {
  if (currentInput === "Error") {
    clearAll();
  }

  if (justEvaluated) {
    currentInput = "0.";
    previousInput = null;
    operator = null;
    justEvaluated = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }

  setStatus("Ready");
  updateDisplay();
}

function inputOperator(nextOperator) {
  if (currentInput === "Error") return;

  const currentValue = parseFloat(currentInput);

  if (operator && previousInput !== null && !justEvaluated) {
    // Chain calculation: evaluate the pending operation first
    const result = calculate(previousInput, currentValue, operator);
    if (result === null) return;

    previousInput = result;
    currentInput = "0";
  } else {
    previousInput = currentValue;
    currentInput = "0";
  }

  operator = nextOperator;
  justEvaluated = false;
  setStatus("Ready");
  updateDisplay();
}

function calculate(a, b, op) {
  let result;

  switch (op) {
    case "+":
      result = a + b;
      break;
    case "-":
      result = a - b;
      break;
    case "*":
      result = a * b;
      break;
    case "/":
      if (b === 0) {
        showError("Cannot divide by zero");
        return null;
      }
      result = a / b;
      break;
    default:
      return b;
  }

  if (!Number.isFinite(result) || Math.abs(result) >= 1e100) {
    showError("Overflow");
    return null;
  }

  return result;
}

function evaluate() {
  if (currentInput === "Error") return;

  if (operator && previousInput !== null) {
    const currentValue = parseFloat(currentInput);
    const result = calculate(previousInput, currentValue, operator);

    if (result === null) return;

    lastResult = result;
    currentInput = formatNumber(result);
    justEvaluated = true;
    setStatus("Result");
    updateDisplay();
  } else {
    lastResult = parseFloat(currentInput);
    justEvaluated = true;
    setStatus("Result");
    updateDisplay();
  }
}

function percent() {
  if (currentInput === "Error") return;

  const value = parseFloat(currentInput);

  if (operator && previousInput !== null) {
    // Percentage of the previous input: e.g. 200 + 10% = 200 + 20
    const percentValue = (previousInput * value) / 100;
    currentInput = formatNumber(percentValue);
  } else {
    currentInput = formatNumber(value / 100);
  }

  setStatus("Ready");
  updateDisplay();
}

function clearAll() {
  currentInput = "0";
  previousInput = null;
  operator = null;
  justEvaluated = false;
  lastResult = null;
  setStatus("Ready");
  updateDisplay();
}

function erase() {
  if (currentInput === "Error") {
    clearAll();
    return;
  }

  if (justEvaluated) {
    clearAll();
    return;
  }

  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = "0";
  }

  setStatus("Ready");
  updateDisplay();
}

// Button click handling
document.querySelectorAll(".btn").forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value !== undefined) {
      if (value === ".") {
        inputDecimal();
      } else if (
        value === "+" ||
        value === "-" ||
        value === "*" ||
        value === "/"
      ) {
        inputOperator(value);
      } else {
        inputDigit(value);
      }
    } else if (action) {
      switch (action) {
        case "clear":
          clearAll();
          break;
        case "erase":
          erase();
          break;
        case "percent":
          percent();
          break;
        case "equals":
          evaluate();
          break;
      }
    }
  });
});

// Keyboard support
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    event.preventDefault();
    inputDigit(key);
  } else if (key === ".") {
    event.preventDefault();
    inputDecimal();
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    event.preventDefault();
    inputOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    evaluate();
  } else if (key === "Backspace") {
    event.preventDefault();
    erase();
  } else if (key === "Escape" || key === "Delete") {
    event.preventDefault();
    clearAll();
  } else if (key === "%") {
    event.preventDefault();
    percent();
  }
});

// Initialize display
updateDisplay();
