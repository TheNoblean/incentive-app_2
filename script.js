const SUPABASE_URL = "https://vrbsraxcjoteibpihtjm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYnNyYXhjam90ZWlicGlodGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjkyNjksImV4cCI6MjA4MzgwNTI2OX0.a3k-Lx24DgmnYrG72c3vZwXikBLKdJujS_R7xrgrrUY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

function updateForm() {
  const type = document.getElementById("type").value;
  const brandCount = document.getElementById("brandCount")?.value || "2";

  document.getElementById("employeeSection").style.display = 
    type === "primary" ? "block" : "none";

  document.getElementById("brandCountSection").style.display = 
    type ? "block" : "none";

  if (!type) {
    document.getElementById("form").innerHTML = "";
    return;
  }

  const extraFields = type === "primary" ? `
    <label>Total Resources</label>
    <input class="brand-resources" type="number" min="0" required>
    <label>Resources Met TP TGT</label>
    <input class="brand-qualified" type="number" min="0" required>
  ` : `
    <label>Touchpoint Target</label>
    <input class="brand-tpTarget" type="number" min="0" required>
    <label>Touchpoint Achievement</label>
    <input class="brand-tpAchieved" type="number" min="0" required>
  `;

  let brandsHTML = '';
  const count = Number(brandCount);

  for (let i = 1; i <= count; i++) {
    brandsHTML += createBrandHTML(i, extraFields, i > 1);
  }

  document.getElementById("form").innerHTML = brandsHTML;
}

function createBrandHTML(index, extraFields, showRemove = false) {
  return `
    <div class="brand-entry" data-brand-id="${index}">
      <div class="brand-header">
        <h4>Brand ${index}</h4>
        ${showRemove ? '<button type="button" class="remove-btn" onclick="removeBrand(this)">Remove</button>' : ''}
      </div>
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
  `;
}

function addBrand() {
  const type = document.getElementById("type").value;
  if (!type) return;

  const extraFields = type === "primary" ? `
    <label>Total Resources</label>
    <input class="brand-resources" type="number" min="0" required>
    <label>Resources Met TP TGT</label>
    <input class="brand-qualified" type="number" min="0" required>
  ` : `
    <label>Touchpoint Target</label>
    <input class="brand-tpTarget" type="number" min="0" required>
    <label>Touchpoint Achievement</label>
    <input class="brand-tpAchieved" type="number" min="0" required>
  `;

  const container = document.getElementById("form");
  const currentCount = container.querySelectorAll(".brand-entry").length + 1;

  const newBrand = document.createElement('div');
  newBrand.innerHTML = createBrandHTML(currentCount, extraFields, true);
  container.appendChild(newBrand.firstElementChild);
}

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
    const name = entry.querySelector(".brand-name").value.trim();
    const proposed = Number(entry.querySelector(".brand-proposed").value);
    const target = Number(entry.querySelector(".brand-target").value);
    const achieved = Number(entry.querySelector(".brand-achieved").value);

    if (!name && proposed === 0 && target === 0 && achieved === 0) continue;

    if (!name) {
      alert("Brand name is required when values are entered");
      return;
    }
    if (isNaN(proposed) || proposed <= 0) {
      alert(`Valid Proposed Amount required for ${name || "unnamed brand"}`);
      return;
    }
    if (isNaN(target) || target <= 0) {
      alert(`Valid Sales Target required for ${name}`);
      return;
    }
    if (isNaN(achieved)) {
      alert(`Sales Achievement required for ${name}`);
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
        alert(`Resources Met TP TGT must be valid (0-${resources}) for ${name}`);
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

function goBack() {
  document.getElementById("page2").style.display = "none";
  document.getElementById("page1").style.display = "block";
}
