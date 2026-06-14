// =============================================
//  SPK SAW – main.js
// =============================================

const DEFAULT = {
  criteria: [
    { id: "C1", name: "Biaya Produksi",       type: "cost",    weight: 0.30 },
    { id: "C2", name: "Harga Pasar",           type: "benefit", weight: 0.15 },
    { id: "C3", name: "Tingkat Permintaan",    type: "benefit", weight: 0.15 },
    { id: "C4", name: "Kualitas Produk",       type: "benefit", weight: 0.15 },
    { id: "C5", name: "Keuntungan Diinginkan", type: "benefit", weight: 0.25 },
  ],
  alternatives: [
    { name: "A1 (8.000)",  values: [1, 3, 3, 3, 1] },
    { name: "A2 (9.000)",  values: [2, 2, 2, 3, 2] },
    { name: "A3 (10.000)", values: [3, 5, 5, 4, 3] },
    { name: "A4 (11.000)", values: [4, 2, 2, 4, 4] },
    { name: "A5 (12.000)", values: [5, 5, 4, 5, 5] },
  ]
};

let state = JSON.parse(JSON.stringify(DEFAULT));

// ---- DOM refs ----
const criteriaBody  = document.getElementById("criteria-body");
const altBody       = document.getElementById("alt-body");
const weightTotal   = document.getElementById("weight-total");
const btnCalc       = document.getElementById("btn-calc");
const btnReset      = document.getElementById("btn-reset");
const resultsSection = document.getElementById("results-section");
const toast         = document.getElementById("toast");

// =============================================
//  RENDER CRITERIA TABLE
// =============================================
function renderCriteria() {
  criteriaBody.innerHTML = "";
  state.criteria.forEach((c, j) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>
        <input type="text" value="${c.name}"
               onchange="state.criteria[${j}].name=this.value; updateAltHeaders()"/>
      </td>
      <td>
        <select onchange="state.criteria[${j}].type=this.value">
          <option value="benefit" ${c.type==='benefit'?'selected':''}>Benefit</option>
          <option value="cost"    ${c.type==='cost'   ?'selected':''}>Cost</option>
        </select>
      </td>
      <td>
        <input type="number" min="0" max="1" step="0.01" value="${c.weight}"
               onchange="state.criteria[${j}].weight=parseFloat(this.value)||0; updateWeightTotal()"/>
      </td>
    `;
    criteriaBody.appendChild(tr);
  });
  updateWeightTotal();
}

function updateWeightTotal() {
  const total = state.criteria.reduce((s, c) => s + (parseFloat(c.weight) || 0), 0);
  weightTotal.textContent = total.toFixed(4);
  weightTotal.className = "weight-total " + (Math.abs(total - 1) < 0.001 ? "weight-ok" : "weight-bad");
}

// =============================================
//  RENDER ALTERNATIVES TABLE
// =============================================
function updateAltHeaders() {
  state.criteria.forEach((c, j) => {
    const th = document.getElementById(`col-c${j+1}`);
    if (th) th.textContent = c.id;
  });
}

function renderAlternatives() {
  altBody.innerHTML = "";
  state.alternatives.forEach((alt, i) => {
    const tr = document.createElement("tr");
    let cells = `<td><input type="text" value="${alt.name}"
                      onchange="state.alternatives[${i}].name=this.value"/></td>`;
    state.criteria.forEach((_, j) => {
      cells += `<td><input type="number" min="1" max="5" step="1"
                    value="${alt.values[j]}"
                    onchange="state.alternatives[${i}].values[${j}]=parseFloat(this.value)||1"/></td>`;
    });
    tr.innerHTML = cells;
    altBody.appendChild(tr);
  });
  updateAltHeaders();
}

// =============================================
//  CALCULATE
// =============================================
btnCalc.addEventListener("click", async () => {
  btnCalc.disabled = true;
  btnCalc.textContent = "⏳ Menghitung...";

  try {
    const res = await fetch("/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ criteria: state.criteria, alternatives: state.alternatives })
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      showToast("⚠️ " + (data.error || "Terjadi kesalahan"));
      return;
    }

    renderResults(data);
    resultsSection.classList.remove("hidden");
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (e) {
    showToast("⚠️ Gagal menghubungi server: " + e.message);
  } finally {
    btnCalc.disabled = false;
    btnCalc.textContent = "🔢 Hitung SAW";
  }
});

// =============================================
//  RENDER RESULTS
// =============================================
function renderResults(data) {
  const { results, criteria } = data;
  const n = criteria.length;
  const medals = ["🥇", "🥈", "🥉"];

  // ---- Normalization Table ----
  const normThead = document.getElementById("norm-thead");
  const normTbody = document.getElementById("norm-tbody");

  let hRow = `<tr><th>Alternatif</th>`;
  criteria.forEach(c => { hRow += `<th>${c.id}<br/><small>(${c.type})</small></th>`; });
  hRow += `</tr>`;
  normThead.innerHTML = hRow;

  normTbody.innerHTML = "";
  // Re-sort by original order (rank may differ from input order)
  const byName = [...results].sort((a, b) => a.name.localeCompare(b.name));
  byName.forEach(r => {
    let row = `<tr><td><strong>${r.name}</strong></td>`;
    r.normalized.forEach(v => {
      row += `<td>${v.toFixed(4)}</td>`;
    });
    row += `</tr>`;
    normTbody.innerHTML += row;
  });

  // ---- Ranking Table ----
  const rankThead = document.getElementById("rank-thead");
  const rankTbody = document.getElementById("rank-tbody");

  rankThead.innerHTML = `<tr>
    <th>Rank</th>
    <th>Alternatif</th>
    ${criteria.map(c => `<th>r<sub>${c.id.toLowerCase()}</sub></th>`).join("")}
    <th>Skor (V<sub>i</sub>)</th>
  </tr>`;

  rankTbody.innerHTML = "";
  results.forEach(r => {
    const medal = medals[r.rank - 1] || "";
    const rowClass = r.rank === 1 ? "rank-1" : "";
    let row = `<tr class="${rowClass}">
      <td><span class="rank-medal">${medal}</span>${r.rank}</td>
      <td><strong>${r.name}</strong></td>`;
    r.normalized.forEach(v => { row += `<td>${v.toFixed(4)}</td>`; });
    row += `<td class="${r.rank===1?'best':''}">${r.score.toFixed(4)}</td>`;
    row += `</tr>`;
    rankTbody.innerHTML += row;
  });

  // ---- Winner Card ----
  const winner = results[0];
  document.getElementById("winner-card").innerHTML = `
    <span class="trophy">🏆</span>
    <h3>Alternatif Terbaik</h3>
    <div class="winner-name">${winner.name}</div>
    <div class="winner-score">Skor SAW: <strong>${winner.score.toFixed(4)}</strong></div>
    <p style="margin-top:12px;color:#94a3b8;font-size:.85rem;">
      Berdasarkan perhitungan SAW dengan ${criteria.length} kriteria,
      <strong>${winner.name}</strong> memperoleh nilai tertinggi
      dan direkomendasikan sebagai harga yang optimal.
    </p>
  `;
}

// =============================================
//  RESET
// =============================================
btnReset.addEventListener("click", () => {
  state = JSON.parse(JSON.stringify(DEFAULT));
  renderCriteria();
  renderAlternatives();
  resultsSection.classList.add("hidden");
});

// =============================================
//  TOAST
// =============================================
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 4000);
}

// ---- INIT ----
renderCriteria();
renderAlternatives();
