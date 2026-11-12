# Engineering Specification: 1–4 Unit Rental Property & ADU Investment Analyzer

## 1. System Overview & Objectives
Build a client-facing teaser and an admin/VIP-gated investment underwriting engine for `InsiderMortgage.com`.
The tool evaluates 1- to 4-unit residential investment properties (Single-Family, Duplex, Triplex, Fourplex), supports unit-level rent schedules, and models:
- Year 1 operating pro-forma (NOI, debt service, net cash flow).
- 10-year compounding equity, property appreciation, and rent growth.
- Exit liquidation proceeds net of 5% transaction friction.
- 5-year and 10-year Total ROI and annualized Internal Rate of Return (IRR).
- Interactive "What-If" modules: Future Refinancing and ADU addition.

### Architectural Constraints
* **Compute Layer:** 100% client-side deterministic TypeScript/JavaScript. Runs in 0 ms with $0.00 backend/AI token cost.
* **Routing:**
  * Public Route: `/tools/rental-analyzer` (Lead magnet showing Year 1 snapshot).
  * Admin / VIP Route: `/admin/tools/rental-analyzer` (Full 10-year pro-forma, ADU/Refi modules, and export controls).
* **Target Audience:** Rakesh Jain, David Sider, internal loan originators, and invited real estate agent partners.

---

## 2. Mathematical Definitions & Financial Rules

### 2.1 Financing & Amortization
* **Purchase Price ($P$):** Acquisition price.
* **Down Payment ($DP$):** $P \times D$ *(where $D$ = Down payment percentage, e.g., 0.25)*.
* **Loan Amount ($L$):** $P - DP$.
* **Monthly Interest Rate ($r$):** $\frac{\text{Annual Interest Rate}}{12}$.
* **Monthly Debt Service ($PMT$):**
  $$PMT = L \times \frac{r(1 + r)^n}{(1 + r)^n - 1} \quad \text{where } n = 360 \text{ (30-year fixed)}$$
* **Principal & Interest Breakdown:**
  $$\text{Interest}_m = \text{Balance}_{m-1} \times r$$
  $$\text{Principal}_m = PMT - \text{Interest}_m$$
  $$\text{Balance}_m = \text{Balance}_{m-1} - \text{Principal}_m$$

### 2.2 Dynamic 1–4 Unit Rent Aggregation
* **Unit Schedule:** The user specifies unit count $k \in \{1, 2, 3, 4\}$.
* **Total Monthly Rent ($R_{\text{total}}$):**
  $$R_{\text{total}} = \sum_{i=1}^k R_i$$
* **Gross Scheduled Rent ($GSR$):** $R_{\text{total}} \times 12$.
* **Effective Gross Income ($EGI$):** $GSR \times (1 - V)$ *(where $V$ = Vacancy Rate, default 0.03)*.

### 2.3 Operating Expenses & Net Operating Income (NOI)
* **Property Taxes:** $P \times 0.0125$ (1.25% of purchase price annually).
* **Home Insurance:** $P \times 0.0035$ (0.35% of purchase price annually).
* **Property Management Fee:** $EGI \times 0.05$ (5.0% of collected rent).
* **HOA / Special Dues:** $\text{Monthly HOA} \times 12$ (default $0).
* **Operating Expenses ($OpEx$):**
  $$OpEx = \text{Property Taxes} + \text{Home Insurance} + \text{Property Management} + \text{HOA}$$
* **Net Operating Income ($NOI$):**
  $$NOI = EGI - OpEx$$
* **Net Annual Cash Flow ($CF$):**
  $$CF = NOI - (PMT \times 12)$$

### 2.4 Multi-Year Projections (Years 1 to 10)
For each year $t \in [1, 10]$:
* **Asset Valuation:** $V_t = P_{\text{basis}} \times (1 + g_{\text{apprec}})^t$ *(default $g_{\text{apprec}} = 0.04$)*.
* **Compounded Unit Rent:** $R_{i, t} = R_{i, 0} \times (1 + g_{\text{rent}})^{t-1}$ *(default $g_{\text{rent}} = 0.03$)*.
* **EGI & OpEx:** $OpEx$ adjusts with management fees tracking $EGI_t$. Base taxes and insurance held constant or adjusted by 2% Prop 13 cap.
* **Annual Net Cash Flow ($CF_t$):** $NOI_t - \text{Debt Service}_t$.

### 2.5 Disposition & Return Metrics
* **Total Initial Capital Outlay ($C_0$):**
  $$C_0 = DP + \text{Make-Ready Cost} + \text{ADU Build Cost (if cash funded)}$$
* **Net Sale Proceeds at Year $t$ ($NSP_t$):**
  $$NSP_t = V_t - (V_t \times S) - \text{Balance}_t \quad \text{where } S = 0.05 \text{ (5% Selling Cost)}$$
* **Net Total Lifetime Profit:**
  $$\text{Profit}_t = NSP_t + \sum_{j=1}^t CF_j - C_0$$
* **Total ROI (%):** $\left(\frac{\text{Profit}_t}{C_0}\right) \times 100$.
* **Annualized IRR (%):** Exact root solve via Newton-Raphson approximation:
  $$-C_0 + \sum_{j=1}^{t-1} \frac{CF_j}{(1 + \text{IRR})^j} + \frac{CF_t + NSP_t}{(1 + \text{IRR})^t} = 0$$

---

## 3. Pure TypeScript Calculation Module (`lib/financial-engine.ts`)

See [`lib/financial-engine.ts`](file:///c:/Users/RakeshJain/.gemini/antigravity/scratch/mortgage-website/lib/financial-engine.ts).

---

## 4. UI Specification: Dynamic 1–4 Unit Schedule & Component Hierarchy

### 4.1 Component Tree Architecture
Place components under `components/calculators/rental-analyzer/`:
- `RentalAnalyzerContainer.tsx` (State container, mode switcher for Public vs Admin)
- `DynamicUnitSchedule.tsx` (1–4 unit selector & dynamic rent rows)
- `InputControlPanel.tsx` (Price, down payment, interest rate, CapEx sliders)
- `WhatIfModules.tsx` (Collapsible Refinance & ADU toggles)
- `SummaryKpiCards.tsx` (Initial cash, monthly CF, 5-yr/10-yr IRR badges)
- `ProFormaTable.tsx` (Full 10-year expandable tabular breakdown)
- `LeadCaptureModal.tsx` (Public lead gate to unlock 10-year pro-forma & PDF)

### 4.2 Dynamic Unit Schedule Layout
Property Address: `[ 535 Tam O Shanter Dr, San Marcos, CA 92069 ]`
Property Type: `( ) 1 Unit   (●) 2 Units   ( ) 3 Units   ( ) 4 Units`

UNIT RENT SCHEDULE:
- Unit 1 (Primary): `[ 3 Bed / 2 Bath Main House ]` Expected Rent: `[ $2,600 ]` /mo
- Unit 2: `[ 1 Bed / 1 Bath Attached ]` Expected Rent: `[ $2,200 ]` /mo

Total Scheduled Gross Rent: `$4,800 /mo`

### 4.3 Dynamic Behavior Rules
1. Selector Toggles: Segmented button control for 1 Unit (SFR), 2 Units (Duplex), 3 Units (Triplex), and 4 Units (Fourplex).
2. State Management:
   - Switching unit counts dynamically updates the units array length.
   - Preserve previously entered rent values when toggling between counts so users do not retype numbers.
   - Auto-calculates `totalMonthlyRent` instantly across all active rows.
3. What-If ADU Multiplier for 2–4 Units:
   - When `unitCount` is greater than 1, allow an ADU selector for 1 or 2 detached ADUs (per California multi-family state ADU law).

---

## 5. Input Control Schema & Default Values

Acquisition Inputs:
- Purchase Price (`purchasePrice`): Number, Min $100k - Max $10M, Default $880,000
- Down Payment % (`downPaymentPct`): Slider, 15% - 50% (step 1%), Default 25% (0.25)
- Interest Rate (`interestRate`): Slider/Input, 4.0% - 10.0% (step 0.125%), Default 7.50% (0.075)
- Make-Ready Cost (`makeReadyCost`): Number, Min $0 - Max $250k, Default $10,000

Operations Inputs:
- Monthly Rent: Derived from Units sum, Dynamic rollup, Default $4,800
- Vacancy Rate (`vacancyRate`): Slider, 0% - 10% (step 0.5%), Default 3.0% (0.03)
- Property Tax Rate (`propertyTaxRate`): Number, 0.5% - 3.0%, Default 1.25% (0.0125)
- Insurance Rate (`insuranceRate`): Number, 0.1% - 1.0%, Default 0.35% (0.0035)
- Management Fee (`propMgmtRate`): Slider, 0% - 10% (step 1%), Default 5.0% (0.05)

Exit Engine Inputs:
- Annual Rent Growth (`annualRentGrowth`): Slider, 0% - 8% (step 0.5%), Default 3.0% (0.03)
- Annual Appreciation (`annualAppreciation`): Slider, 0% - 10% (step 0.5%), Default 4.0% (0.04)
- Selling Cost % (`sellingCostPct`): Slider, 0% - 8% (step 0.5%), Default 5.0% (0.05)

What-If: Refinance Inputs:
- Enable Refinance (`refiEnabled`): Toggle, Boolean, Default false
- Target Refi Year (`refiYear`): Slider, Year 1 - Year 7, Default Year 3
- New Interest Rate (`refiNewRate`): Slider, 4.0% - 8.5%, Default 6.25%
- Reset 30-Yr Term (`refiReset30`): Switch, Boolean, Default true

What-If: ADU Project Inputs:
- Enable ADU Project (`aduEnabled`): Toggle, Boolean, Default false
- Build Budget (`aduCost`): Number, $50k - $400k, Default $200,000
- Expected ADU Rent (`aduRentMonthly`): Number, $1k - $5k, Default $2,200
- Construction Downtime (`aduConstructionMonths`): Slider, 0 - 12 Months, Default 6 Months
- Main House Rent Drag (`aduMainRentDiscountPct`): Dropdown (Full Vacant 100% / Discount 25% / None 0%), Default 25% Discount

---

## 6. Admin Portal Integration (`/admin/`) & Lead Flow

1. Admin Route Registration:
   - Create page at `app/admin/tools/rental-analyzer/page.tsx`.
   - Authenticated sessions (admin / loan officer roles) bypass all lead capture gates, unlocking full 10-year pro-forma schedules and What-If scenario modeling.
2. Public Route (`/tools/rental-analyzer`):
   - Shows Property Inputs, Year 1 Monthly Cash Flow, and Debt Service snapshot.
   - Locks the 10-Year Pro-Forma, ADU modeling, and PDF report download behind `LeadCaptureModal.tsx`.
3. Lead Capture Delivery:
   - Emits incoming lead data (Name, Email, Phone, Property Address, Estimated Cash Flow, Selected Loan Option) to David Sider and Rakesh Jain via email/webhook and Firestore for immediate borrower pre-qualification.

---

## 7. Automated Unit Test Suite (`lib/financial-engine.test.ts`)

See [`lib/financial-engine.test.ts`](file:///c:/Users/RakeshJain/.gemini/antigravity/scratch/mortgage-website/lib/financial-engine.test.ts).
