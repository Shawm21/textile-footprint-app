// ==========================================================================
// TEXTILE FOOTPRINT CALCULATION ENGINE
// Executes the complete lifecycle assessment (excluding Raw Materials)
// ==========================================================================

const RESULTS_STORAGE_KEY = 'textile_footprint_last_results';

/**
 * Perform complete footprint calculation using stored state
 */
function calculateProjectFootprint(customState = null) {
    const s = customState || getProjectState();
    const prodWeight = parseFloat(s.productionWeight) || 1;

    // Energy EFs
    const gridEF = parseFloat(s.gridEF) || 0;
    const renewEF = parseFloat(s.renewableEF) || 0;
    const otherFuelEF = parseFloat(s.otherFuelEF) || 0;

    // Central Boiler & Process Steam Configuration
    // The boiler can operate on Natural Gas, Grid Electricity, or Other Fuel
    const boilerFuelType = s.boilerFuelType || 'natural_gas';
    let boilerEF = 0.184;
    if (s.boilerEF !== undefined && s.boilerEF !== null && s.boilerEF !== '') {
        boilerEF = parseFloat(s.boilerEF);
    } else if (boilerFuelType === 'electricity') {
        boilerEF = gridEF;
    } else if (boilerFuelType === 'other_fuel') {
        boilerEF = otherFuelEF || 0.32;
    } else {
        boilerEF = parseFloat(s.natGasEF) || 0.184;
    }

    // Thermal & Process Steam emission factor applied to all manufacturing stages
    const gasEF = boilerEF;

    const stages = [];

    // NOTE: RAW MATERIAL STAGE IS REMOVED PER REQUIREMENT!

    // --- 1. Spinning (Mechanical Fiber to Yarn) ---
    const isSpinningOn = s.includeSpinning !== false;
    let spinCarbon = 0, spinWater = 0;
    let spinGrid = 0, spinGas = 0, spinRenew = 0;

    if (isSpinningOn) {
        spinGrid = parseFloat(s.spinGridKwh) || 0;
        spinGas = parseFloat(s.spinGasKwh) || 0;
        spinRenew = parseFloat(s.spinRenewableKwh) || 0;
        spinCarbon = (spinGrid * gridEF) + (spinGas * gasEF) + (spinRenew * renewEF);
        spinWater = parseFloat(s.spinWater) || 0;
    }

    stages.push({
        name: isSpinningOn ? 'Spinning (Opening, Carding, Ring Frame)' : 'Spinning (Switched OFF)',
        stageKey: 'spinning',
        carbon: spinCarbon,
        water: spinWater,
        freshWater: spinWater,
        rainWater: 0,
        recycledWater: 0,
        gridKwh: spinGrid,
        gasKwh: spinGas,
        renewKwh: spinRenew,
        details: isSpinningOn ? `${spinGrid} kWh Grid, ${spinGas} kWh Gas, ${s.spinWastePercent || 5}% waste loss` : 'Switched OFF (Excluded)'
    });

    // --- 1b. Yarn Dyeing (Optional Stage below Spinning) ---
    const isYarnDyeOn = isSpinningOn && !!s.chkYarnDyeing;
    let yarnDyeCarbon = 0, yarnDyeWater = 0, yarnDyeFresh = 0, yarnDyeRecycled = 0;
    let yarnDyeGrid = 0, yarnDyeGas = 0, yarnDyeRenew = 0, yarnDyeChemCarbon = 0;

    if (isYarnDyeOn) {
        yarnDyeGrid = parseFloat(s.yarnDyeGridKwh) || 0;
        yarnDyeGas = parseFloat(s.yarnDyeGasKwh) || 0;
        yarnDyeRenew = parseFloat(s.yarnDyeRenewableKwh) || 0;
        yarnDyeFresh = parseFloat(s.yarnDyeWaterFresh) || 0;
        yarnDyeRecycled = parseFloat(s.yarnDyeWaterRecycled) || 0;
        yarnDyeWater = yarnDyeFresh + yarnDyeRecycled;

        (s.yarnDyeChems || []).forEach(c => {
            yarnDyeChemCarbon += (parseFloat(c.qty) || 0) * (parseFloat(c.ef) || 0);
        });

        yarnDyeCarbon = (yarnDyeGrid * gridEF) + (yarnDyeGas * gasEF) + (yarnDyeRenew * renewEF) + yarnDyeChemCarbon;
    }

    stages.push({
        name: isYarnDyeOn ? `Yarn Dyeing (${s.yarnDyeMethod || 'package'}, ${s.yarnDyeClass || 'reactive'})` : 'Yarn Dyeing (Optional)',
        stageKey: 'yarn_dyeing',
        carbon: yarnDyeCarbon,
        water: yarnDyeWater,
        freshWater: yarnDyeFresh,
        rainWater: 0,
        recycledWater: yarnDyeRecycled,
        gridKwh: yarnDyeGrid,
        gasKwh: yarnDyeGas,
        renewKwh: yarnDyeRenew,
        details: isYarnDyeOn ? `${(s.yarnDyeChems || []).length} yarn chemicals, L:R ${s.yarnDyeLiquorRatio || 8}:1` : (isSpinningOn ? 'Switched OFF / Not Applied' : 'Spinning stage switched OFF')
    });

    // --- 2. Fabric Formation (Weaving / Knitting) ---
    const isFabOn = s.includeFabrication !== false;
    const isWeaving = (s.weaveType || 'weaving') === 'weaving';
    let weaveCarbon = 0, weaveWater = 0;
    let weaveGrid = 0, weaveGas = 0, weaveRenew = 0, weaveChemCarbon = 0;
    let weaveChemSummary = 'Switched OFF (Excluded)';

    if (isFabOn) {
        weaveGrid = parseFloat(s.weaveGridKwh) || 0;
        weaveGas = parseFloat(s.weaveGasKwh) || 0;
        weaveRenew = parseFloat(s.weaveRenewableKwh) || 0;
        weaveWater = parseFloat(s.weaveWater) || 0;

        if (isWeaving) {
            const weaveChems = s.weaveChems || [];
            weaveChems.forEach(c => {
                weaveChemCarbon += (parseFloat(c.qty) || 0) * (parseFloat(c.ef) || 0);
            });
            weaveChemSummary = `Weaving (${weaveChems.length} sizing chemical(s))`;
        } else {
            weaveChemSummary = 'Knitting (No sizing chemicals used)';
        }

        weaveCarbon = (weaveGrid * gridEF) + (weaveGas * gasEF) + (weaveRenew * renewEF) + weaveChemCarbon;
    }

    stages.push({
        name: isFabOn ? (isWeaving ? 'Fabric Formation (Weaving)' : 'Fabric Formation (Knitting)') : 'Fabric Formation (Switched OFF)',
        stageKey: 'fabrication',
        carbon: weaveCarbon,
        water: weaveWater,
        freshWater: weaveWater,
        rainWater: 0,
        recycledWater: 0,
        gridKwh: weaveGrid,
        gasKwh: weaveGas,
        renewKwh: weaveRenew,
        details: weaveChemSummary
    });

    // --- 3. Pre-treatment & Dyeing (Unified Energy & Water: Calculated Only Once) ---
    // Electricity required & water consumption are taken only once for both Pre-treatment and Dyeing.
    const isWetProcessOn = s.includeWetProcessing !== false;
    let preDyeCarbon = 0, preDyeWater = 0, preDyeFresh = 0, preDyeRain = 0, preDyeRecycled = 0;
    let preDyeGrid = 0, preDyeGas = 0, preDyeRenew = 0;

    if (isWetProcessOn) {
        preDyeGrid = parseFloat(s.dyeGridKwh) || 0;
        preDyeGas = parseFloat(s.dyeGasKwh) || 0;
        preDyeRenew = parseFloat(s.dyeRenewableKwh) || 0;

        let preChemCarbon = 0;
        (s.preChems || []).forEach(c => {
            preChemCarbon += (parseFloat(c.qty) || 0) * (parseFloat(c.ef) || 0);
        });

        let dyeChemCarbon = 0;
        (s.dyeChems || []).forEach(c => {
            dyeChemCarbon += (parseFloat(c.qty) || 0) * (parseFloat(c.ef) || 0);
        });

        preDyeCarbon = (preDyeGrid * gridEF) + (preDyeGas * gasEF) + (preDyeRenew * renewEF) + preChemCarbon + dyeChemCarbon;
        preDyeFresh = parseFloat(s.dyeWaterFresh) || 0;
        preDyeRain = parseFloat(s.dyeWaterRain) || 0;
        preDyeRecycled = parseFloat(s.dyeWaterRecycled) || 0;
        preDyeWater = preDyeFresh + preDyeRain + preDyeRecycled;
    }

    stages.push({
        name: isWetProcessOn ? `Pre-treatment & Dyeing (${s.dyeMethod || 'exhaust'}, ${s.dyeClass || 'reactive'})` : 'Pre-treatment & Dyeing (Switched OFF)',
        stageKey: 'pretreatment_dyeing',
        carbon: preDyeCarbon,
        water: preDyeWater,
        freshWater: preDyeFresh,
        rainWater: preDyeRain,
        recycledWater: preDyeRecycled,
        gridKwh: preDyeGrid,
        gasKwh: preDyeGas,
        renewKwh: preDyeRenew,
        details: isWetProcessOn ? `${(s.preChems || []).length} prep chemicals, ${(s.dyeChems || []).length} dyes/salts, L:R ${s.dyeLiquorRatio || 8}:1` : 'Wet Processing switched OFF'
    });

    // --- 4. Chemical & Mechanical Finishing (Energy & Water Retained As It Is) ---
    let finCarbon = 0, finWater = 0, finFresh = 0, finRain = 0, finRecycled = 0;
    let finGrid = 0, finGas = 0, finRenew = 0;

    if (isWetProcessOn) {
        finGrid = parseFloat(s.finGridKwh) || 0;
        finGas = parseFloat(s.finGasKwh) || 0;
        finRenew = parseFloat(s.finRenewableKwh) || 0;

        let finChemCarbon = 0;
        (s.finChems || []).forEach(c => {
            finChemCarbon += (parseFloat(c.qty) || 0) * (parseFloat(c.ef) || 0);
        });

        finCarbon = (finGrid * gridEF) + (finGas * gasEF) + (finRenew * renewEF) + finChemCarbon;
        finFresh = parseFloat(s.finWaterFresh) || 0;
        finRain = parseFloat(s.finWaterRain) || 0;
        finRecycled = parseFloat(s.finWaterRecycled) || 0;
        finWater = finFresh + finRain + finRecycled;
    }

    stages.push({
        name: isWetProcessOn ? 'Chemical & Mechanical Finishing' : 'Finishing (Switched OFF)',
        stageKey: 'finishing',
        carbon: finCarbon,
        water: finWater,
        freshWater: finFresh,
        rainWater: finRain,
        recycledWater: finRecycled,
        gridKwh: finGrid,
        gasKwh: finGas,
        renewKwh: finRenew,
        details: isWetProcessOn ? `${(s.finChems || []).length} finishes applied` : 'Wet Processing switched OFF'
    });

    // --- 5. Printing (Dedicated Segment: Fabric & Garment Printing) ---
    const isPrintingOn = s.includePrinting !== false && s.chkPrinting !== false;
    let printCarbon = 0, printWater = 0, printFresh = 0, printRecycled = 0;
    let printGrid = 0, printGas = 0, printRenew = 0;

    if (isPrintingOn) {
        printGrid = parseFloat(s.printGridKwh) || 0;
        printGas = parseFloat(s.printGasKwh) || 0;
        printRenew = parseFloat(s.printRenewableKwh) || 0;

        let printChemCarbon = 0;
        (s.printChems || []).forEach(c => {
            printChemCarbon += (parseFloat(c.qty) || 0) * (parseFloat(c.ef) || 0);
        });

        printCarbon = (printGrid * gridEF) + (printGas * gasEF) + (printRenew * renewEF) + printChemCarbon;
        printFresh = parseFloat(s.printWaterFresh) || 0;
        printRecycled = parseFloat(s.printWaterRecycled) || 0;
        printWater = printFresh + printRecycled;
    }

    stages.push({
        name: isPrintingOn ? `Textile Printing (${s.printMethod ? s.printMethod.toUpperCase() : 'Screen / Digital'})` : 'Printing (Switched OFF)',
        stageKey: 'printing',
        carbon: printCarbon,
        water: printWater,
        freshWater: printFresh,
        rainWater: 0,
        recycledWater: printRecycled,
        gridKwh: printGrid,
        gasKwh: printGas,
        renewKwh: printRenew,
        details: isPrintingOn ? `${(s.printChems || []).length} inks, pastes & binders` : 'Switched OFF (Excluded)'
    });

    // --- 6. Garments (Fabric to Clothing & Apparel Washing) ---
    const isGarmentsOn = s.includeGarments !== false && s.chkGarments !== false;
    let garmentCarbon = 0, garmentWater = 0, garmentFresh = 0, garmentRecycled = 0;
    let garmentGrid = 0, garmentGas = 0, garmentRenew = 0;

    if (isGarmentsOn) {
        const cutSewGrid = parseFloat(s.garmentCuttingSewingGridKwh) || 0;
        const washGrid = parseFloat(s.garmentWashGridKwh) || 0;
        const washGas = parseFloat(s.garmentWashGasKwh) || 0;
        const washRenew = parseFloat(s.garmentWashRenewableKwh) || 0;

        garmentGrid = cutSewGrid + washGrid;
        garmentGas = washGas;
        garmentRenew = washRenew;

        let washChemCarbon = 0;
        (s.garmentChems || []).forEach(c => {
            washChemCarbon += (parseFloat(c.qty) || 0) * (parseFloat(c.ef) || 0);
        });

        garmentCarbon = (garmentGrid * gridEF) + (garmentGas * gasEF) + (garmentRenew * renewEF) + washChemCarbon;
        garmentFresh = parseFloat(s.garmentWashWaterFresh) || 0;
        garmentRecycled = parseFloat(s.garmentWashWaterRecycled) || 0;
        garmentWater = garmentFresh + garmentRecycled;
    }

    stages.push({
        name: isGarmentsOn ? 'Garment Manufacturing (Cutting, Sewing & Washing)' : 'Garments (Switched OFF)',
        stageKey: 'garments',
        carbon: garmentCarbon,
        water: garmentWater,
        freshWater: garmentFresh,
        rainWater: 0,
        recycledWater: garmentRecycled,
        gridKwh: garmentGrid,
        gasKwh: garmentGas,
        renewKwh: garmentRenew,
        details: isGarmentsOn ? `Sewing + ${(s.garmentChems || []).length} wash chemicals, ${s.garmentCuttingLossPercent || 12}% scrap loss` : 'Switched OFF (Excluded)'
    });

    // --- 8. Wastewater Treatment (ETP) ---
    const isEtpOn = s.includeEtp !== false && s.chkETP !== false;
    let etpCarbon = 0, etpGrid = 0, etpGas = 0;
    let etpChemC = 0, etpSludgeC = 0;

    if (isEtpOn) {
        etpGrid = parseFloat(s.etpGridKwh) || 0;
        etpGas = parseFloat(s.etpGasKwh) || 0;

        (s.etpChems || []).forEach(c => {
            etpChemC += (parseFloat(c.qty) || 0) * (parseFloat(c.ef) || 0);
        });

        const sludgeKg = parseFloat(s.etpSludgeKg) || 0;
        const sludgeEF = parseFloat(s.etpSludgeEF) || 0;
        etpSludgeC = sludgeKg * sludgeEF;

        etpCarbon = (etpGrid * gridEF) + (etpGas * gasEF) + etpChemC + etpSludgeC;
    }

    stages.push({
        name: isEtpOn ? 'Wastewater Treatment (ETP / ZLD)' : 'Wastewater Treatment (Switched OFF)',
        stageKey: 'etp',
        carbon: etpCarbon,
        water: 0,
        freshWater: 0,
        rainWater: 0,
        recycledWater: 0,
        gridKwh: etpGrid,
        gasKwh: etpGas,
        renewKwh: 0,
        details: isEtpOn ? `${(s.etpChems || []).length} coagulants/flocculants, sludge disposal` : 'Switched OFF (Excluded)'
    });

    // NOTE: Factory general energy and water on the first page are reference benchmarks
    // and are NOT double-counted into totalCarbon or totalWater to prevent duplication.
    // Process-specific energy and water are accumulated from individual stages below.

    // NOTE: TRANSPORTATION REMOVED PER REQUIREMENT 4!

    // --- 10. Packaging Materials & Operations ---
    const isPackOn = s.includePackaging !== false;
    let packCarbon = 0;
    let packGrid = 0, packGas = 0;
    let packPlasticKg = 0, packPlasticEF = 0, packCardboardKg = 0, packCardboardEF = 0;
    let packPaperTagsKg = 0, packPaperTagsEF = 0, packHangersKg = 0, packHangersEF = 0;

    if (isPackOn) {
        packPlasticKg = parseFloat(s.packPlasticKg) || 0;
        packPlasticEF = parseFloat(s.packPlasticEF) || 0;
        packCardboardKg = parseFloat(s.packCardboardKg) || 0;
        packCardboardEF = parseFloat(s.packCardboardEF) || 0;
        packPaperTagsKg = parseFloat(s.packPaperTagsKg) || 0;
        packPaperTagsEF = parseFloat(s.packPaperTagsEF) || 1.10;
        packHangersKg = parseFloat(s.packHangersKg) || 0;
        packHangersEF = parseFloat(s.packHangersEF) || 2.20;
        packGrid = parseFloat(s.packGridKwh) || 0;
        packGas = parseFloat(s.packGasKwh) || 0;

        packCarbon = (packPlasticKg * packPlasticEF) + 
                     (packCardboardKg * packCardboardEF) + 
                     (packPaperTagsKg * packPaperTagsEF) + 
                     (packHangersKg * packHangersEF) + 
                     (packGrid * gridEF) + 
                     (packGas * gasEF);
    }

    stages.push({
        name: isPackOn ? 'Packaging Materials & Box Packing' : 'Packaging (Switched OFF)',
        stageKey: 'packaging',
        carbon: packCarbon,
        water: 0,
        freshWater: 0,
        rainWater: 0,
        recycledWater: 0,
        gridKwh: packGrid,
        gasKwh: packGas,
        renewKwh: 0,
        details: isPackOn ? `${packPlasticKg}kg Plastic, ${packCardboardKg}kg Cartons, ${packPaperTagsKg}kg Tags, ${packGrid}kWh machinery` : 'Switched OFF (Excluded)'
    });

    // ============ TOTALS & AGGREGATIONS ============
    let totalCarbon = 0, totalWater = 0, totalFreshWater = 0, totalRainWater = 0, totalRecycledWater = 0;
    let totalGridKwh = 0, totalGasKwh = 0, totalRenewKwh = 0;

    stages.forEach(st => {
        totalCarbon += st.carbon;
        totalWater += st.water;
        totalFreshWater += st.freshWater;
        totalRainWater += st.rainWater;
        totalRecycledWater += st.recycledWater;
        totalGridKwh += (st.gridKwh || 0);
        totalGasKwh += (st.gasKwh || 0);
        totalRenewKwh += (st.renewKwh || 0);
    });

    const totalOtherKwh = parseFloat(s.otherFuelKwh) || 0;
    const facilityRenewKwh = parseFloat(s.renewableKwh) || 0;
    const effectiveRenewKwh = Math.max(totalRenewKwh, facilityRenewKwh);
    const carbonSavedRenew = effectiveRenewKwh * Math.max(0, (gridEF - renewEF));
    const totalSavedWater = totalRainWater + totalRecycledWater;
    const etpRecovered = (s.includeEtp !== false && s.chkETP !== false) ? (parseFloat(s.etpWaterRecovered) || 0) : 0;

    // Net Carbon Footprint (Total Gross Footprint - Carbon Avoided through Renewables)
    const netCarbon = Math.max(0, totalCarbon - carbonSavedRenew);
    const netCarbonPerKg = prodWeight > 0 ? (netCarbon / prodWeight) : 0;

    // Energy Sources Breakdown
    let boilerLabel = 'Natural Gas Steam Boiler';
    if (boilerFuelType === 'electricity') boilerLabel = 'Electric Boiler / Electrode Steam Generator';
    else if (boilerFuelType === 'other_fuel') boilerLabel = 'Other Fuel Boiler (Biomass/Diesel/Coal)';

    const energySources = [
        { name: 'National Grid Electricity (Process Stages)', kwh: totalGridKwh, carbon: totalGridKwh * gridEF, ef: gridEF },
        { name: `Process Steam / Thermal Energy (${boilerLabel})`, kwh: totalGasKwh, carbon: totalGasKwh * gasEF, ef: gasEF },
        { name: 'On-site Renewable Electricity (Clean Generation)', kwh: effectiveRenewKwh, carbon: effectiveRenewKwh * renewEF, ef: renewEF },
        { name: 'Other Fuel (Generators & Auxiliaries)', kwh: totalOtherKwh, carbon: totalOtherKwh * otherFuelEF, ef: otherFuelEF }
    ];

    // Water Sources Breakdown
    const waterSources = [
        { name: 'Freshwater (Municipal / Borewell)', vol: totalFreshWater },
        { name: 'Harvested Rainwater', vol: totalRainWater },
        { name: 'Process Recycled Water', vol: totalRecycledWater },
        { name: 'ETP Recovered Water Reused', vol: etpRecovered }
    ];

    const results = {
        calcDate: new Date().toISOString(),
        prodWeight: prodWeight,
        fabricType: s.fabricType || 'cotton',
        weaveType: s.weaveType || 'weaving',
        totalCarbon: totalCarbon,
        totalWater: totalWater,
        carbonPerKg: prodWeight > 0 ? (totalCarbon / prodWeight) : 0,
        waterPerKg: prodWeight > 0 ? (totalWater / prodWeight) : 0,
        netCarbon: netCarbon,
        netCarbonPerKg: netCarbonPerKg,
        totalFreshWater: totalFreshWater,
        totalRainWater: totalRainWater,
        totalRecycledWater: totalRecycledWater,
        totalSavedWater: totalSavedWater,
        carbonSavedRenew: carbonSavedRenew,
        boilerFuelType: boilerFuelType,
        boilerEF: boilerEF,
        stages: stages,
        energySources: energySources,
        waterSources: waterSources,
        gridEF: gridEF,
        gasEF: gasEF,
        renewEF: renewEF,
        otherFuelEF: otherFuelEF
    };

    try {
        localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
    } catch (e) {
        console.error('Error caching calculation results', e);
    }

    return results;
}

/**
 * Get cached results
 */
function getLastCalculationResults() {
    try {
        const stored = localStorage.getItem(RESULTS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        return null;
    }
}
