# Filters Sidebar Test Plan

## Application Overview

Test plan for the Filters sidebar on https://practicesoftwaretesting.com/ home page. Locators: sort [data-test="sort"]; search [data-test="search-query"], [data-test="search-submit"], [data-test="search-reset"]; price slider ngx-slider (handles role=slider names "ngx-slider" and "ngx-slider-max", range 0-200, default 1-100); category checkboxes by role/label (e.g. getByRole('checkbox',{name:'Hand Tools'})), children Hammer, Hand Saw, Wrench, Screwdriver, Pliers, Chisels, Measures (Hand Tools); Grinder, Sander, Saw, Drill (Power Tools); Tool Belts, Storage Solutions, Workbench, Safety Gear, Fasteners (Other); brands ForgeFlex Tools and MightyCraft Hardware; eco checkbox 'Show only eco-friendly products'; product cards [data-test="product-name"], [data-test="product-price"], ECO badge on eco products; pagination buttons Page-N, Previous, Next (9 products per page, 5 pages by default); empty state text 'There are no products found.'; search heading 'Searched for: X' and caption 'N products found for X'. Every scenario starts from the seed state (fresh home page, no filters).

## Test Scenarios

### 1. Sort

**Seed:** `e2e/seed.spec.ts`

#### 1.1. Sort by Name A-Z

**File:** `e2e/filters/sort-name-asc.spec.ts`

**Steps:**
  1. From seed state, select 'Name (A - Z)' in [data-test="sort"]
    - expect: Product list reloads; names on page 1 are ascending alphabetically

#### 1.2. Sort by Name Z-A

**File:** `e2e/filters/sort-name-desc.spec.ts`

**Steps:**
  1. Select 'Name (Z - A)'
    - expect: Names on page 1 are descending alphabetically

#### 1.3. Sort by price High-Low and Low-High

**File:** `e2e/filters/sort-price.spec.ts`

**Steps:**
  1. Select 'Price (High - Low)'
    - expect: [data-test="product-price"] values on page 1 are non-increasing
  2. Select 'Price (Low - High)'
    - expect: Prices on page 1 are non-decreasing

#### 1.4. Sort by CO2 rating

**File:** `e2e/filters/sort-co2.spec.ts`

**Steps:**
  1. Select 'CO₂ Rating (A - E)', then 'CO₂ Rating (E - A)'
    - expect: List reorders each time without error; order reverses between options

#### 1.5. Sort persists across pagination

**File:** `e2e/filters/sort-pagination.spec.ts`

**Steps:**
  1. Select 'Price (High - Low)', then click Page-2
    - expect: Page 2 first price <= page 1 last price; sort option stays selected

#### 1.6. Default sort option is blank

**File:** `e2e/filters/sort-default.spec.ts`

**Steps:**
  1. Inspect [data-test="sort"] on seed state
    - expect: Selected option is empty placeholder; 7 options total; 9 products per page, 5 pages

### 2. Price Range

**Seed:** `e2e/seed.spec.ts`

#### 2.1. Default slider bounds

**File:** `e2e/filters/price-default.spec.ts`

**Steps:**
  1. Inspect the price slider on seed state
    - expect: Scale shows 0 and 200; handles show 1 and 100

#### 2.2. Lower the max handle with keyboard

**File:** `e2e/filters/price-max-keyboard.spec.ts`

**Steps:**
  1. Click handle 'ngx-slider-max' and press ArrowLeft
    - expect: Max label becomes 99 (observed)
    - expect: List reloads; all prices <= 99
  2. Press ArrowLeft repeatedly until max reaches min
    - expect: Handles cannot cross; list shows in-range products or empty state

#### 2.3. Raise min handle excludes cheap products

**File:** `e2e/filters/price-min.spec.ts`

**Steps:**
  1. Focus handle 'ngx-slider' (min), press ArrowRight to about 50
    - expect: All prices >= 50; pagination updates

#### 2.4. Slider extreme bounds

**File:** `e2e/filters/price-bounds.spec.ts`

**Steps:**
  1. Focus max handle press End; focus min handle press Home
    - expect: Range is 0-200; products above 100 are listed; handles never exceed limits

#### 2.5. Narrow range yielding no products

**File:** `e2e/filters/price-empty.spec.ts`

**Steps:**
  1. Set min near 190, max 200
    - expect: Few products or 'There are no products found.', no pagination, no errors

#### 2.6. Price filter resets pagination to page 1

**File:** `e2e/filters/price-pagination.spec.ts`

**Steps:**
  1. Click Page-3, then change the price max
    - expect: Results return to page 1; no empty page shown

### 3. Search

**Seed:** `e2e/seed.spec.ts`

#### 3.1. Search by matching term

**File:** `e2e/filters/search-match.spec.ts`

**Steps:**
  1. Type 'hammer' in [data-test="search-query"], click [data-test="search-submit"]
    - expect: Heading 'Searched for: hammer' and caption with count
    - expect: All card names contain 'hammer' (Hammer, Claw Hammer, Thor Hammer ...)

#### 3.2. Search with Enter key

**File:** `e2e/filters/search-enter.spec.ts`

**Steps:**
  1. Type 'pliers' and press Enter
    - expect: Results same as clicking Search

#### 3.3. Search term with no match

**File:** `e2e/filters/search-nomatch.spec.ts`

**Steps:**
  1. Search 'zzzz'
    - expect: Heading 'Searched for: zzzz', "0 products found for 'zzzz'", 'There are no products found.'; no pagination

#### 3.4. Empty search submit

**File:** `e2e/filters/search-empty.spec.ts`

**Steps:**
  1. Click search with empty input, then with only spaces
    - expect: Full catalog remains; no error

#### 3.5. Search with special characters

**File:** `e2e/filters/search-special.spec.ts`

**Steps:**
  1. Search each: <script>alert(1)</script>, ' OR 1=1 --, %, _, unicode, 300-char string
    - expect: No script executes, no server error, text echoed escaped, zero or sensible results

#### 3.6. Reset search with X button

**File:** `e2e/filters/search-reset.spec.ts`

**Steps:**
  1. Search 'hammer' then click [data-test="search-reset"]
    - expect: Input cleared, search heading gone, full catalog (5 pages) returns

#### 3.7. Search is case-insensitive and partial

**File:** `e2e/filters/search-case.spec.ts`

**Steps:**
  1. Search 'HAMMER' then 'ham'
    - expect: Case-insensitive; partial term matches names containing 'ham'

#### 3.8. Search pagination

**File:** `e2e/filters/search-pagination.spec.ts`

**Steps:**
  1. Search 'er' (>9 results), click Page-2
    - expect: Remaining matches shown, all contain term; caption count unchanged

### 4. Category Filter

**Seed:** `e2e/seed.spec.ts`

#### 4.1. Select a single child category

**File:** `e2e/filters/category-child.spec.ts`

**Steps:**
  1. Check 'Hammer' checkbox
    - expect: Only hammer products listed; parent 'Hand Tools' not checked (verify)
    - expect: Pagination reflects reduced count

#### 4.2. Select parent category checks all children

**File:** `e2e/filters/category-parent.spec.ts`

**Steps:**
  1. Check 'Hand Tools'
    - expect: All 7 children (Hammer, Hand Saw, Wrench, Screwdriver, Pliers, Chisels, Measures) become checked (observed)
    - expect: List shows products from all Hand Tools subcategories only
  2. Uncheck 'Hand Tools'
    - expect: All children unchecked; full catalog returns

#### 4.3. Uncheck one child while parent checked

**File:** `e2e/filters/category-parent-child-uncheck.spec.ts`

**Steps:**
  1. Check 'Hand Tools', then uncheck 'Wrench'
    - expect: Wrench products disappear from results
    - expect: Observed: parent 'Hand Tools' stays checked while a child is unchecked (possible inconsistent state; confirm expected behaviour)

#### 4.4. Multiple categories across parents

**File:** `e2e/filters/category-multi.spec.ts`

**Steps:**
  1. Check 'Drill' and 'Fasteners'
    - expect: Results include products from both categories (OR semantics)

#### 4.5. Category filter with pagination

**File:** `e2e/filters/category-pagination.spec.ts`

**Steps:**
  1. Check 'Hand Tools', go to Page-2, then check 'Power Tools'
    - expect: Results reset to page 1 with union of both parents; no empty page

#### 4.6. Uncheck all categories restores catalog

**File:** `e2e/filters/category-clear.spec.ts`

**Steps:**
  1. Check 'Sander' then uncheck it
    - expect: All products and 5 pages restored

#### 4.7. Category checkboxes keyboard accessibility

**File:** `e2e/filters/category-keyboard.spec.ts`

**Steps:**
  1. Tab to 'Saw' checkbox and press Space
    - expect: Checkbox toggles and list filters

### 5. Brand Filter

**Seed:** `e2e/seed.spec.ts`

#### 5.1. Filter by ForgeFlex Tools

**File:** `e2e/filters/brand-forgeflex.spec.ts`

**Steps:**
  1. Check 'ForgeFlex Tools'
    - expect: Only ForgeFlex products listed; pagination updates

#### 5.2. Filter by MightyCraft Hardware

**File:** `e2e/filters/brand-mightycraft.spec.ts`

**Steps:**
  1. Check 'MightyCraft Hardware'
    - expect: Only MightyCraft products listed

#### 5.3. Both brands selected equals combined set

**File:** `e2e/filters/brand-both.spec.ts`

**Steps:**
  1. Check both brands
    - expect: Result count equals sum of each brand individually (OR semantics)

#### 5.4. Uncheck brand restores catalog

**File:** `e2e/filters/brand-clear.spec.ts`

**Steps:**
  1. Check then uncheck 'ForgeFlex Tools'
    - expect: Full catalog restored

### 6. Sustainability (Eco) Filter

**Seed:** `e2e/seed.spec.ts`

#### 6.1. Show only eco-friendly products

**File:** `e2e/filters/eco-on.spec.ts`

**Steps:**
  1. Check 'Show only eco-friendly products'
    - expect: Every card shows ECO badge; count is lower than full catalog

#### 6.2. Toggle eco off restores catalog

**File:** `e2e/filters/eco-off.spec.ts`

**Steps:**
  1. Check then uncheck eco checkbox
    - expect: Full catalog and 5 pages restored

#### 6.3. Eco combined with sort

**File:** `e2e/filters/eco-sort.spec.ts`

**Steps:**
  1. Check eco, select 'Price (Low - High)'
    - expect: Only ECO products, ascending prices

### 7. Filter Combinations and Empty States

**Seed:** `e2e/seed.spec.ts`

#### 7.1. Category + brand + eco narrows to single product

**File:** `e2e/filters/combo-category-brand-eco.spec.ts`

**Steps:**
  1. Check 'Hand Tools', uncheck 'Wrench', check 'ForgeFlex Tools', check eco checkbox
    - expect: Observed: single product 'Wood Saw' with ECO badge ($12.18)
    - expect: No pagination or one page only

#### 7.2. Combination yielding zero products

**File:** `e2e/filters/combo-zero.spec.ts`

**Steps:**
  1. Check eco, set price min to ~190 (or search 'zzzz' with category checked)
    - expect: 'There are no products found.' displayed, no pagination, no console errors beyond known 401 /users/me

#### 7.3. Search plus category

**File:** `e2e/filters/combo-search-category.spec.ts`

**Steps:**
  1. Check 'Hammer' category, search 'pliers'
    - expect: Verify whether search and category combine (intersection -> empty) or search overrides; document behaviour

#### 7.4. Search plus price range plus sort

**File:** `e2e/filters/combo-search-price-sort.spec.ts`

**Steps:**
  1. Search 'hammer', lower max to 12, sort Price (High - Low)
    - expect: Only hammer products <= 12 sorted descending

#### 7.5. Recover from empty state

**File:** `e2e/filters/combo-recover.spec.ts`

**Steps:**
  1. Reach empty state, then uncheck the last filter added
    - expect: Products reappear; pagination re-renders correctly

#### 7.6. Rapid successive filter changes

**File:** `e2e/filters/combo-rapid.spec.ts`

**Steps:**
  1. Quickly toggle three checkboxes in succession
    - expect: Final list matches the final filter state (no stale response)

#### 7.7. Page reload clears filters

**File:** `e2e/filters/combo-reload.spec.ts`

**Steps:**
  1. Apply category and eco filters, reload page
    - expect: Document whether filters persist; no crash
