(function (root) {
  "use strict";

  const FORMATS = Object.freeze([
    Object.freeze({ id: "group", label: "One group" }),
    Object.freeze({ id: "two-teams", label: "Two teams" }),
    Object.freeze({ id: "three-teams", label: "Three teams" }),
  ]);
  const CAPACITY = Object.freeze({ 300: 300, 500: 500 });
  const TARGET_ML = 400;
  const EMPTY_STATE = Object.freeze({ 300: 0, 500: 0 });
  const MOVES = Object.freeze(["fill-300", "fill-500", "empty-300", "empty-500", "pour-300-500", "pour-500-300"]);

  function labelForFormat(id) {
    const format = FORMATS.find(function (item) { return item.id === id; });
    return format ? format.label : null;
  }

  function isValidState(state) {
    return Boolean(state && Number.isInteger(state[300]) && Number.isInteger(state[500]) &&
      state[300] >= 0 && state[300] <= CAPACITY[300] && state[500] >= 0 && state[500] <= CAPACITY[500]);
  }

  function applyMove(state, move) {
    if (!isValidState(state) || !MOVES.includes(move)) return null;

    const next = { 300: state[300], 500: state[500] };
    if (move === "fill-300") next[300] = CAPACITY[300];
    else if (move === "fill-500") next[500] = CAPACITY[500];
    else if (move === "empty-300") next[300] = 0;
    else if (move === "empty-500") next[500] = 0;
    else {
      const from = move === "pour-300-500" ? 300 : 500;
      const to = from === 300 ? 500 : 300;
      const amount = Math.min(next[from], CAPACITY[to] - next[to]);
      next[from] -= amount;
      next[to] += amount;
    }
    return Object.freeze(next);
  }

  function isSolved(state) {
    return isValidState(state) && (state[300] === TARGET_ML || state[500] === TARGET_ML);
  }

  const api = Object.freeze({ FORMATS, TARGET_ML, EMPTY_STATE, applyMove, isSolved, labelForFormat });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (!root.document) return;

  const form = root.document.querySelector("#format-form");
  const challenge = root.document.querySelector("#challenge");
  const summary = root.document.querySelector("#format-summary");
  const cup300 = root.document.querySelector("#cup-300");
  const cup500 = root.document.querySelector("#cup-500");
  const status = root.document.querySelector("#challenge-status");
  const success = root.document.querySelector("#success-panel");
  const reset = root.document.querySelector("#reset-button");
  let state = { 300: 0, 500: 0 };

  if (!form || !challenge || !summary || !cup300 || !cup500 || !status || !success || !reset) return;
  const continueButton = root.document.querySelector("#continue-button");

  form.addEventListener("change", function (event) {
    if (event.target && event.target.name === "format") continueButton.disabled = false;
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const label = labelForFormat(new FormData(form).get("format"));
    if (!label) return;
    summary.textContent = "Play format: " + label;
    form.hidden = true;
    challenge.hidden = false;
    root.document.querySelector("#challenge-title").focus();
  });

  function render() {
    cup300.value = state[300] + " ml";
    cup500.value = state[500] + " ml";
    const solved = isSolved(state);
    success.hidden = !solved;
    status.textContent = solved ? "400 ml measured. Ask the guide to confirm." : "Measure 400 ml in either cup.";
    root.document.querySelectorAll("[data-move]").forEach(function (button) {
      button.disabled = applyMove(state, button.dataset.move) === null ||
        JSON.stringify(applyMove(state, button.dataset.move)) === JSON.stringify(state) || solved;
    });
  }

  root.document.querySelectorAll("[data-move]").forEach(function (button) {
    button.addEventListener("click", function () {
      const next = applyMove(state, button.dataset.move);
      if (next) { state = next; render(); }
    });
  });
  reset.addEventListener("click", function () {
    state = { 300: 0, 500: 0 };
    render();
  });
  render();
})(typeof window !== "undefined" ? window : globalThis);
