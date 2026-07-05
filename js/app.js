const FIELDS = {
  thal: "Thal", // thalassemia test result code (3, 6, or 7)
  chest: "Chest pain type", // chest pain category (1-4)
  max_heart_rate: "Max heart rate", // patient's max heart rate achieved
  oldpeak: "Oldpeak", // ST depression induced by exercise relative to rest
  slope: "Slope", // slope of the peak exercise ST segment
  number_of_major_vessels: "Number of major vessels", // vessels colored by fluoroscopy (0-3)
};

function readInputs() {
  const raw = {}; // will hold the parsed numeric value for each field
 
  // loop over every field name we expect the form to have
  for (const name of Object.keys(FIELDS)) {
    const el = document.getElementsByName(name)[0]; // grab the first and only element with this name
 
    // report which field is missing in case it doesn't exist in the DOM at all
    if (!el) {
      return { error: `Missing form field ${FIELDS[name]}` };
    }
 
    const value = el.value.trim(); // read the raw string value and strip whitespace
 
    // report which field is empty if the user left this empty
    if (value === "") {
      return { error: `Please fill in ${FIELDS[name]}` };
    }
 
    const num = parseFloat(value); // convert the string to a floating point number
 
    // report which field is invalid if the value wasn't actually numeric
    if (Number.isNaN(num)) {
      return { error: `${FIELDS[name]} must be a number.` };
    }
 
    raw[name] = num; // store the validated number under its field name
  }
 
  return { values: raw }; // all fields validated, hand back the numeric values
}
 
/**
 * J48 decision tree (hardcoded, trained on the Cleveland heart disease
 * dataset).
 */
function calculate(values) {
  // destructure the six inputs the tree needs out of the values object
  const {
    thal,
    chest,
    max_heart_rate, 
    oldpeak,
    slope, 
    number_of_major_vessels, 
  } = values; // pull all six properties from the passed-in object
 
  if (thal <= 3) {
    if (number_of_major_vessels <= 0) {
      return "Absent";
    }
 
    if (chest <= 1) {
      return slope <= 1 ? "Absent" : "Present"; 
    } else if (chest === 2) {
      return "Absent"; 
    } else if (chest === 3) {
      return "Absent"; 
    } else {
      return "Present"; 
    }
  } else if (thal === 6) {
    // fixed defect thal value: presence depends only on vessel count
    return number_of_major_vessels <= 0 ? "Absent" : "Present";
  } else {
    if (chest <= 1) {
      return "Absent"; 
    } else if (chest === 2) {
      return oldpeak <= 0.1 ? "Absent" : "Present"; 
    } else if (chest === 3) {
      if (slope <= 1) {
        return "Absent";
      }
      if (number_of_major_vessels <= 0) {
        return max_heart_rate <= 152 ? "Present" : "Absent"; 
      }
      return "Present"; 
    } else {
      if (oldpeak <= 0.6) {
        return max_heart_rate <= 143 ? "Absent" : "Present";
      }
      return "Present";
    }
  }
}

function getOrCreateResultEl() {
  let el = document.getElementById("result");
 
  // if it doesn't exist (e.g. was previously removed), create a new one
  if (!el) {
    el = document.createElement("div"); // make a fresh div element
    el.id = "result"; // give it the expected id so future lookups find it
    const form = document.querySelector("form") || document.body; // prefer appending inside the form, fall back to body
    form.appendChild(el); // attach the new result div to the page
  }
 
  return el; // hand back the possibly newly created result element
}
 
function result() {
  const { values, error } = readInputs(); // read and validate the form inputs
  const resultEl = getOrCreateResultEl(); // get (or create) the element that shows the outcome
 
  // if validation failed, show the error message and stop
  if (error) {
    resultEl.innerHTML = "Error: " + error; // display the validation error to the user
    return; // don't attempt to run the decision tree on bad data
  }
 
  const diagnosis = calculate(values); // run the decision tree on the validated inputs
  resultEl.innerHTML = "Result: " + diagnosis; // display the diagnosis to the user
}
 
function onReset() {
  const el = document.getElementById("result"); // look up the result element
  if (el) {
    el.innerHTML = ""; // clear its text instead of removing it from the DOM
  }
}
 
// wait for the DOM to be fully loaded before wiring up jQuery handlers
$(document).ready(function () {
  $("input, select") // select every input and select element on the page
    .on("focus", function () {
      $(this).addClass("boxvisit"); // highlight the field when it gains focus
    })
    .on("focusout", function () {
      $(this).removeClass("boxvisit"); // remove the highlight when focus leaves
    });
});
