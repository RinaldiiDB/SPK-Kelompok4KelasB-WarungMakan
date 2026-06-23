from flask import Flask, render_template, request, jsonify
from math import gcd

app = Flask(__name__)

# Default data sesuai soal
DEFAULT_DATA = {
    "criteria": [
        {"id": "C1", "name": "Biaya Produksi",       "type": "cost",    "weight": 0.30},
        {"id": "C2", "name": "Harga Pasar",           "type": "benefit", "weight": 0.15},
        {"id": "C3", "name": "Tingkat Permintaan",    "type": "benefit", "weight": 0.15},
        {"id": "C4", "name": "Kualitas Produk",       "type": "benefit", "weight": 0.15},
        {"id": "C5", "name": "Keuntungan Diinginkan", "type": "benefit", "weight": 0.25},
    ],
    "alternatives": [
        {"name": "A1 (8.000)",  "values": [1, 3, 3, 3, 1]},
        {"name": "A2 (9.000)",  "values": [2, 2, 2, 3, 2]},
        {"name": "A3 (10.000)", "values": [3, 5, 5, 4, 3]},
        {"name": "A4 (11.000)", "values": [4, 2, 2, 4, 4]},
        {"name": "A5 (12.000)", "values": [5, 5, 4, 5, 5]},
    ]
}

def simplify_fraction(num, den):
    """Return fraction string in simplified form, e.g. '3/5'."""
    if den == 0:
        return "0"
    # Work with integers if possible
    try:
        num_i = int(round(num))
        den_i = int(round(den))
        common = gcd(abs(num_i), abs(den_i))
        n = num_i // common
        d = den_i // common
        if d == 1:
            return str(n)
        return f"{n}/{d}"
    except Exception:
        return f"{round(num/den, 4)}"

def saw_calculate(criteria, alternatives):
    n_alt  = len(alternatives)
    n_crit = len(criteria)

    # Ambil matrix nilai
    matrix = [alt["values"] for alt in alternatives]

    # Normalisasi — hitung pecahan DAN desimal
    normalized_decimal  = []   # float values
    normalized_fraction = []   # string "num/den"

    for i in range(n_alt):
        row_dec  = []
        row_frac = []
        for j in range(n_crit):
            col_values = [matrix[a][j] for a in range(n_alt)]
            if criteria[j]["type"] == "benefit":
                max_val = max(col_values)
                dec_val = matrix[i][j] / max_val
                row_dec.append(dec_val)
                row_frac.append(simplify_fraction(matrix[i][j], max_val))
            else:  # cost
                min_val = min(col_values)
                dec_val = min_val / matrix[i][j]
                row_dec.append(dec_val)
                row_frac.append(simplify_fraction(min_val, matrix[i][j]))
        normalized_decimal.append(row_dec)
        normalized_fraction.append(row_frac)

    # Hitung skor akhir (Nilai Preferensi)
    scores = []
    for i in range(n_alt):
        score = sum(normalized_decimal[i][j] * criteria[j]["weight"] for j in range(n_crit))
        scores.append(round(score, 3))

    # Ranking
    ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)
    ranks  = [0] * n_alt
    for rank_pos, (alt_idx, _) in enumerate(ranked):
        ranks[alt_idx] = rank_pos + 1

    results = []
    for i in range(n_alt):
        results.append({
            "name":                 alternatives[i]["name"],
            "label":                f"v{i+1}",
            "original":             matrix[i],
            "normalized_fraction":  normalized_fraction[i],
            "normalized_decimal":   [round(v, 4) for v in normalized_decimal[i]],
            "score":                scores[i],
            "rank":                 ranks[i],
        })

    results_sorted = sorted(results, key=lambda x: x["rank"])
    return results_sorted

@app.route("/")
def index():
    return render_template("index.html", data=DEFAULT_DATA)

@app.route("/calculate", methods=["POST"])
def calculate():
    try:
        payload      = request.get_json()
        criteria     = payload["criteria"]
        alternatives = payload["alternatives"]

        # Validasi bobot harus = 1
        total_weight = sum(float(c["weight"]) for c in criteria)
        if abs(total_weight - 1.0) > 0.001:
            return jsonify({"error": f"Total bobot harus = 1.00, saat ini = {round(total_weight, 4)}"}), 400

        for c in criteria:
            c["weight"] = float(c["weight"])
        for alt in alternatives:
            alt["values"] = [float(v) for v in alt["values"]]

        results = saw_calculate(criteria, alternatives)
        return jsonify({"success": True, "results": results, "criteria": criteria})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
