// ==========================================================================
// CHEMICALS DATA & CUSTOM CHEMICAL LIBRARY MANAGER
// Handles default emission factors and user-saved custom chemicals per category
// ==========================================================================

const DEFAULT_CHEMICALS = {
    // Weaving sizing chemicals
    weaving: {
        starch: { name: 'Modified Starch / Corn Starch', ef: 1.20, desc: 'Natural/modified polymer sizing agent' },
        pva: { name: 'Polyvinyl Alcohol (PVA)', ef: 2.80, desc: 'Synthetic high-adhesion sizing agent' },
        cmc: { name: 'Carboxymethyl Cellulose (CMC)', ef: 2.10, desc: 'Cellulose derivative water-soluble size' },
        acrylic_size: { name: 'Polyacrylate / Acrylic Size', ef: 3.00, desc: 'Synthetic binder for fine yarns' },
        sizing_wax: { name: 'Sizing Wax & Softener', ef: 2.40, desc: 'Yarn lubricant and softener' },
        antistatic: { name: 'Antistatic Agent / Lubricant', ef: 2.20, desc: 'Friction reducer and static inhibitor' },
        custom: { name: 'Other (Specify Custom Name)', ef: 1.00, desc: 'User-defined custom chemical' }
    },
    // Pre-treatment
    preChem: {
        naoh: { name: 'Caustic Soda (NaOH)', ef: 1.20, desc: 'Scouring and mercerizing alkali' },
        h2o2: { name: 'Hydrogen Peroxide (H₂O₂)', ef: 0.80, desc: 'Eco-friendly oxidative bleaching agent' },
        na2co3: { name: 'Soda Ash (Na₂CO₃)', ef: 1.05, desc: 'Alkaline buffer' },
        enzyme_desize: { name: 'Desizing Enzyme (Amylase)', ef: 2.50, desc: 'Biodegradable starch removal enzyme' },
        surfactant: { name: 'Surfactant / Wetting Agent', ef: 2.00, desc: 'Detergent & surface tension reducer' },
        stabilizer: { name: 'Peroxide Stabilizer', ef: 1.80, desc: 'Prevents catalytic decomposition of H2O2' },
        acid_neutral: { name: 'Neutralizing Acid (Acetic/Citric)', ef: 0.70, desc: 'pH neutralization' },
        custom: { name: 'Other (Specify Custom Name)', ef: 1.00, desc: 'User-defined custom chemical' }
    },
    // Dyeing
    dyeChem: {
        reactive_dye: { name: 'Reactive Dye', ef: 3.70, desc: 'For cellulose fibers (cotton, linen)' },
        disperse_dye: { name: 'Disperse Dye', ef: 4.20, desc: 'For polyester and synthetic fibers' },
        vat_dye: { name: 'Vat Dye', ef: 4.80, desc: 'High light/wash-fastness cellulosic dye' },
        direct_dye: { name: 'Direct Dye', ef: 3.00, desc: 'Economical cellulosic dye' },
        sulfur_dye: { name: 'Sulfur Dye', ef: 2.50, desc: 'Black/brown cotton coloration' },
        pigment_dye: { name: 'Pigment Dye', ef: 5.00, desc: 'Binder-fixed coloration' },
        salt: { name: 'Salt (NaCl / Na₂SO₄)', ef: 0.23, desc: 'Exhaustion promoting electrolyte' },
        naoh: { name: 'Caustic Soda (NaOH)', ef: 1.20, desc: 'Alkaline fixing agent' },
        na2co3: { name: 'Soda Ash (Na₂CO₃)', ef: 1.05, desc: 'Fixation buffer for reactive dyes' },
        urea: { name: 'Urea', ef: 1.30, desc: 'Solubilizing and moisture retaining agent' },
        acetic_acid: { name: 'Acetic Acid', ef: 1.10, desc: 'pH buffer for disperse/acid dyeing' },
        leveling_agent: { name: 'Leveling Agent', ef: 2.50, desc: 'Uniform dye distribution auxiliary' },
        dispersing_agent: { name: 'Dispersing Agent', ef: 2.20, desc: 'Prevents dye agglomeration' },
        soaping_agent: { name: 'Soaping Agent', ef: 1.80, desc: 'Cleans unfixed surface dye' },
        fixing_agent: { name: 'Fixing Agent', ef: 2.80, desc: 'Improves wet-fastness' },
        carrier: { name: 'Carrier (for Polyester)', ef: 3.50, desc: 'Swelling agent for atmospheric polyester dyeing' },
        reducing_agent: { name: 'Reducing Agent (Na₂S₂O₄)', ef: 1.50, desc: 'Hydrosulfite for reduction clearing' },
        custom: { name: 'Other (Specify Custom Name)', ef: 1.00, desc: 'User-defined custom chemical' }
    },
    // Printing (Fabric & Garment Embellishment)
    printChem: {
        pigment_paste: { name: 'Pigment Paste / Ink', ef: 5.00, desc: 'Color dispersion for rotary and screen printing' },
        plastisol_ink: { name: 'Plastisol Screen Ink', ef: 4.80, desc: 'PVC/plasticizer-based durable screen ink' },
        water_based_ink: { name: 'Water-Based Screen/Fabric Ink', ef: 3.50, desc: 'Eco-friendly breathable soft hand ink' },
        reactive_ink: { name: 'Reactive Printing Paste/Ink', ef: 4.20, desc: 'Cellulosic fabric digital/screen printing' },
        disperse_ink: { name: 'Disperse / Sublimation Ink', ef: 5.20, desc: 'Polyester rotary & heat transfer printing' },
        dtg_pigment_ink: { name: 'DTG Digital Pigment Ink', ef: 5.60, desc: 'Direct-to-garment inkjet inks' },
        discharge_ink: { name: 'Discharge Printing Paste', ef: 3.20, desc: 'Color bleaching & replacement paste' },
        binder: { name: 'Binder (Polyacrylic)', ef: 3.20, desc: 'Polymer film former adhering pigment to fiber' },
        thickener: { name: 'Synthetic Thickener / Alginate', ef: 1.50, desc: 'Paste rheology & viscosity regulator' },
        crosslinker: { name: 'Cross-linker / Fixer', ef: 3.00, desc: 'Heat-activated wash-fastness improver' },
        urea_print: { name: 'Urea (Printing Moisture Agent)', ef: 1.30, desc: 'Hygroscopic moisture retainer during steaming' },
        emulsifier: { name: 'Emulsifier / Defoamer', ef: 2.00, desc: 'Maintains emulsion stability & bubble control' },
        foil_adhesive: { name: 'Foil / Flock Adhesive', ef: 3.80, desc: 'Metallic foil and flock transfer adhesive' },
        puff_additive: { name: 'Puff / 3D High-Density Additive', ef: 4.10, desc: 'Thermal expandable 3D print foam' },
        custom: { name: 'Other (Specify Custom Name)', ef: 1.00, desc: 'User-defined custom printing chemical' }
    },
    // Finishing
    finChem: {
        softener: { name: 'Softener (Silicone-based)', ef: 4.00, desc: 'Imparts soft, supple hand feel' },
        stiffener: { name: 'Stiffener / Starch', ef: 1.20, desc: 'Imparts body and crispness' },
        water_repellent: { name: 'Water Repellent (C6/non-fluoro)', ef: 8.50, desc: 'Hydrophobic barrier finish' },
        flame_retardant: { name: 'Flame Retardant Finish', ef: 6.00, desc: 'Phosphorus/nitrogen flame retardancy' },
        anti_wrinkle: { name: 'Anti-Wrinkle / Resin (DMDHEU)', ef: 3.50, desc: 'Durable press crosslinking resin' },
        anti_pilling: { name: 'Anti-Pilling Agent', ef: 3.00, desc: 'Fleece and knit surface stabilizer' },
        antimicrobial: { name: 'Antimicrobial Finish', ef: 7.00, desc: 'Bacterial and odor inhibitor' },
        optical_brightener: { name: 'Optical Brightener (OBA)', ef: 4.50, desc: 'Fluorescent whitening agent' },
        hand_builder: { name: 'Hand Builder', ef: 2.00, desc: 'Polymer emulsion for fabric fullness' },
        custom: { name: 'Other (Specify Custom Name)', ef: 1.00, desc: 'User-defined custom chemical' }
    },
    // ETP / Wastewater Treatment
    etpChem: {
        alum: { name: 'Alum (Aluminium Sulphate)', ef: 0.45, desc: 'Primary chemical coagulant' },
        pac: { name: 'Polyaluminium Chloride (PAC)', ef: 0.85, desc: 'High-efficiency coagulant' },
        ferric_chloride: { name: 'Ferric Chloride (FeCl₃)', ef: 0.65, desc: 'Coagulant and color removal' },
        lime: { name: 'Hydrated Lime (Ca(OH)₂)', ef: 1.10, desc: 'pH adjustment & coagulation aid' },
        naoh: { name: 'Caustic Soda (NaOH)', ef: 1.20, desc: 'pH elevation alkali' },
        h2so4: { name: 'Sulphuric Acid (H₂SO₄)', ef: 0.35, desc: 'pH neutralization acid' },
        poly_flocculant: { name: 'Polyelectrolyte / Flocculant', ef: 2.90, desc: 'High MW polymer for floc aggregation' },
        nutrients: { name: 'Nutrients (Urea / DAP)', ef: 1.25, desc: 'Biological aeration pond nutrients' },
        custom: { name: 'Other (Specify Custom Name)', ef: 1.00, desc: 'User-defined custom chemical' }
    },
    // Garments (Clothing Transformation & Washing)
    garmentChem: {
        cellulase: { name: 'Cellulase Enzyme (Bio-wash / Stonewash)', ef: 2.60, desc: 'Fuzz removal, surface polishing and wash-down' },
        desize_garment: { name: 'Garment Desizing Amylase', ef: 2.50, desc: 'Size strip for denim and woven apparel' },
        denim_detergent: { name: 'Scouring & Wetting Detergent', ef: 1.90, desc: 'Oil, dirt, and residual sizing wash' },
        potassium_permanganate: { name: 'Potassium Permanganate (PP Spray)', ef: 2.40, desc: 'Localized denim fading and whisker wash' },
        sodium_hypochlorite: { name: 'Sodium Hypochlorite (Chlorine Bleach)', ef: 1.40, desc: 'Chlorine decolorization wash' },
        hydrogen_peroxide_g: { name: 'Hydrogen Peroxide (Bleach Wash)', ef: 0.80, desc: 'Eco-friendly oxidative garment bleaching' },
        antichlor: { name: 'Antichlor / Neutralizer (Sodium Bisulfite)', ef: 0.90, desc: 'Chlorine neutralization and cleanup' },
        garment_softener: { name: 'Garment Silicone Softener', ef: 3.80, desc: 'Drape, hand feel, and surface smoothness' },
        cationic_softener: { name: 'Cationic Softener', ef: 2.80, desc: 'Standard cationic garment softening' },
        resin_3d: { name: '3D Wrinkle / Whisker Resin', ef: 3.60, desc: 'Fixation resin for denim 3D effects' },
        optical_brightener_g: { name: 'Optical Brightener (OBA)', ef: 4.50, desc: 'White and pastel tint brightener' },
        custom: { name: 'Other (Specify Custom Name)', ef: 1.00, desc: 'User-defined garment chemical' }
    },
    // Garment Printing
    garmentPrintChem: {
        plastisol_ink: { name: 'Plastisol Screen Ink', ef: 4.80, desc: 'PVC/plasticizer-based garment screen ink' },
        water_based_ink: { name: 'Water-Based Garment Ink', ef: 3.50, desc: 'Eco-friendly soft hand ink' },
        dtg_pigment_ink: { name: 'DTG Digital Pigment Ink', ef: 5.60, desc: 'Direct-to-garment inkjet inks' },
        discharge_ink: { name: 'Discharge Printing Paste', ef: 3.20, desc: 'Discharge base with zinc/sodium formaldehyde sulfoxylate' },
        garment_binder: { name: 'Print Binder / Fixer', ef: 3.20, desc: 'Polyacrylic binder for apparel prints' },
        sublimation_ink: { name: 'Sublimation Disperse Ink', ef: 5.20, desc: 'Heat transfer inks for polyester apparel' },
        foil_adhesive: { name: 'Foil / Flock Adhesive', ef: 3.80, desc: 'Metallic foil and flock transfer adhesive' },
        puff_additive: { name: 'Puff / High-Density Additive', ef: 4.10, desc: '3D raised print expander' },
        custom: { name: 'Other (Specify Custom Name)', ef: 1.00, desc: 'User-defined garment printing chemical' }
    },
    // Yarn Dyeing (Package, Hank, Beam coloration)
    yarnDyeChem: {
        reactive_dye_yarn: { name: 'Reactive Dye (Yarn)', ef: 3.70, desc: 'Cellulosic cotton/viscose yarn coloration' },
        disperse_dye_yarn: { name: 'Disperse Dye (Yarn)', ef: 4.20, desc: 'High-temperature polyester yarn dye' },
        vat_dye_yarn: { name: 'Vat Dye (Indigo / Denim / Hank)', ef: 4.80, desc: 'High light/wash-fastness warp/hank dye' },
        acid_dye_yarn: { name: 'Acid Dye (Wool / Nylon Yarn)', ef: 3.90, desc: 'Protein and polyamide yarn coloration' },
        cationic_dye_yarn: { name: 'Cationic / Basic Dye (Acrylic Yarn)', ef: 4.10, desc: 'Modified acrylic yarn dyeing' },
        salt_glauber: { name: "Glauber's Salt (Sodium Sulphate)", ef: 0.25, desc: 'Promotes dye exhaustion onto yarn packages' },
        soda_ash_yarn: { name: 'Soda Ash (Na₂CO₃)', ef: 1.05, desc: 'Fixation buffer for reactive yarn dyeing' },
        caustic_yarn: { name: 'Caustic Soda (NaOH)', ef: 1.20, desc: 'Vat dye reduction and mercerized yarn scouring' },
        acetic_acid_yarn: { name: 'Acetic Acid', ef: 1.10, desc: 'pH control for disperse/acid dyeing & neutralizing' },
        leveling_yarn: { name: 'Yarn Leveling Agent', ef: 2.50, desc: 'Ensures even core-to-surface package penetration' },
        yarn_lubricant: { name: 'Yarn Lubricant & Softener', ef: 2.40, desc: 'Reduces friction for package winding & knitting' },
        sequestering_yarn: { name: 'Sequestering / Chelating Agent', ef: 2.60, desc: 'Binds hard water metal ions' },
        fixing_yarn: { name: 'Yarn Dye Fixing Agent', ef: 2.80, desc: 'Enhances wet-fastness and rubbing resistance' },
        soaping_yarn: { name: 'Yarn Soaping Agent', ef: 1.80, desc: 'Removes unfixed hydrolyzed dye from package core' },
        reducing_yarn: { name: 'Reducing Agent / Hydrosulphite', ef: 1.50, desc: 'Reduction clearing and vat solubilization' },
        custom: { name: 'Other (Specify Custom Name)', ef: 1.00, desc: 'User-defined yarn dyeing chemical' }
    }
};

// Storage key prefix for custom chemicals
const STORAGE_PREFIX = 'textile_custom_chems_';

/**
 * Get all custom chemicals for a specific category from localStorage
 */
function getCustomChemicals(category) {
    try {
        const stored = localStorage.getItem(STORAGE_PREFIX + category);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.error('Error reading custom chemicals from localStorage', e);
        return {};
    }
}

/**
 * Save a custom chemical to localStorage for future use
 */
function saveCustomChemical(category, key, name, ef, desc = 'Saved custom chemical') {
    if (!category || !name) return false;
    try {
        const customChems = getCustomChemicals(category);
        const chemKey = key || ('custom_' + Date.now());
        customChems[chemKey] = {
            name: name.trim(),
            ef: parseFloat(ef) || 1.0,
            desc: desc.trim() || 'Saved custom chemical',
            isCustom: true,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_PREFIX + category, JSON.stringify(customChems));
        return { key: chemKey, data: customChems[chemKey] };
    } catch (e) {
        console.error('Error saving custom chemical', e);
        return false;
    }
}

/**
 * Delete a custom chemical
 */
function deleteCustomChemical(category, key) {
    try {
        const customChems = getCustomChemicals(category);
        if (customChems[key]) {
            delete customChems[key];
            localStorage.setItem(STORAGE_PREFIX + category, JSON.stringify(customChems));
            return true;
        }
        return false;
    } catch (e) {
        console.error('Error deleting custom chemical', e);
        return false;
    }
}

/**
 * Get combined dictionary (defaults + user-saved) for a category
 */
function getChemicalLibrary(category) {
    const defaults = DEFAULT_CHEMICALS[category] || {};
    const custom = getCustomChemicals(category);
    return { ...defaults, ...custom };
}

/**
 * Generate HTML <option> markup for a given category
 */
function renderChemicalOptions(category, selectedKey = '') {
    const lib = getChemicalLibrary(category);
    let optionsHtml = '';
    
    // Group: Standard Chemicals
    const standardKeys = Object.keys(DEFAULT_CHEMICALS[category] || {}).filter(k => k !== 'custom');
    if (standardKeys.length > 0) {
        optionsHtml += '<optgroup label="Standard Chemicals">';
        standardKeys.forEach(k => {
            const item = lib[k];
            const sel = (k === selectedKey) ? 'selected' : '';
            optionsHtml += `<option value="${k}" data-ef="${item.ef}" ${sel}>${item.name} (${item.ef} kg CO₂e/kg)</option>`;
        });
        optionsHtml += '</optgroup>';
    }

    // Group: Custom Saved Chemicals
    const customChems = getCustomChemicals(category);
    const customKeys = Object.keys(customChems);
    if (customKeys.length > 0) {
        optionsHtml += '<optgroup label="Saved Custom Chemicals">';
        customKeys.forEach(k => {
            const item = customChems[k];
            const sel = (k === selectedKey) ? 'selected' : '';
            optionsHtml += `<option value="${k}" data-ef="${item.ef}" data-custom="true" ${sel}>${item.name} (${item.ef} kg CO₂e/kg)</option>`;
        });
        optionsHtml += '</optgroup>';
    }

    // Option: Other
    const otherSel = (selectedKey === 'custom') ? 'selected' : '';
    optionsHtml += `<optgroup label="New / Other">
        <option value="custom" data-ef="1.0" ${otherSel}>Other (Add &amp; Save Custom Chemical...)</option>
    </optgroup>`;

    return optionsHtml;
}
