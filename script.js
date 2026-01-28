/* ---------------- SUPABASE SETUP ---------------- */
const SUPABASE_URL = "https://vrbsraxcjoteibpihtjm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYnNyYXhjam90ZWlicGlodGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjkyNjksImV4cCI6MjA4MzgwNTI2OX0.a3k-Lx24DgmnYrG72c3vZwXikBLKdJujS_R7xrgrrUY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------------- FETCH EMPLOYEE ---------------- */
async function findEmployee() {
  const code = document.getElementById("empCode").value;
  if (!code) return;
  const { data, error } = await supabaseClient
    .from("employees") // ✅ FIXED
    .select("employee_name, designation")
    .eq("employee_code", code)
    .single();
  if (error || !data) {
    alert("Employee not found");
    return;
  }
  document.getElementById("empName").value = data.employee_name;
  document.getElementById("designation").value = data.designation;
}

/* ---------------- FORM TOGGLE ---------------- */
function toggleForm() {
  let type = document.getElementById("type").value;
  let form = document.getElementById("form");
  let employeeSection = document.getElementById("employeeSection");
  let commonBrandsHTML = `
    <label>Proposed Amount</label>
    <input id="proposed" type="number">
    <div id="brands">
      <label>Brands</label>
      <div class="brand-entry">
        <label>Brand Name</label>
        <input class="brand-name" type="text">
        <label>Sales Target</label>
        <input class="brand-target" type="number">
        <label>Sales Achievement</label>
        <input class="brand-achieved" type="number">
      </div>
    </div>
    <button type="button" onclick="addBrand()">Add Another Brand</button>
  `;
  if (type === "primary") {
    employeeSection.style.display = "block";
    form.innerHTML = `
      ${commonBrandsHTML}
      <label>Total Resources</label>
      <input id="resources" type="number">
      <label>Resources Met TP TGT</label>
      <input id="qualified" type="number">
    `;
  } else {
    employeeSection.style.display = "none";
    form.innerHTML = `
      ${commonBrandsHTML}
      <label>Touchpoint Target</label>
      <input id="tpTarget" type="number">
      <label>Touchpoint Achievement</label>
      <input id="tpAchieved" type="number">
    `;
  }
}

/* ---------------- ADD BRAND ---------------- */
function addBrand() {
  const brands = document.getElementById('brands');
  const entry = document.createElement('div');
  entry.className = 'brand-entry';
  entry.innerHTML = `
    <label>Brand Name</label>
    <input class="brand-name" type="text">
    <label>Sales Target</label>
    <input class="brand-target" type="number">
    <label>Sales Achievement</label>
    <input class="brand-achieved" type="number">
  `;
  brands.appendChild(entry);
}

/* ---------------- CALCULATION ---------------- */
function calculate() {
  const type = document.getElementById("type").value;
  const proposed = Number(document.getElementById("proposed").value);
  if (!proposed || proposed <= 0) {
    alert("Please enter a valid proposed amount");
    return;
  }
  const targetElements = document.querySelectorAll(".brand-target");
  const achievedElements = document.querySelectorAll(".brand-achieved");
  if (targetElements.length === 0) {
    alert("Please add at least one brand");
    return;
  }
  let totalTarget = Array.from(targetElements).reduce((sum, el) => sum + Number(el.value), 0);
  let totalAchieved = Array.from(achievedElements).reduce((sum, el) => sum + Number(el.value), 0);
  if (totalTarget <= 0) {
    alert("Total sales target must be greater than zero");
    return;
  }
  let salesPercent = totalAchieved / totalTarget;
  let resultHTML = "";
  /* ================= PRIMARY SALESMAN ================= */
  if (type === "primary") {
    if (salesPercent < 0.8) {
      showResult("❌ Not eligible (Sales below 80%)");
      return;
    }
    const resources = Number(document.getElementById("resources").value);
    const qualified = Number(document.getElementById("qualified").value);
    if (!resources || resources <= 0) {
      alert("Total resources must be greater than zero");
      return;
    }
    const generated = salesPercent * proposed;
    const salesIncentive = generated * 0.6;
    const touchpointEarned = (generated * 0.4 / resources) * qualified;
    resultHTML = `
      <p>Sales Incentive: <b>₦${salesIncentive.toFixed(0)}</b></p>
      <p>Touchpoint Earned: <b>₦${touchpointEarned.toFixed(0)}</b></p>
      <hr>
      <h3>Total Payout: ₦${(salesIncentive + touchpointEarned).toFixed(0)}</h3>
    `;
  }
  /* ================= SECONDARY SALESMAN ================= */
  else {
    /* ---- SALES INCENTIVE ---- */
    let salesIncentive = 0;
    const salesPool = proposed * 0.5;
    if (salesPercent >= 0.8) {
      if (salesPercent > 2) salesPercent = 2; // cap at 200%
      salesIncentive = salesPercent * salesPool;
    }
    /* ---- TOUCHPOINT INCENTIVE ---- */
    const tpTarget = Number(document.getElementById("tpTarget").value);
    const tpAchieved = Number(document.getElementById("tpAchieved").value);
    if (!tpTarget || !tpAchieved) {
      alert("Please enter touchpoint target and achievement");
      return;
    }
    let touchpointEarned = tpAchieved >= tpTarget ? proposed * 0.5 : 0;
    resultHTML = `
      <p>Sales Incentive: <b>₦${salesIncentive.toFixed(0)}</b></p>
      <p>Touchpoint Earned: <b>₦${touchpointEarned.toFixed(0)}</b></p>
      <hr>
      <h3>Total Payout: ₦${(salesIncentive + touchpointEarned).toFixed(0)}</h3>
    `;
  }
  showResult(resultHTML);
}

/* ---------------- PAGE SWITCH ---------------- */
function showResult(html) {
  document.getElementById("result").innerHTML = html;
  document.getElementById("page1").style.display = "none";
  document.getElementById("page2").style.display = "block";
}
function goBack() {
  document.getElementById("page2").style.display = "none";
  document.getElementById("page1").style.display = "block";
}
