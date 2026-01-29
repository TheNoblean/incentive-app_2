/* ---------------- SUPABASE SETUP ---------------- */
const SUPABASE_URL = "https://vrbsraxcjoteibpihtjm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYnNyYXhjam90ZWlicGlodGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjkyNjksImV4cCI6MjA4MzgwNTI2OX0.a3k-Lx24DgmnYrG72c3vZwXikBLKdJujS_R7xrgrrUY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------------- FETCH EMPLOYEE ---------------- */
async function findEmployee() {
  const code = document.getElementById("empCode")?.value;
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

/* ---------------- FORM GENERATION HELPERS ---------------- */
function createBrandHTML(index, extraFields, showRemove = false) {
  return `
    <div class="brand-entry" data-brand-id="${index}">
      <div class="brand-header">
        <h4>Brand ${index}</h4>
        ${showRemove ? '<button type="button" class="remove-btn" onclick="removeBrand(this)">Remove</button>' : ''}
      </div>
      <label>Brand Name</label>
      <input class="brand-name" type="text" required>
      <label>Proposed (₦)</label>
      <input class="brand-proposed" type="number" min="0" required>
      <label>Target</label>
      <input class="brand-target" type="number" min="0" required>
      <label>Achieved</label>
      <input class="brand-achieved" type="number" min="0" required>
      ${extraFields}
    </div>
  `;
}

/* ---------------- UPDATE FORM WHEN TYPE OR COUNT CHANGES ---------------- */
function updateForm() {
  const type = document.getElementById("type").value;
  const brandCountSelect = document.getElementById("brandCount");
  const brandCount = brandCountSelect ? Number(brandCountSelect.value) : 2;

  // Show/hide employee section
  document.getElementById("employeeSection").style.display = 
    type === "primary" ? "block" : "none";

  // Show brand count selector only after type is chosen
  document.getElementById("brandCountSection").style.display = 
    type ? "block" : "none";

  if (!type) {
    document.getElementById("form").innerHTML = "";
    return;
  }

  // Determine extra fields based on salesman type
  const extraFields = type === "primary" ? `
    <label>Resources</label>
    <input class="brand-resources" type="number" min="0" required>
    <label>Met TP TGT</label>
    <input class="brand-qualified" type="number" min="0" required>
  ` : `
    <label>TP Target</label>
    <input class="brand-tpTarget" type="number" min="0" required>
    <label>TP Achieved</label>
    <input class="brand-tpAchieved" type="number" min="0" required>
  `;

  // Generate initial brands
  let brandsHTML = '';
  for (let i = 1; i <= brandCount; i++) {
    brandsHTML += createBrandHTML(i, extraFields, i > 1);
  }

  document.getElementById("form").innerHTML = brandsHTML;
}

/* ---------------- ADD NEW BRAND ---------------- */
function addBrand() {
  const type = document.getElementById("type").value;
  if (!type) {
    alert("Please select Salesman Type first");
    return;
  }

  const extraFields = type === "primary" ? `
    <label>Resources</label>
    <input class="brand-resources" type="number" min="0" required>
    <label>Met TP TGT</label>
    <input class="brand-qualified" type="number" min="0" required>
  ` : `
    <label>TP Target</label>
    <input class="brand-tpTarget" type="number" min="0" required>
    <label>TP Achieved</label>
    <input class="brand-tpAchieved" type="number" min="0" required>
  `;

  const container = document.getElementById("form");
  const currentCount = container.querySelectorAll(".brand-entry").length + 1;

  container.insertAdjacentHTML('beforeend', createBrandHTML(currentCount, extraFields, true));
}

/* ---------------- REMOVE BRAND ---------------- */
function removeBrand(button) {
  const entry = button.closest(".brand-entry");
  if (!entry) return;

  const allEntries = document.querySelectorAll(".brand-entry");
  if (allEntries.length <= 1) {
    alert("You must keep at least one brand.");
    return;
  }

  entry.remove();

  // Re-number remaining brands
  const remaining = document.querySelectorAll(".brand-entry");
  remaining.forEach((el, i) => {
    const header = el.querySelector(".brand-header h4");
    if (header) header.textContent = `Brand ${i + 1}`;
  });
}

/* ---------------- CALCULATE INCENTIVE ---------------- */
function calculate() {
  const type = document.getElementById("type").value;
  if (!type) {
    alert("Please select Salesman Type");
    return;
  }

  const brandEntries = document.querySelectorAll(".brand-entry");
  if (brandEntries.length === 0) {
    alert("Please add at least one brand");
    return;
  }

  let totalPayout = 0;
  let rows = [];

  for (let entry of brandEntries) {
    const nameInput    = entry.querySelector(".brand-name");
    const proposedInput = entry.querySelector(".brand-proposed");
    const targetInput   = entry.querySelector(".brand-target");
    const achievedInput = entry.querySelector(".brand-achieved");

    const name     = nameInput.value.trim();
    const proposed = Number(proposedInput.value);
    const target   = Number(targetInput.value);
    const achieved = Number(achievedInput.value);

    // Skip completely empty entries
    if (!name && proposed === 0 && target === 0 && achieved === 0) continue;

    // Validation
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
        alert(`Resources Met TP TGT must be between 0 and ${resources} for ${name}`);
        return;
      }

      if (salesPercent >= 0.8) {
        const generated = salesPercent * proposed;
        salesIncentive = generated * 0.6;
        touchpointEarned = (generated * 0.4 / resources) * qualified;
      }
    } else {
      const tpTarget   = Number(entry.querySelector(".brand-tpTarget").value);
      const tpAchieved = Number(entry.querySelector(".brand-tpAchieved").value);

      if (isNaN(tpTarget) || tpTarget < 0) {
        alert(`Touchpoint Target required for ${name}`);
        return;
      }
      if (isNaN(tpAchieved) || tpAchieved < 0) {
        alert(`Touchpoint Achievement required for ${name}`);
        return;
      }

      if (salesPercent >= 0.8) {
        const cappedPercent = Math.min(salesPercent, 2);
        salesIncentive = cappedPercent * (proposed * 0.5);
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
      <tbody>${rows.join('')}</tbody>
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

/* ---------------- PAGE NAVIGATION ---------------- */
function goBack() {
  document.getElementById("page2").style.display = "none";
  document.getElementById("page1").style.display = "block";
}
