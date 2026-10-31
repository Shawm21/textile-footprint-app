# Textile Carbon & Water Footprint Assessment System

An enterprise-grade Life Cycle Assessment (LCA) calculation engine and sustainability management platform engineered for composite textile mills, spinning facilities, dye houses, printing operations, and apparel garment manufacturers.

Live Deployment: https://textile-footprint-app.vercel.app

---

## 1. Regulatory & Standards Alignment

The application performs automated Life Cycle Inventory (LCI) aggregation and Life Cycle Impact Assessment (LCIA) conforming to internationally recognized sustainability accounting frameworks:

- ISO 14040:2006: Environmental Management - Life Cycle Assessment - Principles and Framework
- ISO 14044:2006: Environmental Management - Life Cycle Assessment - Requirements and Guidelines
- The Greenhouse Gas Protocol: Corporate Accounting and Reporting Standard (Scopes 1, 2, and 3)
- Higg Materials Sustainability Index (Higg MSI) chemical and process library
- ecoinvent v3.8 lifecycle inventory database
- ZDHC Wastewater Guidelines Version 2.1

Functional Unit: 1.0 kg of finished textile fabric or assembled garment at the factory gate.
System Boundary: Gate-to-Gate industrial manufacturing (Spinning, Fabric Formation, Wet Processing, Printing, Garment Assembly, Effluent Treatment, and Secondary Packaging).

---

## 2. Process Architecture & Manufacturing Stages

The calculator features modular, independently toggleable process segments:

1. Facility Energy & Utilities:
   - National electrical grid emission factors (default: 0.85 kg CO2e/kWh)
   - Natural gas and boiler thermal energy (0.184 kg CO2e/kWh)
   - On-site rooftop solar PV credit (avoided Scope 2 emissions)
   - Auxiliary generator fuels (diesel / heavy fuel oil)

2. Mechanical Spinning (Fiber to Yarn):
   - Blowroom blending, carding, drawing, roving, and ring-frame spinning
   - Mass-balance fiber waste loss accounting (default: 5.0% comber/blowroom tare)
   - Spinning hall humidification and air conditioning energy

3. Yarn Dyeing (Optional Autoclave Module):
   - Cone and package dyeing, pressurized autoclave heating, and RF cone drying
   - Dyes, Glauber's salt, leveling agents, and acid buffers
   - Dedicated yarn liquor ratio modeling (standard 8:1)

4. Fabric Formation (Weaving vs. Knitting):
   - Weaving: Warp beaming and sizing preparation chemistry (modified starch, PVA, CMC, polyacrylates, sizing wax, antistatic agents)
   - Knitting: Un-sized circular and warp knitting (sizing chemicals strictly excluded)
   - Loom drives, air compressors, and sizing cylinder steam

5. Wet Processing - Preparation Chemistry (Pre-Treatment):
   - Sub-processes sequenced in industrial order: Desizing -> Scouring -> Bleaching -> Mercerizing -> Heat Setting
   - Chemical dosing: Caustic soda (NaOH), hydrogen peroxide (H2O2), soda ash, amylase enzymes, non-ionic detergents, organic acids
   - Multi-source water tracking (fresh groundwater, municipal supply, harvested rainwater, recycled process water)

6. Wet Processing - Coloration (Dyeing):
   - Exhaust soft-flow jet dyeing, jiggers, winches, beam dyers, and pad-steam ranges
   - Reactive, disperse, vat, and sulfur dyestuffs
   - Auxiliary exhaustion salts, leveling agents, cationic fixing agents, and soaping detergents
   - Multi-bath rinse water volume formulation: V_total = M_batch * LR * (1 + N_rinse)

7. Wet Processing - Finishing (Chemical & Mechanical):
   - Stenter foulard padding, drying, curing, compacting, sanforizing, and calendering
   - Functional finishes: Micro-emulsion silicone softeners, cationic softeners, crosslinking resins, water repellents, flame retardants

8. Textile Printing (Dedicated Operational Segment):
   - Continuous roll printing: Rotary screen, flatbed screen, digital direct-to-fabric (DTF)
   - Garment placement printing: Carousel screen printing, Direct-to-Garment (DTG), sublimation heat transfer, discharge printing
   - Formulation accounting: Pigment dispersions, plastisol, water-based inks, reactive/disperse inks, polyacrylic binders, thickeners, melamine crosslinkers, puff additives

9. Garment Manufacturing & Apparel Laundry:
   - Fabric spreading, CNC cutting tables, sewing assembly, and finishing irons
   - Cutting scrap loss rate mass-balance (default: 12%, range: 8% to 18%)
   - Industrial garment laundry: Front-load washer-extractors, cellulase bio-polishing enzymes, denim desizing, potassium permanganate, sodium hypochlorite bleach, antichlor neutralization

10. Wastewater Treatment Plant (ETP / ZLD):
    - Coagulation, flocculation, extended aeration, secondary clarification, filter press dewatering, and Reverse Osmosis (RO)
    - Chemical treatment: Polyaluminium chloride (PAC), alum, polyacrylamide flocculants
    - Dewatered chemical sludge disposal carbon footprint (0.50 kg CO2e/kg)
    - Clean permeate water recovery credited back to reduce net mill freshwater extraction

11. Secondary Packaging & Packing Lines:
    - Low-density polyethylene (LDPE) polybags (3.10 kg CO2e/kg)
    - Corrugated cardboard master shipping cartons (0.95 kg CO2e/kg)
    - Kraft paper hangtags and price cards (1.10 kg CO2e/kg)
    - Molded plastic display hangers (2.20 kg CO2e/kg)
    - Packing line conveyor and carton sealer machinery energy

---

## 3. Enterprise Software Architecture

- Hybrid Client-Cloud Persistence: Combines high-speed browser localStorage with cloud-synchronized REST key-value storage (kvdb.io) to ensure multi-terminal access across mill offices without account isolation.
- Central Administrative Console: Dedicated administrative auditing dashboard providing factory-wide batch tracking, cumulative carbon and water accounting, order inspection, and multi-user registry management.
- Dynamic Reporting Engine: Generates formal Lifecycle Assessment (LCA) Technical Methodology Reports in Microsoft Word (.docx) format formatted in Times New Roman with strict black-and-white academic typography and stage-by-stage decrypted mathematical equations.

---

## 4. Local Execution & Deployment

Prerequisites:
- Node.js (version 18 or higher)

Run locally:
```bash
node server.js
```
The server will bind to http://127.0.0.1:8080.

Deploy to Vercel:
```bash
npx vercel --prod
```

---

## 5. Formal Methodology Reference Report

A comprehensive 6-section methodology whitepaper with complete mathematical proofs, mass-balance formulations, and emission factor tables is included in this repository:
- Word Document: Textile_LCA_Methodology_Report.docx
