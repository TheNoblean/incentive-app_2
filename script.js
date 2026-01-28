// ---------- INIT ----------
addBrand();

// ---------- ADD BRAND ----------
function addBrand() {
  const container = document.getElementById("brands");

  const row = document.createElement("div");
  row.className = "brand-row";

  row.innerHTML = `
    <label>Brand Name</label>
    <input type="text" class="brand-name">

    <label>Target</label>
    <input type="number" class="brand-target">

    <label>Achievement</label>
    <input type="number" class="brand-achieved">

    <label>Proposed Amount</label>
    <input type="number" class="brand-proposed">
  `;

  container.appendChild(row);
}

// ---------- CALCULATION ----------
function calculate() {

  const resources = Number(document.getElementById("resources").value);
  const qualified = Number(document.getElementById("qualified").value);

  if (resources <= 0) {
    alert("Total resources must be greater than zero");
    return;
  }

  const names = document.querySelectorAll(".brand-name");
  const targets = document.querySelectorAll(".brand-target");
  const achieveds = document.querySelectorAll(".brand-achieved");
  const proposeds = document.querySelectorAll(".brand-proposed");

  let totalSales = 0;
  let totalTP = 0;
  let output = "";

  targets.forEach((_, i) => {
    const name = names[i].value || `Brand ${i + 1}`;
    const target = Number(targets[i].value);
    const achieved = Number(achieveds[i].value);
    const proposed = Number(proposeds[i].value);

    if (target <= 0 || achieved < 0 || proposed <= 0) {
      return;
    }

    const percent = achieved / target;

    if (percent < 0.8) {
      output += `
        <p><b>${name}</b>: ❌ Not Eligible (${(percent*100).toFixed(1)}%)</p>
        <hr>
      `;
      return;
    }

    const generated = percent * proposed;
    const salesPart = generated * 0.6;
    const tpPart = (generated * 0.4 / resources) * qualified;

    totalSales += salesPart;
    totalTP += tpPart;

    output += `
      <p><b>${name}</b></p>
      <p>Achievement: ${(percent*100).toFixed(1)}%</p>
      <p>Sales Incentive: ₦${salesPart.toFixed(0)}</p>
      <p>Touchpoint Incentive: ₦${tpPart.toFixed(0)}</p>
      <hr>
    `;
  });

  output += `
    <h3>Total Summary</h3>
    <p>Total Sales Incentive: <b>₦${totalSales.toFixed(0)}</b></p>
    <p>Total Touchpoint Incentive: <b>₦${totalTP.toFixed(0)}</b></p>
    <h2>Total Payout: ₦${(totalSales + totalTP).toFixed(0)}</h2>
  `;

  showResult(output);
}

// ---------- PAGE CONTROL ----------
function showResult(html) {
  document.getElementById("result").innerHTML = html;
  document.getElementById("page1").style.display = "none";
  document.getElementById("page2").style.display = "block";
}

function goBack() {
  document.getElementById("page2").style.display = "none";
  document.getElementById("page1").style.display = "block";
}
