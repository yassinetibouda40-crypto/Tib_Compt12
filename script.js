// ====================================
// CALCUL FACTURE TIB COMPT
// ====================================

const TVA = 0.20;

// Calcul général : additionne les montants de chaque prestation
function calculateInvoice() {

    const rows = document.querySelectorAll("#body tr");

    let subtotal = 0;

    rows.forEach(row => {

        const qty = parseFloat(row.querySelector(".qty").value) || 0;
        const amount = parseFloat(row.querySelector(".amount").value) || 0;

        subtotal += qty * amount;

    });

    const tva = subtotal * TVA;
    const ttc = subtotal + tva;

    document.getElementById("subtotal").innerHTML = formatDh(subtotal);
    document.getElementById("tva").innerHTML = formatDh(tva);
    document.getElementById("ttc").innerHTML = formatDh(ttc);

}

function formatDh(value) {
    return value.toFixed(2) + "Dh";
}

// ====================================
// AJOUTER UNE LIGNE
// ====================================

function addRow() {

    const tbody = document.getElementById("body");

    const row = document.createElement("tr");

    row.innerHTML = `

        <td>
            <input type="text" placeholder="Description de la prestation">
        </td>

        <td>
            <input type="number" value="1" min="0" class="qty">
        </td>

        <td>
            <input type="number" value="0" class="amount">
        </td>

        <td class="no-print">
            <button type="button" class="delete-row" onclick="deleteRow(this)">🗑</button>
        </td>

    `;

    tbody.appendChild(row);

    bindEvents();

    calculateInvoice();

}

// ====================================
// SUPPRIMER UNE LIGNE
// ====================================

function deleteRow(btn) {

    const tbody = document.getElementById("body");

    // Empêche de supprimer la dernière ligne restante
    if (tbody.rows.length <= 1) {
        return;
    }

    const row = btn.closest("tr");

    row.remove();

    calculateInvoice();

}

// ====================================
// EVENEMENTS
// ====================================

function bindEvents() {

    document.querySelectorAll(".amount").forEach(input => {

        input.oninput = calculateInvoice;

    });

    document.querySelectorAll(".qty").forEach(input => {

        input.oninput = calculateInvoice;

    });

}

// ====================================
// DATE AUTOMATIQUE
// ====================================

window.onload = function () {

    const today = new Date();

    const inputDate = document.querySelector(".date-bar input[type='date']");

    if (inputDate) {

        inputDate.value = today.toISOString().substring(0,10);

    }

    bindEvents();

    calculateInvoice();

    chargerFactureEnregistreeSiDemandee();

}

// ====================================
// OUVRIR UNE FACTURE ENREGISTRÉE (depuis tib_compt_banner.html)
// ====================================

const CLE_OUVERTURE = "tibcompt_facture_a_ouvrir";

function chargerFactureEnregistreeSiDemandee() {

    const indexTexte = localStorage.getItem(CLE_OUVERTURE);
    if (indexTexte === null) return;

    localStorage.removeItem(CLE_OUVERTURE);

    let factures = [];
    try {
        factures = JSON.parse(localStorage.getItem(CLE_FACTURES)) || [];
    } catch (e) {
        factures = [];
    }

    const facture = factures[parseInt(indexTexte, 10)];
    if (!facture) return;

    const factureNumEl = document.getElementById("factureNum");
    if (factureNumEl) factureNumEl.value = facture.factureNum || "";

    const dateEl = document.querySelector(".date-bar input[type='date']");
    if (dateEl) dateEl.value = facture.date || "";

    const clientEl = document.querySelector(".client-name");
    if (clientEl) clientEl.value = facture.client || "";

    const iceEl = document.querySelector(".client-line input[placeholder='ICE']");
    if (iceEl) iceEl.value = facture.ice || "";

    const adresseEl = document.querySelector(".address-input");
    if (adresseEl) adresseEl.value = facture.adresse || "";

    const encaissementEl = document.getElementById("encaissementNum");
    if (encaissementEl) encaissementEl.value = facture.encaissementNum || "";

    const modes = facture.modes || [];
    document.querySelectorAll(".checks label").forEach(label => {
        const cb = label.querySelector("input[type='checkbox']");
        const texte = label.textContent.trim();
        if (cb) cb.checked = modes.indexOf(texte) !== -1;
    });

    const tbody = document.getElementById("body");
    if (tbody && Array.isArray(facture.prestations) && facture.prestations.length > 0) {
        tbody.innerHTML = "";
        facture.prestations.forEach(p => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="text" placeholder="Description de la prestation" value="${(p.description || "").replace(/"/g, "&quot;")}"></td>
                <td><input type="number" value="${p.qty || 0}" min="0" class="qty"></td>
                <td><input type="number" value="${p.amount || 0}" class="amount"></td>
                <td class="no-print"><button type="button" class="delete-row" onclick="deleteRow(this)">🗑</button></td>
            `;
            tbody.appendChild(row);
        });
        bindEvents();
    }

    calculateInvoice();

    const montantLettresEl = document.getElementById("montantLettres");
    if (montantLettresEl && facture.montantLettres) montantLettresEl.value = facture.montantLettres;

}

// ====================================
// ENREGISTRER LA FACTURE (visible sur tib_compt_banner.html)
// ====================================

const CLE_FACTURES = "tibcompt_factures_enregistrees";

function enregistrerFacture() {

    const factureNum = document.getElementById("factureNum") ? document.getElementById("factureNum").value : "";
    const date = document.querySelector(".date-bar input[type='date']") ? document.querySelector(".date-bar input[type='date']").value : "";
    const client = document.querySelector(".client-name") ? document.querySelector(".client-name").value : "";
    const ice = document.querySelector(".client-line input[placeholder='ICE']") ? document.querySelector(".client-line input[placeholder='ICE']").value : "";
    const adresse = document.querySelector(".address-input") ? document.querySelector(".address-input").value : "";
    const encaissementNum = document.getElementById("encaissementNum") ? document.getElementById("encaissementNum").value : "";

    const modes = [];
    document.querySelectorAll(".checks input[type='checkbox']").forEach(cb => {
        if (cb.checked) {
            modes.push(cb.parentElement.textContent.trim());
        }
    });

    const prestations = [];
    document.querySelectorAll("#body tr").forEach(row => {
        prestations.push({
            description: row.querySelector("input[type='text']") ? row.querySelector("input[type='text']").value : "",
            qty: row.querySelector(".qty") ? row.querySelector(".qty").value : "",
            amount: row.querySelector(".amount") ? row.querySelector(".amount").value : ""
        });
    });

    const subtotal = document.getElementById("subtotal") ? document.getElementById("subtotal").textContent : "";
    const tva = document.getElementById("tva") ? document.getElementById("tva").textContent : "";
    const ttc = document.getElementById("ttc") ? document.getElementById("ttc").textContent : "";
    const montantLettres = document.getElementById("montantLettres") ? document.getElementById("montantLettres").value : "";

    const facture = {
        factureNum,
        date,
        client,
        ice,
        adresse,
        encaissementNum,
        modes,
        prestations,
        subtotal,
        tva,
        ttc,
        montantLettres,
        enregistreLe: new Date().toISOString()
    };

    let factures = [];
    try {
        factures = JSON.parse(localStorage.getItem(CLE_FACTURES)) || [];
    } catch (e) {
        factures = [];
    }

    factures.push(facture);
    localStorage.setItem(CLE_FACTURES, JSON.stringify(factures));

    alert("Facture N° " + factureNum + " enregistrée. Elle est visible sur la page d'accueil (tib_compt_banner.html).");

}