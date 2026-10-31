const fs = require('fs');
const path = require('path');
const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
    Header, Footer, PageNumber
} = require('docx');

// Strict Black and White Palette (No colors)
const COLOR_BLACK = "000000";
const COLOR_WHITE = "FFFFFF";
const FONT_FAMILY = "Times New Roman";

const blackBorder = { style: BorderStyle.SINGLE, size: 6, color: COLOR_BLACK };
const cellBorders = { top: blackBorder, bottom: blackBorder, left: blackBorder, right: blackBorder };

function createCell(text, isHeader = false, isAlt = false, widthPercent = null) {
    const p = new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 80, after: 80 },
        children: [
            new TextRun({
                text: text,
                bold: isHeader,
                color: COLOR_BLACK,
                size: isHeader ? 20 : 19,
                font: FONT_FAMILY
            })
        ]
    });

    const cellOptions = {
        children: [p],
        borders: cellBorders,
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        shading: { fill: COLOR_WHITE, type: ShadingType.CLEAR }
    };

    if (widthPercent) {
        cellOptions.width = { size: widthPercent, type: WidthType.PERCENTAGE };
    }

    return new TableCell(cellOptions);
}

function createHeading1(title) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 140 },
        children: [
            new TextRun({
                text: title,
                bold: true,
                color: COLOR_BLACK,
                size: 28,
                font: FONT_FAMILY
            })
        ]
    });
}

function createHeading2(title) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 260, after: 100 },
        children: [
            new TextRun({
                text: title,
                bold: true,
                color: COLOR_BLACK,
                size: 24,
                font: FONT_FAMILY
            })
        ]
    });
}

function createHeading3(title) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 180, after: 80 },
        children: [
            new TextRun({
                text: title,
                bold: true,
                color: COLOR_BLACK,
                size: 21,
                font: FONT_FAMILY
            })
        ]
    });
}

function createParagraph(text, isBold = false) {
    return new Paragraph({
        spacing: { before: 60, after: 100, line: 276 },
        children: [
            new TextRun({
                text: text,
                bold: isBold,
                color: COLOR_BLACK,
                size: 22,
                font: FONT_FAMILY
            })
        ]
    });
}

function createBulletItem(title, text) {
    return new Paragraph({
        spacing: { before: 40, after: 60 },
        bullet: { level: 0 },
        children: [
            new TextRun({
                text: title ? title + " " : "",
                bold: true,
                color: COLOR_BLACK,
                size: 21,
                font: FONT_FAMILY
            }),
            new TextRun({
                text: text,
                color: COLOR_BLACK,
                size: 21,
                font: FONT_FAMILY
            })
        ]
    });
}

function createFormula(formulaText, label = null) {
    const children = [];
    if (label) {
        children.push(new TextRun({
            text: label + ": ",
            bold: true,
            color: COLOR_BLACK,
            size: 21,
            font: FONT_FAMILY
        }));
    }
    children.push(new TextRun({
        text: formulaText,
        bold: true,
        color: COLOR_BLACK,
        size: 21,
        font: FONT_FAMILY
    }));
    return new Paragraph({
        spacing: { before: 80, after: 80 },
        indent: { left: 360 },
        children: children
    });
}

function createCallout(title, text) {
    const p1 = new Paragraph({
        spacing: { before: 80, after: 60 },
        children: [
            new TextRun({
                text: "[NOTE] " + title,
                bold: true,
                color: COLOR_BLACK,
                size: 21,
                font: FONT_FAMILY
            })
        ]
    });

    const p2 = new Paragraph({
        spacing: { before: 40, after: 80 },
        children: [
            new TextRun({
                text: text,
                color: COLOR_BLACK,
                size: 20,
                font: FONT_FAMILY
            })
        ]
    });

    const boxBorder = { style: BorderStyle.SINGLE, size: 8, color: COLOR_BLACK };

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        children: [p1, p2],
                        shading: { fill: COLOR_WHITE, type: ShadingType.CLEAR },
                        borders: {
                            left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_BLACK },
                            top: boxBorder,
                            right: boxBorder,
                            bottom: boxBorder
                        },
                        margins: { top: 120, bottom: 120, left: 180, right: 180 }
                    })
                ]
            })
        ]
    });
}

function buildTable(headers, rowsData, widths = null) {
    const tableRows = [];

    // Header Row
    const headerCells = headers.map((h, i) => createCell(h, true, false, widths ? widths[i] : null));
    tableRows.push(new TableRow({ children: headerCells, tableHeader: true }));

    // Data Rows
    rowsData.forEach((row, rIdx) => {
        const isAlt = rIdx % 2 === 1;
        const cells = row.map((c, cIdx) => createCell(c, false, isAlt, widths ? widths[cIdx] : null));
        tableRows.push(new TableRow({ children: cells }));
    });

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows
    });
}

// Build Document
async function generateDocx() {
    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: { font: FONT_FAMILY, size: 22, color: COLOR_BLACK }
                }
            }
        },
        sections: [{
            properties: {
                page: {
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins
                }
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                                new TextRun({
                                    text: "Textile Footprint Calculator | LCA Methodology & Technical Report",
                                    size: 18,
                                    color: COLOR_BLACK,
                                    font: FONT_FAMILY
                                })
                            ]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.SPACE_BETWEEN,
                            children: [
                                new TextRun({
                                    text: "ISO 14040/44 [1, 2] & GHG Protocol [3] Standards Compliant",
                                    size: 18,
                                    color: COLOR_BLACK,
                                    font: FONT_FAMILY
                                }),
                                new TextRun({
                                    text: "   |   Page ",
                                    size: 18,
                                    color: COLOR_BLACK,
                                    font: FONT_FAMILY
                                }),
                                new TextRun({
                                    children: [PageNumber.CURRENT],
                                    size: 18,
                                    color: COLOR_BLACK,
                                    font: FONT_FAMILY
                                })
                            ]
                        })
                    ]
                })
            },
            children: [
                // TITLE BLOCK
                new Paragraph({
                    spacing: { before: 200, after: 80 },
                    alignment: AlignmentType.LEFT,
                    children: [
                        new TextRun({
                            text: "LIFECYCLE ASSESSMENT (LCA) METHODOLOGY & TECHNICAL REFERENCE REPORT",
                            bold: true,
                            color: COLOR_BLACK,
                            size: 32,
                            font: FONT_FAMILY
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { before: 40, after: 200 },
                    alignment: AlignmentType.LEFT,
                    children: [
                        new TextRun({
                            text: "Textile Carbon & Water Footprint Assessment System",
                            bold: true,
                            color: COLOR_BLACK,
                            size: 24,
                            font: FONT_FAMILY
                        })
                    ]
                }),

                // METADATA TABLE
                buildTable(
                    ["Parameter", "Specification / Standard Conformance"],
                    [
                        ["Document Classification", "Technical Whitepaper & Engineering Methodology Report"],
                        ["Standard Alignment", "ISO 14040:2006 [1], ISO 14044:2006 [2], GHG Protocol Corporate Standard (Scopes 1, 2, and 3) [3]"],
                        ["Functional Unit", "1.0 kg of Finished Textile Product (Fabric or Garment) at Factory Gate [1, 2]"],
                        ["System Boundary", "Gate-to-Gate Industrial Manufacturing (Spinning, Weaving/Knitting, Wet Processing, Printing, Garment Assembly, ETP, Packaging) [1, 7]"],
                        ["Target Audience", "Mill Sustainability Managers, LCA Engineers, Textile Compliance Officers, Brands & Buyers"]
                    ],
                    [32, 68]
                ),

                new Paragraph({ spacing: { before: 240, after: 120 } }),

                // SECTION 1
                createHeading1("1. Executive Summary & System Scope"),
                createParagraph("The Textile Carbon & Water Footprint Calculator is an enterprise-grade environmental lifecycle calculation suite engineered specifically for textile processing plants, composite spinning and weaving mills, dye houses, printing facilities, and garment manufacturing units. The software performs automated Life Cycle Inventory (LCI) aggregation and Life Cycle Impact Assessment (LCIA) conforming to ISO 14040:2006 [1] and ISO 14044:2006 [2] across two primary environmental mid-point categories:"),
                createBulletItem("Global Warming Potential (GWP100):", "Expressed in kilograms of carbon dioxide equivalent (kg CO2e). Encompasses all on-site thermal fuel combustions (Scope 1 per GHG Protocol [3]), purchased grid electricity and steam imports (Scope 2 [3]), and supply chain embedded footprints of sizing polymers, dyes, specialty print formulations, auxiliaries, secondary packaging, and chemical sludge treatment (Scope 3 [3])."),
                createBulletItem("Freshwater Consumption & Net Water Footprint:", "Expressed in Litres (L). Quantifies direct groundwater and municipal surface water withdrawals, multi-step rinse cycles, boiler feed water, blanket wash operations, and credits net water reclamation achieved through on-site Effluent Treatment Plants (ETP) and Zero Liquid Discharge (ZLD) systems conforming to ZDHC Wastewater Guidelines [6]."),
                createParagraph("The assessment operates on an 8-stage gate-to-gate trajectory covering the entire physical transformation from incoming raw yarn or sliver to boxed, labeled apparel ready for distribution:"),
                createBulletItem("1. Production & Facility Energy:", "Batch weight, fiber composition blend (cotton, polyester, synthetic blends), factory-wide energy tariffs, and baseline emission factors [3]."),
                createBulletItem("2. Spinning & Yarn Dyeing:", "Mechanical ring-frame spinning energy, waste tare percentages (5.0% baseline [7]), and high-temperature yarn package/hank autoclave dyeing [4]."),
                createBulletItem("3. Fabric Formation (Fabrication):", "Weaving (with warp sizing preparation chemistry [4, 5]) versus knitting operations (strictly excluding sizing per industrial benchmarks [7])."),
                createBulletItem("4. Wet Processing & Chemical Finishing:", "Pre-treatment (desizing, scouring, bleaching, mercerizing, heat setting), batch and continuous dyeing, and performance functional finishes [4, 5]."),
                createBulletItem("5. Textile Printing (Dedicated Segment):", "Independent accounting for continuous fabric printing (rotary screen, flatbed, digital direct-to-fabric) and garment placement embellishments (screen printing, DTG, sublimation, discharge) [4, 5]."),
                createBulletItem("6. Garment Manufacturing & Apparel Laundry:", "Fabric spreading, CAD cutting scrap rates (10-18% [7]), sewing assembly, and industrial denim enzyme bio-polishing, bleach wash, and softening [5, 7]."),
                createBulletItem("7. Wastewater Treatment Plant (ETP/ZLD):", "Physicochemical coagulation, aerobic biological aeration, polyelectrolyte flocculation, chemical sludge output (0.50 kg CO2e/kg [6]), and reverse osmosis water recovery."),
                createBulletItem("8. Secondary Packaging & Packing Lines:", "LDPE polybags [8], corrugated shipping cartons [8], kraft paper hangtags [5], plastic display hangers [8], and packaging conveyor line energy."),

                new Paragraph({ spacing: { before: 200, after: 100 } }),

                // SECTION 2
                createHeading1("2. System Boundaries & Process Segment Decomposition"),
                createParagraph("Table 2.1 defines the formal gate-to-gate lifecycle boundaries, unit operations, and physical resource inputs tracked across each individual segment in accordance with ISO 14044 [2] and textile industrial life cycle literature [7]:"),

                buildTable(
                    ["Process Segment", "Primary Unit Operations", "Key Energy & Chemical Inputs", "Emissions & By-Products [Citations]"],
                    [
                        ["Production & Utilities", "Facility utility allocation, electrical grid intake, boiler combustion", "National grid electricity, natural gas, biomass, rooftop solar PV", "Scope 1 combustion CO2, Scope 2 grid emissions [3]"],
                        ["Spinning & Yarn Dyeing", "Opening, carding, drawing, roving, ring spinning, cone/hank dyeing", "Ring-frame spindle power, autoclave steam, Glauber's salt, reactive/disperse yarn dyes", "Blowroom fly waste, fiber scrap [7], yarn dye effluent [6]"],
                        ["Fabric Formation (Fabrication)", "Sizing preparation, warp beaming, air-jet/rapier weaving or circular knitting", "Loom drive electricity, modified corn starch, PVA, CMC, sizing wax & antistatic", "Warp sizing chemical residues [4, 5] (knitting excludes sizing [7])"],
                        ["Wet Processing & Finishing", "Desizing, scouring, bleaching, mercerizing, exhaust/continuous dyeing, stenter finishing", "Caustic soda (NaOH), H2O2, soda ash, reactive/vat dyes, silicone softeners, stenter gas", "High COD/BOD hot dye wash-off baths, steam exhaust [4, 6]"],
                        ["Textile Printing (Dedicated Segment)", "Rotary screen, flatbed, digital direct-to-fabric, DTG, carousel screen, sublimation, discharge", "Printhead electricity, conveyor dryer curing gas, pigment dispersions, polyacrylic binders, thickeners", "Screen reclamation wastewater, curing exhaust [4, 5]"],
                        ["Garment Assembly & Laundry", "Fabric spreading, cutting tables, sewing lines, fusing, industrial enzyme washing, softening", "Cutting scrap loss (10-18% [7]), sewing machine power, front-load washer steam, cellulase, bleach", "Cut-and-sew fabric scrap offcuts [7], laundry effluent [6]"],
                        ["Effluent Treatment (ETP/ZLD)", "Physicochemical coagulation, biological aeration, sludge pressing, RO filtration", "Aeration blowers, PAC, alum, polyelectrolyte flocculants, RO high-pressure pumps", "Dewatered chemical sludge cake [6], reclaimed permeate water [6]"],
                        ["Packaging Operations", "Garment bagging, carton packing, hangtag tagging, hanger insertion, packing conveyors", "LDPE polybags [8], corrugated cardboard master cartons [8], kraft paper tags [5], PS/PP hangers [8]", "Secondary packaging solid waste at product end-of-life [8]"]
                    ],
                    [20, 28, 28, 24]
                ),

                new Paragraph({ spacing: { before: 140, after: 100 } }),

                createCallout(
                    "Scope Boundary Exclusions (Per Project Specification)",
                    "In strict adherence to the project scope and ISO 14040 comparative constraints [1], primary agricultural fiber cultivation (e.g., raw seed cotton irrigation and pesticides) and synthetic resin petrochemical synthesis (e.g., PTA/MEG polymerization into polyester chips) are excluded to concentrate strictly on factory-level processing emissions. Furthermore, inbound and outbound long-distance transportation (freight trucking, ocean freight, air cargo) has been eliminated to maintain focused manufacturing inventory rigor."
                ),

                new Paragraph({ spacing: { before: 200, after: 100 } }),

                // SECTION 3
                createHeading1("3. Mathematical Formulations & Mass-Balance Models (Decrypted Stage-by-Stage)"),
                createParagraph("The computation engine in js/calculator.js executes deterministic mass-balance, stoichiometric, and energy allocation algorithms aligned with ISO 14044 [2], GHG Protocol [3], and empirical textile manufacturing models [4, 7]. Below is the complete mathematical decryption broken down stage by stage across all production segments:"),

                createHeading2("3.1 Facility Energy Factors & Baseline Facility Emissions"),
                createParagraph("All process stages reference facility-level emission factors determined by the mill's local electrical grid, utility boiler fuels, and onsite green power generation assets:"),
                createBulletItem("GridEF:", "Grid Electricity Greenhouse Gas Emission Factor (kg CO2e/kWh, default: 0.85)."),
                createBulletItem("GasEF:", "Natural Gas / Thermal Boiler Fuel Emission Factor (kg CO2e/kWh, default: 0.184 based on IPCC Guidelines [3])."),
                createBulletItem("RenewEF:", "On-site Renewable Solar PV / Green Power Factor (kg CO2e/kWh, default: 0.00 per GHG Protocol Scope 2 [3])."),
                createBulletItem("OtherEF:", "Auxiliary Fuel (Industrial Heavy Fuel Oil / Diesel) Factor (kg CO2e/kWh, default: 0.320 [3])."),
                createParagraph("Baseline General Facility Energy Overhead (lighting, administration, facility HVAC):"),
                createFormula("CF_general_energy = (E_gen,grid * GridEF) + (E_gen,gas * GasEF) + (E_gen,renew * RenewEF) + (E_gen,other * OtherEF)   [kg CO2e]", "Baseline Carbon"),
                createFormula("WF_general_energy = 0   [Litres]", "Baseline Water"),

                createHeading2("3.2 Stage 1: Mechanical Spinning (Fiber to Yarn)"),
                createParagraph("Process Scope: Bale opening, blowroom blending, carding, drawing, roving, ring spinning / open-end rotor spinning, and cone winding. Activation state is governed by toggle sigma_spin in {0, 1} (state parameter: includeSpinning)."),
                createFormula("CF_spin = sigma_spin * [ (E_spin,grid * GridEF) + (E_spin,gas * GasEF) + (E_spin,renew * RenewEF) ]   [kg CO2e]", "Spinning Carbon"),
                createFormula("WF_spin = sigma_spin * V_spin,water   [Litres]", "Spinning Water"),
                createParagraph("Where V_spin,water accounts for humidification spray water, atomizers, and fiber conditioning moisture (V_rain = 0, V_recycled = 0)."),
                createParagraph("Mass-Balance & Fiber Waste Loss Formulation (Calibrated against Muthu [7]):"),
                createFormula("M_loss,spin = M_batch * ( Loss_spin% / 100 )   [kg blowroom & comber scrap]", "Waste Scrap"),
                createFormula("M_yarn,produced = M_batch - M_loss,spin   [kg net usable yarn]", "Net Yarn"),
                createParagraph("Where Loss_spin% defaults to 5.0% based on industrial ring-spinning comber noil and blowroom droppings (typical mill operating range: 2.0% to 10.0% [7])."),

                createHeading2("3.3 Stage 1b: Yarn Dyeing (Package & Hank Dyeing - Optional Module)"),
                createParagraph("Process Scope: Yarn package winding on perforated tubes, pressurized autoclave dyeing, hydro-extraction, and RF cone drying. Activation is governed by sigma_yd = sigma_spin * 1_chkYarnDyeing in {0, 1}."),
                createFormula("CF_yd,chems = SUM [ Q_c * EF_c ]   [kg CO2e]", "Chemical Carbon"),
                createParagraph("Where Q_c is the dosed chemical mass (kg) and EF_c is the cradle-to-gate factor (Reactive Yarn Dyes: 3.70 [4], Disperse: 4.20 [4], Glauber's Salt: 0.25 [5], Leveling Agent: 2.50 [4], Acetic Acid: 0.70 [5] kg CO2e/kg)."),
                createFormula("CF_yarn_dye = sigma_yd * [ (E_yd,grid * GridEF) + (E_yd,gas * GasEF) + (E_yd,renew * RenewEF) + CF_yd,chems ]   [kg CO2e]", "Yarn Dye Carbon"),
                createFormula("V_bath,yd = M_yarn * LR_yarn   [Litres]", "Bath Volume"),
                createFormula("WF_yarn_dye = sigma_yd * ( V_yd,fresh + V_yd,recycled )   [Litres]", "Yarn Dye Water"),
                createParagraph("Where LR_yarn represents the yarn package liquor ratio (default 8:1 based on Higg MSI package dyeing benchmarks [4])."),

                createHeading2("3.4 Stage 2: Fabric Formation (Fabrication: Weaving vs. Knitting)"),
                createParagraph("Process Scope: Warping, sizing beam preparation, and air-jet/rapier weaving OR circular/warp knitting. Activation state is governed by sigma_fab in {0, 1} (state parameter: includeFabrication)."),
                createParagraph("Decrypted Sizing Chemical Carbon Formulation:"),
                createFormula("CF_fab,chems = delta_weave * SUM [ Q_w * EF_w ]   [kg CO2e]", "Sizing Carbon"),
                createParagraph("Process logic differentiator: If Knitting (delta_weave = 0), sizing chemistry is strictly zero (CF_fab,chems = 0). If Weaving (delta_weave = 1), sizing chemicals are computed from user recipes (Modified Starch @ 1.20 [5], PVA @ 2.80 [4], CMC @ 2.10 [5], Polyacrylates @ 3.00 [5], Sizing Wax @ 2.40 [4], Antistatic @ 2.20 [5] kg CO2e/kg)."),
                createFormula("CF_fab = sigma_fab * [ (E_fab,grid * GridEF) + (E_fab,gas * GasEF) + (E_fab,renew * RenewEF) + CF_fab,chems ]   [kg CO2e]", "Fabrication Carbon"),
                createFormula("WF_fab = sigma_fab * V_fab,water   [Litres]", "Fabrication Water"),

                createHeading2("3.5 Stage 3: Wet Processing - Pre-Treatment (Preparation Chemistry)"),
                createParagraph("Process Scope: Continuous/batch preparation ranges. Sequence of operations applied: Desizing -> Scouring -> Bleaching -> Mercerizing -> Heat Setting. Governed by sigma_wet in {0, 1} (state parameter: includeWetProcessing)."),
                createFormula("CF_pre,chems = SUM [ Q_p * EF_p ]   [kg CO2e]", "Pre-Treatment Chems"),
                createParagraph("Where p spans recipe auxiliaries (Caustic Soda NaOH @ 1.20 [5], Hydrogen Peroxide H2O2 @ 0.80 [5], Soda Ash @ 1.05 [5], Amylase Enzyme @ 2.50 [7], Surfactants @ 2.00 [5], Stabilizer @ 1.80 [4], Organic Acid @ 0.70 [5] kg CO2e/kg)."),
                createFormula("CF_pretreat = sigma_wet * [ (E_pre,grid * GridEF) + (E_pre,gas * GasEF) + (E_pre,renew * RenewEF) + CF_pre,chems ]   [kg CO2e]", "Pre-Treat Carbon"),
                createFormula("WF_pretreat = sigma_wet * ( V_pre,fresh + V_pre,rain + V_pre,recycled )   [Litres]", "Pre-Treat Water"),

                createHeading2("3.6 Stage 4: Wet Processing - Dyeing (Exhaust & Continuous Coloration)"),
                createParagraph("Process Scope: Soft-flow jet, jigger, winch, pad-steam ranges, soaping wash-off, and rinse boxes. Governed by sigma_wet in {0, 1}."),
                createFormula("CF_dye,chems = SUM [ Q_d * EF_d ]   [kg CO2e]", "Dyeing Chems"),
                createParagraph("Where d includes dyestuffs (Reactive @ 3.70 [4], Disperse @ 4.20 [4], Vat @ 4.80 [5], Sulfur @ 2.50 [7]) and auxiliaries (Glauber's salt @ 0.25 [5], Common salt @ 0.23 [5], Leveling @ 2.50 [4], Fixing @ 2.80 [5], Soaping @ 1.80 [5], Hydrosulphite @ 1.50 [5] kg CO2e/kg)."),
                createFormula("CF_dye = sigma_wet * [ (E_dye,grid * GridEF) + (E_dye,gas * GasEF) + (E_dye,renew * RenewEF) + CF_dye,chems ]   [kg CO2e]", "Dyeing Carbon"),
                createParagraph("Liquor Ratio & Multi-Bath Water Volume Formulation (Calibrated against Higg MSI [4] and Muthu [7]):"),
                createFormula("V_bath = M_batch * LR   [Litres]", "Primary Bath"),
                createFormula("V_dye,total = M_batch * LR * ( 1 + N_rinse )   [Litres]", "Cumulative Dye Water"),
                createFormula("WF_dye = sigma_wet * ( V_dye,fresh + V_dye,rain + V_dye,recycled )   [Litres]", "Dyeing Water Footprint"),

                createHeading2("3.7 Stage 5: Wet Processing - Finishing (Chemical & Mechanical)"),
                createParagraph("Process Scope: Chemical foulard padder, stenter drying, thermal curing, compacting, sanforizing, and calendering. Governed by sigma_wet in {0, 1}."),
                createFormula("CF_fin,chems = SUM [ Q_f * EF_f ]   [kg CO2e]", "Finishing Chems"),
                createParagraph("Where f includes silicone softeners @ 3.80 [4], cationic softeners @ 2.80 [5], DMDHEU resins @ 3.20 [5], water repellents @ 4.50 [5], and flame retardants @ 3.90 [5] kg CO2e/kg."),
                createFormula("CF_fin = sigma_wet * [ (E_fin,grid * GridEF) + (E_fin,gas * GasEF) + (E_fin,renew * RenewEF) + CF_fin,chems ]   [kg CO2e]", "Finishing Carbon"),
                createFormula("WF_fin = sigma_wet * ( V_fin,fresh + V_fin,rain + V_fin,recycled )   [Litres]", "Finishing Water"),

                createHeading2("3.8 Stage 6: Textile Printing (Dedicated Segment: Roll & Garment)"),
                createParagraph("Process Scope: Rotary screen, flatbed screen, digital DTF roll printing, carousel apparel screen printing, direct-to-garment (DTG), sublimation heat transfer, and discharge printing. Governed by dedicated toggle sigma_print in {0, 1} (state parameter: includePrinting)."),
                createFormula("CF_print,chems = SUM [ Q_i * EF_i ]   [kg CO2e]", "Printing Inks & Binders"),
                createParagraph("Where i includes pigment paste @ 5.00 [4], plastisol @ 4.80 [5], water-based inks @ 3.50 [5], reactive digital ink @ 4.20 [4], sublimation ink @ 5.20 [4], DTG ink @ 5.60 [4], discharge paste @ 3.20 [5], polyacrylic binder @ 3.20 [5], thickener @ 1.50 [5], melamine crosslinker @ 3.00 [5], urea @ 1.30 [5], foil adhesive @ 3.80 [5], puff additive @ 4.10 [5] kg CO2e/kg."),
                createFormula("CF_print = sigma_print * [ (E_print,grid * GridEF) + (E_print,gas * GasEF) + (E_print,renew * RenewEF) + CF_print,chems ]   [kg CO2e]", "Printing Carbon"),
                createFormula("WF_print = sigma_print * ( V_print,fresh + V_print,recycled )   [Litres]", "Printing Water"),
                createParagraph("Where water accounts for printing blanket washers, screen wash-off, squeegee cleaning, and ager steamers."),

                createHeading2("3.9 Stage 7: Garment Manufacturing & Apparel Laundry"),
                createParagraph("Process Scope: Fabric spreading, automated CNC cutting, sewing assembly, buttoning, industrial denim bio-washing, enzyme abrasion, and softening washes. Governed by dedicated toggle sigma_garment in {0, 1} (state parameter: includeGarments)."),
                createParagraph("Mass-Balance & Cutting Scrap Rate Formulation (Calibrated against Muthu [7]):"),
                createFormula("M_scrap = M_fabric * ( Loss_cut% / 100 )   [kg cutting scrap offcuts]", "Cutting Scrap"),
                createFormula("M_apparel = M_fabric * ( 1 - Loss_cut% / 100 )   [kg assembled apparel]", "Finished Apparel"),
                createParagraph("Where Loss_cut% defaults to 12% based on garment marker nesting benchmarks (standard industrial range: 8% to 18% [7])."),
                createParagraph("Energy Aggregation Formulation:"),
                createFormula("E_garment,grid = E_cut_sew,grid + E_wash,grid   [kWh]", "Grid Electricity"),
                createFormula("E_garment,gas = E_wash,gas   [kWh]", "Natural Gas"),
                createFormula("E_garment,renew = E_wash,renew   [kWh]", "Renewable Solar"),
                createFormula("CF_wash,chems = SUM [ Q_g * EF_g ]   [kg CO2e]", "Laundering Chems"),
                createParagraph("Where g includes cellulase bio-wash enzymes @ 2.60 [7], denim desize amylase @ 2.50 [7], potassium permanganate @ 2.40 [5], sodium hypochlorite @ 1.40 [5], antichlor bisulfite @ 0.90 [5], and garment silicone softeners @ 3.80 [4] kg CO2e/kg."),
                createFormula("CF_garment = sigma_garment * [ (E_garment,grid * GridEF) + (E_garment,gas * GasEF) + (E_garment,renew * RenewEF) + CF_wash,chems ]   [kg CO2e]", "Garment Carbon"),
                createFormula("WF_garment = sigma_garment * ( V_wash,fresh + V_wash,recycled )   [Litres]", "Garment Water"),

                createHeading2("3.10 Stage 8: Wastewater Treatment (ETP / ZLD)"),
                createParagraph("Process Scope: Physicochemical coagulation, dissolved air flotation (DAF), aerobic biological aeration, secondary clarification, plate-and-frame sludge filter pressing, and Reverse Osmosis (RO) permeate reclamation conforming to ZDHC Wastewater Guidelines [6]. Governed by dedicated toggle sigma_etp in {0, 1} (state parameter: includeEtp)."),
                createFormula("CF_etp,chems = SUM [ Q_e * EF_e ]   [kg CO2e]", "Coagulant / Flocculant"),
                createParagraph("Where e includes PAC @ 0.85 [6], alum @ 0.45 [5], and polyacrylamide flocculants @ 2.90 [5, 6] kg CO2e/kg."),
                createFormula("CF_sludge = M_sludge * EF_sludge   [kg CO2e]", "Sludge Disposal Carbon"),
                createParagraph("Where M_sludge is the dry sludge mass (kg) and EF_sludge = 0.50 kg CO2e/kg dry cake based on hazardous landfill and secure incineration LCI data [6]."),
                createFormula("CF_etp = sigma_etp * [ (E_etp,grid * GridEF) + (E_etp,gas * GasEF) + CF_etp,chems + CF_sludge ]   [kg CO2e]", "ETP Carbon"),
                createParagraph("Consumptive Water Balance & Permeate Credit: Direct consumptive water use by the ETP stage is zero (WF_etp = 0). Clean permeate water recovered through reverse osmosis (V_recovered,ETP) is credited back to the factory water balance, directly offsetting freshwater extraction [6]."),

                createHeading2("3.11 Stage 9: Secondary Packaging Materials & Packing Machinery"),
                createParagraph("Process Scope: Garment folding, polybag bagging, carton packing, hangtag ticketing, hanger placement, and carton conveyor lines. (Long-distance logistics transport has been removed per project specifications). Governed by sigma_pack in {0, 1} (state parameter: includePackaging)."),
                createFormula("CF_pack,materials = (M_plastic * EF_plastic) + (M_carton * EF_carton) + (M_tags * EF_tags) + (M_hangers * EF_hangers)   [kg CO2e]", "Materials Carbon"),
                createParagraph("Where material emission factors are: Virgin LDPE Polybags @ 3.10 [8], Corrugated Cartons @ 0.95 [8], Kraft Paper Tags @ 1.10 [5], and Molded Plastic Hangers (PS/PP) @ 2.20 [8] kg CO2e/kg."),
                createFormula("CF_pack,machinery = (E_pack,grid * GridEF) + (E_pack,gas * GasEF)   [kg CO2e]", "Machinery Carbon"),
                createFormula("CF_pack = sigma_pack * ( CF_pack,materials + CF_pack,machinery )   [kg CO2e]", "Packaging Carbon"),

                createHeading2("3.12 Global Lifecycle Synthesis & Environmental Impact Indicators"),
                createParagraph("The software aggregates individual stage outputs into enterprise-level lifecycle indicators conforming to ISO 14044 [2]:"),
                createFormula("CF_total = CF_general_energy + CF_spin + CF_yarn_dye + CF_fab + CF_pretreat + CF_dye + CF_fin + CF_print + CF_garment + CF_etp + CF_pack   [kg CO2e]", "Total Carbon Footprint"),
                createFormula("CI = CF_total / M_product   [kg CO2e / kg finished fabric or garment]", "Specific Carbon Intensity"),
                createFormula("WF_gross = SUM [ WF_stages ] = WF_spin + WF_yarn_dye + WF_fab + WF_pretreat + WF_dye + WF_fin + WF_print + WF_garment   [Litres]", "Gross Water Footprint"),
                createFormula("WF_net = WF_gross - ( sigma_etp * V_recovered,ETP )   [Litres]", "Net Consumptive Water Footprint"),
                createFormula("WI = WF_net / M_product   [L / kg finished fabric or garment]", "Specific Water Intensity"),
                createFormula("CarbonSaved_renew = E_total,renew * MAX( 0, GridEF - RenewEF )   [kg CO2e]", "Avoided Scope 2 Emissions"),
                createFormula("V_saved,water = V_total,rain + V_total,recycled + ( sigma_etp * V_recovered,ETP )   [Litres]", "Conserved Water Volume"),

                new Paragraph({ spacing: { before: 200, after: 100 } }),

                // SECTION 4
                createHeading1("4. Default Emission Factor Inventory & Data Sources"),
                createParagraph("All emission factors implemented throughout the software are synthesized from verified lifecycle inventory databases (ecoinvent v3 [5], Higg MSI [4], 2006 IPCC Guidelines [3], ZDHC [6], Muthu [7], and industry technical eco-profiles [8])."),

                createHeading2("4.1 Energy Utilities & Combustibles"),
                buildTable(
                    ["Energy Source", "Default Factor", "Unit", "Primary Data Source [Citation]"],
                    [
                        ["National Grid Electricity", "0.85", "kg CO2e / kWh", "IEA / Department of Environment (Regional Grid Average) [3]"],
                        ["Natural Gas (Boilers / Stenters)", "0.184", "kg CO2e / kWh", "2006 IPCC Guidelines for National GHG Inventories [3]"],
                        ["Renewable Solar PV / Green Power", "0.00", "kg CO2e / kWh", "GHG Protocol Scope 2 Market-Based Accounting [3]"],
                        ["Heavy Fuel Oil / Industrial Diesel", "0.320", "kg CO2e / kWh", "2006 IPCC Guidelines / DEFRA [3]"]
                    ],
                    [35, 20, 20, 25]
                ),

                new Paragraph({ spacing: { before: 120, after: 60 } }),

                createHeading2("4.2 Weaving Sizing Chemistry"),
                buildTable(
                    ["Chemical Compound", "Default EF (kg CO2e/kg)", "Primary Process Function", "Primary Data Source [Citation]"],
                    [
                        ["Modified / Corn Starch", "1.20", "Natural/modified polymer sizing agent", "ecoinvent v3 Database [5]"],
                        ["Polyvinyl Alcohol (PVA)", "2.80", "Synthetic high-adhesion sizing agent", "Higg Materials Sustainability Index (Higg MSI) [4]"],
                        ["Carboxymethyl Cellulose (CMC)", "2.10", "Cellulosic sizing derivative", "ecoinvent v3 Database [5]"],
                        ["Polyacrylate / Acrylic Size", "3.00", "Synthetic binder for fine warp filaments", "ecoinvent v3 Database [5]"],
                        ["Sizing Wax & Lubricant", "2.40", "Yarn lubricity and friction modifier", "Higg Materials Sustainability Index (Higg MSI) [4]"],
                        ["Antistatic Agent", "2.20", "Friction reducer & static eliminator", "ecoinvent v3 Database [5]"]
                    ],
                    [30, 20, 28, 22]
                ),

                new Paragraph({ spacing: { before: 120, after: 60 } }),

                createHeading2("4.3 Pre-Treatment & Bleaching Chemistry"),
                buildTable(
                    ["Chemical Compound", "Default EF (kg CO2e/kg)", "Primary Process Function", "Primary Data Source [Citation]"],
                    [
                        ["Caustic Soda (NaOH, 100%)", "1.20", "Alkaline scouring, mercerization", "Euro Chlor / ecoinvent v3 [5]"],
                        ["Hydrogen Peroxide (H2O2, 50%)", "0.80", "Eco-friendly oxidative bleaching", "CEFIC / ecoinvent v3 [5]"],
                        ["Soda Ash (Na2CO3)", "1.05", "Alkaline buffering & pH control", "Solvay / ecoinvent v3 [5]"],
                        ["Desizing Enzyme (Amylase)", "2.50", "Biodegradable starch breakdown", "Muthu / Industrial Enzyme LCI [7]"],
                        ["Wetting Agent / Surfactants", "2.00", "Non-ionic scouring detergent", "ERASM / ecoinvent v3 [5]"],
                        ["Peroxide Stabilizer", "1.80", "Silicate/organic buffer against pinholes", "Higg Materials Sustainability Index [4]"],
                        ["Organic Neutralizing Acid", "0.70", "Acetic/citric neutralizing post-scour", "ecoinvent v3 Database [5]"]
                    ],
                    [30, 20, 28, 22]
                ),

                new Paragraph({ spacing: { before: 120, after: 60 } }),

                createHeading2("4.4 Coloration & Dyeing Chemistry"),
                buildTable(
                    ["Chemical Compound", "Default EF (kg CO2e/kg)", "Primary Process Function", "Primary Data Source [Citation]"],
                    [
                        ["Reactive Dye (Cellulosics)", "3.70", "Trichromatic cotton coloration", "Higg Materials Sustainability Index (Higg MSI) [4]"],
                        ["Disperse Dye (Synthetics)", "4.20", "High-temperature polyester dye", "Higg Materials Sustainability Index (Higg MSI) [4]"],
                        ["Vat Dye (Indigo / High Fastness)", "4.80", "Denim yarn & high-fastness cellulosics", "ecoinvent v3 Database [5]"],
                        ["Sulfur Dye", "2.50", "Economical dark cotton shades", "Muthu / Textile Coloration LCI [7]"],
                        ["Glauber's Salt (Na2SO4)", "0.25", "Exhaustion promoting electrolyte", "ecoinvent v3 Database [5]"],
                        ["Common Salt (NaCl)", "0.23", "Exhaustion promoting electrolyte", "ecoinvent v3 Database [5]"],
                        ["Yarn Leveling Agent", "2.50", "Uniform package core penetration", "Higg Materials Sustainability Index [4]"],
                        ["Dye Fixing Agent", "2.80", "Cationic polyquaternary wet-fastness fixative", "ecoinvent v3 Database [5]"],
                        ["Soaping Agent", "1.80", "Oligomer & hydrolyzed dye wash-off", "ERASM / ecoinvent v3 [5]"],
                        ["Sodium Hydrosulphite", "1.50", "Reduction clearing reducing agent", "ecoinvent v3 Database [5]"]
                    ],
                    [30, 20, 28, 22]
                ),

                new Paragraph({ spacing: { before: 120, after: 60 } }),

                createHeading2("4.5 Textile Printing Inks & Auxiliaries (Dedicated Segment)"),
                buildTable(
                    ["Printing Material", "Default EF (kg CO2e/kg)", "Application Scope", "Primary Data Source [Citation]"],
                    [
                        ["Pigment Paste / Dispersion", "5.00", "Rotary screen & digital pigment printing", "Higg MSI / ETAD Technical Notes [4]"],
                        ["Plastisol Screen Ink", "4.80", "Apparel screen placement prints", "ecoinvent v3 Database [5]"],
                        ["Water-Based Screen Ink", "3.50", "Eco-friendly breathable apparel print", "ecoinvent v3 Database [5]"],
                        ["Reactive Printing Ink", "4.20", "Direct-to-fabric digital roll printing", "Higg Materials Sustainability Index [4]"],
                        ["Disperse / Sublimation Ink", "5.20", "Polyester transfer & direct sublimation", "Higg Materials Sustainability Index [4]"],
                        ["Direct-to-Garment (DTG) Ink", "5.60", "Piezo digital inkjet t-shirt printing", "Higg MSI / Digital Printing LCI [4]"],
                        ["Discharge Printing Paste", "3.20", "Color extraction on dyed apparel", "ecoinvent v3 Database [5]"],
                        ["Polyacrylic Binder", "3.20", "Polymer film adhesion to fiber substrate", "PlasticsEurope / ecoinvent v3 [5]"],
                        ["Synthetic Thickener / Alginate", "1.50", "Paste rheology & viscosity regulator", "ecoinvent v3 Database [5]"],
                        ["Melamine Crosslinker / Fixer", "3.00", "Thermal crosslinking wash-fastness", "ecoinvent v3 Database [5]"],
                        ["Urea (Moisture Agent)", "1.30", "Moisture retention during steam fixation", "ecoinvent v3 Database [5]"],
                        ["Foil & Flock Adhesive", "3.80", "Metallic foil embellishment", "ecoinvent v3 Database [5]"],
                        ["3D Puff Additive", "4.10", "Thermal expansion microcapsules", "ecoinvent v3 Database [5]"]
                    ],
                    [30, 20, 28, 22]
                ),

                new Paragraph({ spacing: { before: 120, after: 60 } }),

                createHeading2("4.6 Apparel Laundering & Garment Washing Chemistry"),
                buildTable(
                    ["Chemical Agent", "Default EF (kg CO2e/kg)", "Primary Process Function", "Primary Data Source [Citation]"],
                    [
                        ["Cellulase Enzyme (Bio-wash)", "2.60", "Micro-fibril removal, stone-wash effect", "Muthu / Industrial Enzyme LCA [7]"],
                        ["Denim Desizing Amylase", "2.50", "Size removal from woven denim garments", "Muthu / Industrial Enzyme LCI [7]"],
                        ["Potassium Permanganate (KMnO4)", "2.40", "Localized spray fading / whisker bleaching", "ecoinvent v3 Database [5]"],
                        ["Sodium Hypochlorite (NaOCl)", "1.40", "Chlorine decolorization denim wash", "Euro Chlor / ecoinvent v3 [5]"],
                        ["Sodium Bisulfite (Antichlor)", "0.90", "Neutralization of residual chlorine", "ecoinvent v3 Database [5]"],
                        ["Garment Silicone Softener", "3.80", "Hand feel, drape, and surface smoothing", "Higg Materials Sustainability Index [4]"],
                        ["Cationic Fatty Acid Softener", "2.80", "Standard apparel fabric softener", "ERASM / ecoinvent v3 [5]"]
                    ],
                    [30, 20, 28, 22]
                ),

                new Paragraph({ spacing: { before: 120, after: 60 } }),

                createHeading2("4.7 Effluent Treatment Plant (ETP) Chemicals & By-Products"),
                buildTable(
                    ["Item / Material", "Default Factor", "Unit", "Primary Data Source [Citation]"],
                    [
                        ["Polyaluminium Chloride (PAC)", "0.85", "kg CO2e / kg", "ZDHC Wastewater Conformance Guidelines [6]"],
                        ["Alum (Aluminium Sulphate)", "0.45", "kg CO2e / kg", "ecoinvent v3 Database [5]"],
                        ["Polyacrylamide Flocculant", "2.90", "kg CO2e / kg", "ecoinvent v3 / ZDHC Guidelines [5, 6]"],
                        ["Dewatered Chemical Sludge", "0.50", "kg CO2e / kg dry sludge", "ZDHC Guidelines / Waste Landfill LCI [6]"]
                    ],
                    [35, 20, 20, 25]
                ),

                new Paragraph({ spacing: { before: 120, after: 60 } }),

                createHeading2("4.8 Secondary Packaging Materials"),
                buildTable(
                    ["Packaging Material", "Default EF (kg CO2e/kg)", "Primary Application", "Primary Data Source [Citation]"],
                    [
                        ["Virgin LDPE Polybags", "3.10", "Individual polybags & outer wrap", "PlasticsEurope Eco-profiles [8]"],
                        ["Corrugated Cardboard Box", "0.95", "Shipping master cartons", "FEFCO European Corrugated Database [8]"],
                        ["Paper Hangtags & Inserts", "1.10", "Brand tags & card stiffeners", "ecoinvent v3 Database [5]"],
                        ["Molded Plastic Hangers (PP/PS)", "2.20", "Store-ready display hangers", "PlasticsEurope Eco-profiles [8]"]
                    ],
                    [30, 20, 28, 22]
                ),

                new Paragraph({ spacing: { before: 200, after: 100 } }),

                // SECTION 5
                createHeading1("5. Software Architecture & Cross-Device Cloud Synchronization"),
                createParagraph("The software implements a hybrid client-cloud persistence architecture designed for enterprise mill operations across disparate terminals:"),
                createBulletItem("Distributed State Model:", "To avoid account and order isolation when sustainability managers switch computers or mobile devices, local client storage is automatically paired with a cloud-hosted REST key-value repository (kvdb.io)."),
                createBulletItem("Conflict-Free Merge Engine:", "Incoming cloud user lists and order databases are merged into local storage using unique key mapping (UUIDv4 for orders, lowercase usernames for accounts). This ensures multi-user registrations from other factory workstations appear instantaneously in the Central Mill Administration Console."),
                createBulletItem("Guaranteed Administrator Authentication:", "The primary system administrator credentials (admin / 1234) are protected by an in-memory fallback verification routine that self-heals corrupted storage states and guarantees uninterrupted auditing access."),

                new Paragraph({ spacing: { before: 200, after: 100 } }),

                // SECTION 6
                createHeading1("6. Formal References & Bibliographic Citations"),
                createParagraph("The following eight references constitute the foundational regulatory frameworks, lifecycle inventory databases, and textile engineering literature directly utilized in the design, boundary definition, and emission factor library of this calculator:"),
                createBulletItem("[1]", "International Organization for Standardization (ISO). (2006). Environmental Management — Life Cycle Assessment — Principles and Framework (ISO Standard No. 14040:2006). Geneva, Switzerland."),
                createBulletItem("[2]", "International Organization for Standardization (ISO). (2006). Environmental Management — Life Cycle Assessment — Requirements and Guidelines (ISO Standard No. 14044:2006). Geneva, Switzerland."),
                createBulletItem("[3]", "World Resources Institute (WRI), World Business Council for Sustainable Development (WBCSD), & IPCC. (2004-2006). The Greenhouse Gas Protocol: A Corporate Accounting and Reporting Standard (Revised Edition) & 2006 IPCC Guidelines for National Greenhouse Gas Inventories (Volume 2: Energy). Washington, D.C. / IGES, Japan."),
                createBulletItem("[4]", "Cascale / Sustainable Apparel Coalition (SAC). (2021). Higg Materials Sustainability Index (Higg MSI) Methodology Document, Version 3.4. San Francisco, CA."),
                createBulletItem("[5]", "Wernet, G., Bauer, C., Steubing, B., Reinhard, J., Moreno-Ruiz, E., & Weidema, B. (2016). The ecoinvent database version 3: overview and methodology. The International Journal of Life Cycle Assessment, 21(9), 1218–1230."),
                createBulletItem("[6]", "Zero Discharge of Hazardous Chemicals (ZDHC) Foundation. (2021). ZDHC Wastewater Guidelines: Manufacturing Restricted Substances List (MRSL) & Wastewater Conformance, Version 2.1. Amsterdam, Netherlands."),
                createBulletItem("[7]", "Muthu, S. S. (Ed.). (2020). Assessing the Environmental Impact of Textiles and the Clothing Supply Chain (2nd ed.). Woodhead Publishing / Elsevier."),
                createBulletItem("[8]", "PlasticsEurope & FEFCO. (2021-2022). Eco-profiles and Environmental Product Declarations of the European Plastics Industry (LDPE) & European Database for Corrugated Board Life Cycle Studies. Brussels, Belgium.")
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    
    // Save to project workspace
    const projectPath = path.join(__dirname, 'Textile_LCA_Methodology_Report.docx');
    fs.writeFileSync(projectPath, buffer);
    console.log(`Document saved successfully to project: ${projectPath} (${buffer.length} bytes)`);

    // Save copy to artifact directory as well
    const artifactDir = 'C:\\Users\\khsha\\.gemini\\antigravity\\brain\\bff9be40-021c-4bb0-8eff-0e2137090f3a';
    if (fs.existsSync(artifactDir)) {
        const artifactDocx = path.join(artifactDir, 'Textile_LCA_Methodology_Report.docx');
        fs.writeFileSync(artifactDocx, buffer);
        console.log(`Document copy saved to artifacts directory: ${artifactDocx}`);
    }
}

generateDocx().catch(err => {
    console.error('Error generating docx:', err);
    process.exit(1);
});
