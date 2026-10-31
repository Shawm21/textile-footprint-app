// ==========================================================================
// STATE MANAGEMENT & DYNAMIC ROW CONTROLLERS
// Manages cross-page persistence in localStorage and chemical row UI
// ==========================================================================

const STATE_STORAGE_KEY = 'textile_footprint_project_state';

// Default initial state
function getDefaultState() {
    return {
        // Master Segment On/Off Switches (Toggle any stage)
        includeSpinning: true,
        includeFabrication: true,
        includeWetProcessing: true,
        includePrinting: true,
        includeGarments: true,
        includeEtp: true,
        includePackaging: true,

        // 1. Production Overview (Raw material segment removed!)
        fabricType: 'cotton',
        productionWeight: 1000,
        cottonRatio: 60,
        polyRatio: 40,

        // 2. Factory General Energy Mix
        gridElectricity: 5000,
        gridEF: 0.85,
        natGasKwh: 8000,
        natGasEF: 0.184,
        renewableKwh: 1000,
        renewableEF: 0.0,
        otherFuelKwh: 0,
        otherFuelEF: 0.32,

        // 3. Spinning
        spinGridKwh: 800,
        spinGasKwh: 200,
        spinRenewableKwh: 0,
        spinWater: 500,
        spinWastePercent: 5.0,

        // 3b. Yarn Dyeing (Package, Hank, Beam coloration below spinning)
        chkYarnDyeing: false,
        yarnDyeMethod: 'package',
        yarnDyeClass: 'reactive',
        yarnDyeLiquorRatio: 8.0,
        yarnDyeNumWashes: 3,
        yarnDyeGridKwh: 350,
        yarnDyeGasKwh: 1400,
        yarnDyeRenewableKwh: 0,
        yarnDyeWaterFresh: 25000,
        yarnDyeWaterRecycled: 0,
        yarnDyeChems: [
            { id: 'ydchem_1', key: 'salt_glauber', customName: '', qty: 150, ef: 0.25 },
            { id: 'ydchem_2', key: 'reactive_dye_yarn', customName: '', qty: 25, ef: 3.70 }
        ],

        // 4. Fabric Formation (Weaving / Knitting)
        weaveType: 'weaving', // 'weaving' or 'knitting'
        weaveGridKwh: 600,
        weaveGasKwh: 100,
        weaveRenewableKwh: 0,
        weaveWater: 200,
        // Weaving chemicals list (Used for sizing preparation)
        weaveChems: [
            { id: 'wchem_1', key: 'starch', customName: '', qty: 50, ef: 1.20 }
        ],

        // 5. Pre-treatment
        preGridKwh: 400,
        preGasKwh: 2000,
        preRenewableKwh: 0,
        preWaterFresh: 50000,
        preWaterRain: 0,
        preWaterRecycled: 0,
        preChems: [
            { id: 'pchem_1', key: 'naoh', customName: '', qty: 30, ef: 1.20 },
            { id: 'pchem_2', key: 'h2o2', customName: '', qty: 25, ef: 0.80 }
        ],
        chkDesizing: true,
        chkScouring: true,
        chkBleaching: true,
        chkMercerizing: false,
        chkHeatSetting: false,

        // 6. Dyeing
        dyeMethod: 'exhaust',
        dyeClass: 'reactive',
        dyeGridKwh: 600,
        dyeGasKwh: 3000,
        dyeRenewableKwh: 0,
        dyeWaterFresh: 80000,
        dyeWaterRain: 0,
        dyeWaterRecycled: 0,
        dyeLiquorRatio: 8.0,
        dyeNumWashes: 4,
        dyeChems: [
            { id: 'dchem_1', key: 'reactive_dye', customName: '', qty: 40, ef: 3.70 },
            { id: 'dchem_2', key: 'salt', customName: '', qty: 500, ef: 0.23 },
            { id: 'dchem_3', key: 'na2co3', customName: '', qty: 60, ef: 1.05 }
        ],

        // 7. Printing (Dedicated Segment)
        chkPrinting: true,
        printType: 'all',
        printMethod: 'rotary',
        printCoveragePercent: 65,
        printGridKwh: 350,
        printGasKwh: 850,
        printRenewableKwh: 0,
        printWaterFresh: 18000,
        printWaterRecycled: 0,
        printChems: [
            { id: 'prchem_1', key: 'pigment_paste', customName: '', qty: 30, ef: 5.00 },
            { id: 'prchem_2', key: 'binder', customName: '', qty: 20, ef: 3.20 },
            { id: 'prchem_3', key: 'thickener', customName: '', qty: 15, ef: 1.50 }
        ],

        // 8. Finishing
        finGridKwh: 300,
        finGasKwh: 1500,
        finRenewableKwh: 0,
        finWaterFresh: 20000,
        finWaterRain: 0,
        finWaterRecycled: 0,
        finChems: [
            { id: 'fchem_1', key: 'softener', customName: '', qty: 15, ef: 4.00 }
        ],
        chkStentering: true,
        chkCalendering: false,
        chkSanforizing: false,
        chkBrushing: false,

        // Garments (Fabric to Clothing, Printing & Washing)
        chkGarments: true,
        garmentCuttingSewingGridKwh: 450,
        garmentCuttingLossPercent: 12.0,
        chkGarmentPrinting: true,
        garmentPrintMethod: 'screen',
        garmentPrintGridKwh: 120,
        garmentPrintGasKwh: 350,
        garmentPrintRenewableKwh: 0,
        garmentPrintWaterFresh: 3000,
        garmentPrintWaterRecycled: 0,
        garmentPrintChems: [
            { id: 'gpchem_1', key: 'plastisol_ink', customName: '', qty: 15, ef: 4.80 },
            { id: 'gpchem_2', key: 'garment_binder', customName: '', qty: 8, ef: 3.20 }
        ],
        garmentWashGridKwh: 250,
        garmentWashGasKwh: 1200,
        garmentWashRenewableKwh: 0,
        garmentWashWaterFresh: 25000,
        garmentWashWaterRecycled: 0,
        garmentChems: [
            { id: 'gchem_1', key: 'cellulase', customName: '', qty: 15, ef: 2.60 },
            { id: 'gchem_2', key: 'garment_softener', customName: '', qty: 20, ef: 3.80 }
        ],

        // 9. Wastewater Treatment (ETP)
        chkETP: true,
        etpGridKwh: 300,
        etpGasKwh: 0,
        etpSludgeKg: 100,
        etpSludgeEF: 0.50,
        etpWaterRecovered: 0,
        etpChems: [
            { id: 'echem_1', key: 'pac', customName: '', qty: 45, ef: 0.85 },
            { id: 'echem_2', key: 'poly_flocculant', customName: '', qty: 5, ef: 2.90 }
        ],

        // 10. Packaging Materials & Operations (Transportation removed per requirement)
        packPlasticKg: 20,
        packPlasticEF: 3.10,
        packCardboardKg: 30,
        packCardboardEF: 0.94,
        packPaperTagsKg: 5,
        packPaperTagsEF: 1.10,
        packHangersKg: 8,
        packHangersEF: 2.20,
        packGridKwh: 60,
        packGasKwh: 40
    };
}

/**
 * Load state from localStorage or return default state
 */
function getProjectState() {
    try {
        const stored = localStorage.getItem(STATE_STORAGE_KEY);
        if (!stored) {
            const defaults = getDefaultState();
            localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(defaults));
            return defaults;
        }
        return { ...getDefaultState(), ...JSON.parse(stored) };
    } catch (e) {
        console.error('Error reading project state', e);
        return getDefaultState();
    }
}

/**
 * Update project state in localStorage
 */
function updateProjectState(updates) {
    try {
        const current = getProjectState();
        const merged = { ...current, ...updates };
        localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(merged));
        return merged;
    } catch (e) {
        console.error('Error saving project state', e);
        return null;
    }
}

/**
 * Reset all calculator state
 */
function resetProjectState() {
    const defaults = getDefaultState();
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? 'OK' : type === 'info' ? 'i' : '!'}</span>
        <span class="toast-msg">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/**
 * Render a dynamic chemical row
 */
function createChemRowHtml(category, chemData) {
    const chemId = chemData.id || (category + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4));
    const selectedKey = chemData.key || 'custom';
    const isCustom = selectedKey === 'custom' || chemData.isCustom || false;
    const customName = chemData.customName || (chemData.name && chemData.name !== 'Other' ? chemData.name : '');
    const qty = chemData.qty !== undefined ? chemData.qty : 0;
    const ef = chemData.ef !== undefined ? chemData.ef : 1.0;

    const options = renderChemicalOptions(category, selectedKey);

    return `
        <div class="chem-row" id="${chemId}" data-category="${category}">
            <div class="chem-select-wrap">
                <select class="chem-select" onchange="handleChemSelectChange(this, '${category}')">
                    ${options}
                </select>
                <div class="custom-name-box" style="display: ${isCustom ? 'flex' : 'none'};">
                    <input type="text" class="chem-custom-name" placeholder="Enter chemical name..." value="${customName}">
                    <button type="button" class="btn-save-chem" onclick="saveCustomChemFromRow(this, '${category}')" title="Save this chemical for future use in all dropdowns">
                        Save
                    </button>
                </div>
            </div>
            <div class="chem-input-wrap">
                <label class="compact-label">Qty (kg)</label>
                <input type="number" class="chem-qty" min="0" step="0.1" value="${qty}" oninput="syncChemRowData('${category}')">
            </div>
            <div class="chem-input-wrap">
                <label class="compact-label">EF (kg CO₂e/kg)</label>
                <input type="number" class="chem-ef" min="0" step="0.01" value="${ef}" oninput="syncChemRowData('${category}')">
            </div>
            <button type="button" class="btn-remove-chem" onclick="removeChemRow(this, '${category}')" title="Remove row">&times;</button>
        </div>
    `;
}

/**
 * Handle change in chemical dropdown
 */
function handleChemSelectChange(selectEl, category) {
    const row = selectEl.closest('.chem-row');
    const selectedOption = selectEl.options[selectEl.selectedIndex];
    const val = selectEl.value;
    const efInput = row.querySelector('.chem-ef');
    const customBox = row.querySelector('.custom-name-box');
    const customNameInput = row.querySelector('.chem-custom-name');

    if (val === 'custom') {
        customBox.style.display = 'flex';
        customNameInput.focus();
        efInput.value = 1.0;
    } else {
        customBox.style.display = 'none';
        const ef = selectedOption.getAttribute('data-ef');
        if (ef) efInput.value = ef;
    }

    syncChemRowData(category);
}

/**
 * Save custom chemical from row inline into library
 */
function saveCustomChemFromRow(btn, category) {
    const row = btn.closest('.chem-row');
    const nameInput = row.querySelector('.chem-custom-name');
    const efInput = row.querySelector('.chem-ef');
    const chemName = nameInput.value.trim();
    const ef = parseFloat(efInput.value) || 1.0;

    if (!chemName) {
        showToast('Please type a name for your custom chemical.', 'warning');
        nameInput.focus();
        return;
    }

    const saved = saveCustomChemical(category, null, chemName, ef);
    if (saved) {
        showToast(`Saved "${chemName}" (EF: ${ef}) to Chemical Library!`, 'success');
        
        // Refresh all dropdowns for this category
        document.querySelectorAll(`.chem-row[data-category="${category}"]`).forEach(r => {
            const select = r.querySelector('.chem-select');
            const currentVal = select.value === 'custom' ? saved.key : select.value;
            select.innerHTML = renderChemicalOptions(category, currentVal);
            if (r === row) {
                select.value = saved.key;
                r.querySelector('.custom-name-box').style.display = 'none';
            }
        });

        syncChemRowData(category);
    } else {
        showToast('Failed to save chemical to library.', 'warning');
    }
}

/**
 * Add a new chemical row to container
 */
function addChemRowToContainer(containerId, category, chemData = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const rowHtml = createChemRowHtml(category, chemData);
    container.insertAdjacentHTML('beforeend', rowHtml);
    syncChemRowData(category);
}

/**
 * Remove a chemical row
 */
function removeChemRow(btn, category) {
    const row = btn.closest('.chem-row');
    const container = row.parentElement;
    if (container.querySelectorAll('.chem-row').length > 1) {
        row.remove();
        syncChemRowData(category);
    } else {
        showToast('At least one chemical row is required.', 'info');
    }
}

/**
 * Collect all chemical rows in a category and sync to state
 */
function syncChemRowData(category) {
    const containerMap = {
        weaving: { id: 'weaveChemContainer', stateKey: 'weaveChems' },
        preChem: { id: 'preChemContainer', stateKey: 'preChems' },
        dyeChem: { id: 'dyeChemContainer', stateKey: 'dyeChems' },
        printChem: { id: 'printChemContainer', stateKey: 'printChems' },
        finChem: { id: 'finChemContainer', stateKey: 'finChems' },
        garmentChem: { id: 'garmentChemContainer', stateKey: 'garmentChems' },
        garmentPrintChem: { id: 'garmentPrintChemContainer', stateKey: 'garmentPrintChems' },
        yarnDyeChem: { id: 'yarnDyeChemContainer', stateKey: 'yarnDyeChems' },
        etpChem: { id: 'etpChemContainer', stateKey: 'etpChems' }
    };

    const target = containerMap[category];
    if (!target) return;

    const container = document.getElementById(target.id);
    if (!container) return;

    const rows = container.querySelectorAll('.chem-row');
    const chems = [];

    rows.forEach(r => {
        const select = r.querySelector('.chem-select');
        const key = select.value;
        const customName = r.querySelector('.chem-custom-name').value;
        const qty = parseFloat(r.querySelector('.chem-qty').value) || 0;
        const ef = parseFloat(r.querySelector('.chem-ef').value) || 0;
        const opt = select.options[select.selectedIndex];
        const isCustom = key === 'custom' || opt.getAttribute('data-custom') === 'true';

        chems.push({
            id: r.id,
            key: key,
            customName: customName,
            name: key === 'custom' ? (customName || 'Custom Chemical') : opt.text.split(' (')[0],
            qty: qty,
            ef: ef,
            isCustom: isCustom
        });
    });

    const updateObj = {};
    updateObj[target.stateKey] = chems;
    updateProjectState(updateObj);
}
