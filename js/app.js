const FIELDS = {
  thal: "Thal",
  chest: "Chest pain type",
  max_heart_rate: "Max heart rate",
  oldpeak: "Oldpeak",
  slope: "Slope",
  number_of_major_vessels: "Number of major vessels",
};

function readInputs() {
  const raw = {};

  for (const name of Object.keys(FIELDS)) {
    const el = document.getElementsByName(name)[0];

    if (!el) {
      return { error: `Missing form field: ${FIELDS[name]}` };
    }

    const value = el.value.trim();

    if (value === "") {
      return { error: `Please fill in: ${FIELDS[name]}` };
    }

    const num = parseFloat(value);

    if (Number.isNaN(num)) {
      return { error: `${FIELDS[name]} must be a number.` };
    }

    raw[name] = num;
  }

  return { values: raw };
}

function calculate(values) {
  const {
    thal,
    chest,
    max_heart_rate,
    oldpeak,
    slope,
    number_of_major_vessels,
  } = values;

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

  if (!el) {
    el = document.createElement("div");
    el.id = "result";
    const form = document.querySelector("form") || document.body;
    form.appendChild(el);
  }

  return el;
}

function result() {
  const { values, error } = readInputs();
  const resultEl = getOrCreateResultEl();

  if (error) {
    resultEl.innerHTML = "Error: " + error;
    return;
  }

  const diagnosis = calculate(values);
  resultEl.innerHTML = "Result: " + diagnosis;
}

function onReset() {
  const el = document.getElementById("result");
  if (el) {
    el.innerHTML = "";
  }
}

$(document).ready(function () {
  $("input, select")
    .on("focus", function () {
      $(this).addClass("boxvisit");
    })
    .on("focusout", function () {
      $(this).removeClass("boxvisit");
    });
});
