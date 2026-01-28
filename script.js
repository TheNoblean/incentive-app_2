/* ---------------- SUPABASE SETUP ---------------- */
const SUPABASE_URL = "https://vrbsraxcjoteibpihtjm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYnNyYXhjam90ZWlicGlodGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjkyNjksImV4cCI6MjA4MzgwNTI2OX0.a3k-Lx24DgmnYrG72c3vZwXikBLKdJujS_R7xrgrrUY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------------- FETCH EMPLOYEE ---------------- */
async function findEmployee() {
  const code = document.getElementById("empCode").value;
  if (!code) return;
  const { data, error } = await supabaseClient
    .from("employees")
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
  const type = document.getElementById("type").value;
  const employeeSection = document.getElementById("employeeSection");
  employeeSection.style.display = type === "primary" ? "block" : "none";

  const extraFields = type === "primary" ? `
    <label>Total Resources</label>
    <input class="brand-resources" type="number" min="0">
    <label>Resources Met TP TGT</label>
    <input class="brand-qualified" type="number" min="0">
  ` : `
    <label>Touchpoint Target</label>
    <input class="brand-tpTarget" type="number" min="0">
    <label>Touchpoint Achievement</label>
    <input class="brand-tpAchieved" type="number" min="0">
  `;

  document.getElementById("form").innerHTML = `
    <div id="brands">
      <label>Brands</label>
      <div class="brand-entry">
        <label>Brand Name</label>
        <input class="brand-name" type="text" required>
        <label>Proposed Amount (₦)</label>
        <input class="brand-proposed" type="number" min="0" required>
        <label>Sales Target</label>
        <input class="brand-target" type="number" min="0" required>
        <label>Sales Achievement</label>
        <input class="brand-achieved" type="number" min="0" required>
        ${extraFields}
      </div>
    </div>
    <button type="button" onclick="addBrand()">Add Another Brand</button>
  `;
}

/* ---------------- ADD BRAND ---------------- */
function addBrand() {
  const type = document.getElementById("type").value;
  const extraFields = type === "primary" ? `
    <label>Total Resources</label>
    <input class="brand-resources" type="number" min="0">
    <label>Resources Met TP TGT</label>
    <input class="brand-qualified" type="number" min="0">
  ` : `
    <label>Touchpoint Target</label>
    <input class="brand-tpTarget" type="number" min="0">
    <label>Touchpoint Achievement</label>
    <input class="brand-tpAchieved" type="number" min="0">
  `;

  const entry = document.createElement('div');
  entry.className = 'brand-entry';
  entry.innerHTML = `
    <label>Brand Name</label>
    <input class="brand-name" type="text" required>
    <label>Proposed Amount (₦)</label>
    <input class="brand-proposed" type="number" min="0" required>
    <label>Sales Target</label>
    <input class="brand-target" type="number" min="0" required>
    <label>Sales Achievement</label>
    <input class="brand-achieved" type="number" min="0" required>
    ${extraFields}
  `;
  document.getElementById('brands').appendChild(entry);
}

/* ---------------- CALCULATION ---------------- */
function calculate() {
  const type = document.getElementById("type").value;
  const brandEntries = document.querySelectorAll(".brand-entry");

  if (brandEntries.length === 0) {
    alert("Please add at least one brand");
    return;
  }

  let totalPayout = 0;
  let rows = [];

  for (let entry of brandEntries) {
    const name = entry.querySelector(".brand-name").value.trim();
    const proposed = Number(entry.querySelector(".brand-proposed").value);
    const target = Number(entry.querySelector(".brand-target").value);
    const achieved = Number(entry.querySelector(".brand-achieved").value);

    if (!name) {
      alert("Brand name is required for each entry");
      return;
    }
    if (isNaN(proposed) || proposed <= 0) {
      alert(`Please enter a valid Proposed Amount for ${name}`);
      return;
    }
    if (isNaN(target) || target <= 0) {
      alert(`Please enter a valid Sales Target for ${name}`);
      return;
    }
    if (isNaN(achieved)) {
      alert(`Please enter Sales Achievement for ${name}`);
      return;
    }

    const salesPercent = achieved / target;
    let salesIncentive = 0;
    let touchpointEarned = 0;
    let brandTotal = 0;

    if (type === "primary") {
      const resources = Number(entry.querySelector(".brand-resources").value);
      const qualified = Number(entry.querySelector(".brand-qualified").value);

      if (isNaN(resources) || resources <= 0) {
        alert(`Please enter valid Total Resources for ${name}`);
        return;
      }
      if (isNaN(qualified) || qualified < 0 || qualified > resources) {
        alert(`Resources Met TP TGT must be between 0 and Total Resources for ${name}`);
        return;
      }

      if (salesPercent >= 0.8) {
        const generated = salesPercent * proposed;
        salesIncentive = generated * 0.6;
        touchpointEarned = (generated * 0.4 / resources) * qualified;
      }
    } else {
      const tpTarget = Number(entry.querySelector(".brand-tpTarget").value);
      const tpAchieved = Number(entry.querySelector(".brand-tpAchieved").value);

      if (isNaN(tpTarget) || tpTarget < 0) {
        alert(`Please enter valid Touchpoint Target for ${name}`);
        return;
      }
      if (isNaN(tpAchieved) || tpAchieved < 0) {
        alert(`Please enter valid Touchpoint Achievement for ${name}`);
        return;
      }

      if (salesPercent >= 0.8) {
        let cappedPercent = Math.min(salesPercent, 2);
        salesIncentive = cappedPercent * (proposed * 0.5);
      }

      touchpointEarned = (tpAchieved >= tpTarget) ? (proposed * 0.5) : 0;
    }

    brandTotal = salesIncentive + touchpointEarned;
    totalPayout += brandTotal;

    rows.push(`
      <tr>
        <td>${name}</td>
        <td>₦${salesIncentive.toFixed(0)}</td>
        <td>₦${touchpointEarned.toFixed(0)}</td>
        <td>₦${brandTotal.toFixed(0)}</td>
      </tr>
    `);
  }

  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Brand</th>
          <th>Sales Incentive</th>
          <th>Touchpoint Earned</th>
          <th>Brand Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows.join('')}
      </tbody>
      <tfoot>
        <tr>
          <th colspan="3">Grand Total Payout</th>
          <th>₦${totalPayout.toFixed(0)}</th>
        </tr>
      </tfoot>
    </table>
  `;

  showResult(tableHTML);
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
