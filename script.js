const SUPABASE_URL = "https://vrbsraxcjoteibpihtjm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYnNyYXhjam90ZWlicGlodGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjkyNjksImV4cCI6MjA4MzgwNTI2OX0.a3k-Lx24DgmnYrG72c3vZwXikBLKdJujS_R7xrgrrUY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

function toggleForm() {
  const type = document.getElementById("type").value;
  document.getElementById("employeeSection").style.display = type === "primary" ? "block" : "none";

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
    <div class="brands-container" id="brands">
      <div class="brand-row">
        <div class="brand-entry">
          <h4>Brand 1</h4>
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
        <div class="brand-entry">
          <h4>Brand 2</h4>
          <label>Brand Name</label>
          <input class="brand-name" type="text">
          <label>Proposed Amount (₦)</label>
          <input class="brand-proposed" type="number" min="0">
          <label>Sales Target</label>
          <input class="brand-target" type="number" min="0">
          <label>Sales Achievement</label>
          <input class="brand-achieved" type="number" min="0">
          ${extraFields}
        </div>
      </div>
    </div>

    <button type="button" class="add-brand-btn" onclick="addBrandRow()">Add Another Pair of Brands</button>
  `;
}

function addBrandRow() {
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

  const row = document.createElement('div');
  row.className = 'brand-row';

  for (let i = 0; i < 2; i++) {
    const entry = document.createElement('div');
    entry.className = 'brand-entry';
    entry.innerHTML = `
      <h4>Brand</h4>
      <label>Brand Name</label>
      <input class="brand-name" type="text">
      <label>Proposed Amount (₦)</label>
      <input class="brand-proposed" type="number" min="0">
      <label>Sales Target</label>
      <input class="brand-target" type="number" min="0">
      <label>Sales Achievement</label>
      <input class="brand-achieved" type="number" min="0">
      ${extraFields}
    `;
    row.appendChild(entry);
  }

  document.getElementById('brands').appendChild(row);
}

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
    const nameInput = entry.querySelector(".brand-name");
    const proposedInput = entry.querySelector(".brand-proposed");
    const targetInput = entry.querySelector(".brand-target");
    const achievedInput = entry.querySelector(".brand-achieved");

    const name = nameInput.value.trim();
    const proposed = Number(proposedInput.value);
    const target = Number(targetInput.value);
    const achieved = Number(achievedInput.value);

    // Skip completely empty brands
    if (!name && !proposed && !target && !achieved) continue;

    // Require name + proposed + target + achievement if any value is filled
    if (proposed > 0 || target > 0 || achieved > 0) {
      if (!name) {
        alert("Brand name is required when values are entered");
        nameInput.focus();
        return;
      }
      if (isNaN(proposed) || proposed <= 0) {
        alert(`Valid Proposed Amount required for ${name}`);
        proposedInput.focus();
        return;
      }
      if (isNaN(target) || target <= 0) {
        alert(`Valid Sales Target required for ${name}`);
        targetInput.focus();
        return;
      }
      if (isNaN(achieved)) {
        alert(`Sales Achievement required for ${name}`);
        achievedInput.focus();
        return;
      }
    } else {
      continue; // skip empty row
    }

    const salesPercent = achieved / target;
    let salesIncentive = 0;
    let touchpointEarned = 0;

    if (type === "primary") {
      const resources = Number(entry.querySelector(".brand-resources").value);
      const qualified = Number(entry.querySelector(".brand-qualified").value);

      if (isNaN(resources) || resources <= 0) {
        alert(`Total Resources required for ${name}`);
        return;
      }
      if (isNaN(qualified) || qualified < 0 || qualified > resources) {
        alert(`Resources Met TP TGT must be 0-${resources} for ${name}`);
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

      if (isNaN(tpTarget)) {
        alert(`Touchpoint Target required for ${name}`);
        return;
      }
      if (isNaN(tpAchieved)) {
        alert(`Touchpoint Achievement required for ${name}`);
        return;
      }

      if (salesPercent >= 0.8) {
        const capped = Math.min(salesPercent, 2);
        salesIncentive = capped * (proposed * 0.5);
      }
      touchpointEarned = (tpAchieved >= tpTarget) ? (proposed * 0.5) : 0;
    }

    const brandTotal = salesIncentive + touchpointEarned;
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

  if (rows.length === 0) {
    alert("Please fill in at least one complete brand");
    return;
  }

  document.getElementById("result").innerHTML = `
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

  document.getElementById("page1").style.display = "none";
  document.getElementById("page2").style.display = "block";
}

function goBack() {
  document.getElementById("page2").style.display = "none";
  document.getElementById("page1").style.display = "block";
}
