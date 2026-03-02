const SUP = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];

// global — stores all parsed numbers from input
let parsedNums = [];

function primeFactors(n) {
    if (n <= 1n) return String(n);
    let result = '';
    const LIMIT = 1000000n;
    for (let i = 2n; i <= LIMIT && i * i <= n; i++) {
        if (n % i === 0n) {
            let exp = 0;
            while (n % i === 0n) { exp++; n = n / i; }
            const expStr = exp > 1 ? SUP[exp] : '';
            result += (result ? '×' : '') + i.toString() + expStr;
        }
    }
    if (n > 1n) result += (result ? '×' : '') + n.toString();
    return result || '1';
}

function divisorCount(n) {
    if (n > 1000000000000n) return '?';
    let count = 0n;
    for (let i = 1n; i * i <= n; i++) {
        if (n % i === 0n) count += (i === n / i) ? 1n : 2n;
    }
    const c = Number(count);
    return c % 2 === 0
        ? '<span class="tag-even">' + c + ' (even)</span>'
        : '<span class="tag-odd">'  + c + ' (odd)</span>';
}

function isPerfectSquare(n) {
    if (n < 0n) return false;
    const s = BigInt(Math.round(Math.sqrt(Number(n))));
    for (let d = -1n; d <= 1n; d++)
        if ((s + d) * (s + d) === n) return true;
    return false;
}

function isPrime(n) {
    if (n < 2n) return false;
    if (n === 2n) return true;
    if (n % 2n === 0n) return false;
    if (n > 1000000000000n) return '?';
    for (let i = 3n; i * i <= n; i += 2n)
        if (n % i === 0n) return false;
    return true;
}

function padBin(n, maxBits) {
    return n.toString(2).padStart(maxBits, '0');
}

// ── called when row checkbox changes ─────────────────
function updateSummary() {
    const show = {
        xor: document.getElementById('cb_xor').checked
    };

    if (!show.xor || parsedNums.length === 0) {
        document.getElementById('summary').innerHTML = '';
        return;
    }

    // collect only selected rows
    const selected = parsedNums.filter((_, i) => {
        const cb = document.getElementById('row_' + i);
        return cb && cb.checked;
    });

    if (selected.length === 0) {
        document.getElementById('summary').innerHTML =
            '<div class="warn">⚠️ No rows selected</div>';
        return;
    }

    let xor = selected.reduce((a, b) => a ^ b, 0n);
    let and = selected.reduce((a, b) => a & b);
    let or  = selected.reduce((a, b) => a | b);

    const summaryBits = Math.max(
        xor.toString(2).length,
        and.toString(2).length,
        or.toString(2).length
    );

    const xorBin = padBin(xor, summaryBits);

    // show selected numbers (all of them)
    const selectedNums = selected.map(n => n.toString()).join(', ');

    document.getElementById('summary').innerHTML =
        '<div class="summary">' +
        '<span class="selected-info">Selected ' + selected.length + ' / ' + parsedNums.length + ' → ' + selectedNums + '</span><br><br>' +
        '<b>XOR:</b> ' + xor + ' → ' + xorBin +
            ' <button class="copy-btn" onclick="copyText(\'' + xorBin + '\', this)">📋 copy binary</button><br>' +
        '<b>AND:</b> ' + and + ' → ' + padBin(and, summaryBits) + '<br>' +
        '<b>OR: </b> ' + or  + ' → ' + padBin(or,  summaryBits) +
        '</div>';
}

// ── main analyze — runs on input change ──────────────
function analyze() {
    const raw    = document.getElementById('inp').value.trim();
    const output = document.getElementById('output');
    document.getElementById('summary').innerHTML = '';

    if (!raw) { output.innerHTML = ''; parsedNums = []; return; }

    const show = {
        binary:   document.getElementById('cb_binary').checked,
        factors:  document.getElementById('cb_factors').checked,
        divcount: document.getElementById('cb_divcount').checked,
        sq:       document.getElementById('cb_sq').checked,
        prime:    document.getElementById('cb_prime').checked,
        xor:      document.getElementById('cb_xor').checked,
    };

    try {
        parsedNums = raw.split(/\s+/)
            .map(s => BigInt(Math.round(Number(s))))
            .filter(n => n >= 0n);
    } catch(e) {
        output.innerHTML = '<div class="warn">⚠️ Invalid input</div>';
        return;
    }
    if (parsedNums.length === 0) { output.innerHTML = ''; return; }

    const maxBits = show.binary
        ? Math.max(...parsedNums.map(n => n.toString(2).length))
        : 0;

    // ── table header ──
    let headers = '<tr>';
    headers += '<th><input type="checkbox" id="cb_selectall" checked onchange="toggleAll(this)" title="Select all"></th>';
    headers += '<th>Number</th>';
    if (show.binary)   headers += '<th>Binary</th>';
    if (show.factors)  headers += '<th>Prime Factors</th>';
    if (show.divcount) headers += '<th>Divisors</th>';
    if (show.sq)       headers += '<th>Perfect Square</th>';
    if (show.prime)    headers += '<th>Prime</th>';
    headers += '</tr>';

    // ── table rows ──
    let rows = '';
    for (let idx = 0; idx < parsedNums.length; idx++) {
        const n = parsedNums[idx];
        const primeResult = isPrime(n);
        const sqResult    = isPerfectSquare(n);

        rows += '<tr>';

        // row selection checkbox — id = row_0, row_1 etc
        rows += '<td><input type="checkbox" id="row_' + idx + '" checked onchange="updateSummary()"></td>';
        rows += '<td>' + n.toString() + '</td>';

        if (show.binary) {
            const bin = padBin(n, maxBits);
            rows += '<td>' + bin +
                            ' <button class="copy-btn" onclick="copyText(\'' + bin + '\', this)">📋</button></td>';
        }
        if (show.factors)
            rows += '<td>' + primeFactors(n) + '</td>';
        if (show.divcount)
            rows += '<td>' + divisorCount(n) + '</td>';
        if (show.sq)
            rows += '<td>' + (sqResult ? '✅' : '❌') + '</td>';
        if (show.prime) {
            const display = primeResult === '?'
                ? '<span class="warn">?</span>'
                : (primeResult
                    ? '<span class="tag-yes">✅</span>'
                    : '<span class="tag-no">❌</span>');
            rows += '<td>' + display + '</td>';
        }

        rows += '</tr>';
    }

    output.innerHTML = '<table>' + headers + rows + '</table>';

    // calculate summary for all (all selected by default)
    updateSummary();
}

function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✅';
        setTimeout(() => btn.textContent = '📋', 1000);
    });
}

// ── select all / deselect all toggle ─────────────────
function toggleAll(masterCb) {
    for (let i = 0; i < parsedNums.length; i++) {
        const cb = document.getElementById('row_' + i);
        if (cb) cb.checked = masterCb.checked;
    }
    updateSummary();
}