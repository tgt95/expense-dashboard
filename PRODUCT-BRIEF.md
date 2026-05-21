# Product Brief — Expense Dashboard

**Date:** 2026-05-21  
**Skill Applied:** `product-lens` (Mode 2 Founder Review + Mode 1 Diagnostic + Mode 4 Prioritization)

---

## 1. What is this?

A **personal expense analytics dashboard** backed by Notion and augmented with AI auto-categorization. It reads expense transactions from a Notion database, uses Google's Gemini to classify uncategorized entries, and renders a visual dashboard with charts, metrics, and transaction history.

**Current stack:** Next.js App Router, React Server Components, TypeScript, Tailwind CSS, Recharts, Motion, Notion API, Google GenAI.

**Current features:**
- Auto-sync from Notion database
- AI-powered transaction categorization (Gemini)
- Fallback regex-based local classification
- Date range filtering (Last 3 days, Last week, Custom)
- Dashboard cards: total spend, transaction count, average spend
- Daily spend bar chart
- Category split donut chart with legend
- Recent transactions list (8 items)
- Dark/light mode toggle
- Notion category property auto-provisioning

---

## 2. Founder Review

### 2.1 Product-Market Fit Signals (0–10)

| Signal | Score | Notes |
|---|---|---|
| Usage growth trajectory | 2/10 | Single-user tool; no telemetry, no auth, no sharing. |
| Retention indicators | 3/10 | No recurring engagement features (no alerts, no goals, no budgeting). User must manually visit the dashboard. |
| Revenue signals | 0/10 | No pricing, no billing, no Stripe. Pure personal utility. |
| Competitive moat | 2/10 | The AI categorization is nice, but competitors (Monarch, YNAB, Copilot) have bank integrations, mobile apps, and team features. Notion-as-backend is a moat only for Notion power users. |

**Average PMF Score: 1.75/10**

This is currently a **personal side-project utility**, not a product. That is fine — but the user should be explicit about whether the goal is (a) a tool they use daily, (b) a portfolio piece, or (c) a SaaS they want to monetize. This brief assumes the user wants to evolve it toward **(b) or (c)**.

### 2.2 The One Thing That Would 10x This

**Bank API + automatic transaction ingestion.**

Right now, the user must manually enter every transaction into Notion. A personal finance tool where the hardest step (data entry) is entirely manual will never retain users. The killer feature is: connect a bank account (Plaid / GoCardless / Teller) and have transactions flow in automatically, with AI categorization happening in the background, and the dashboard surfacing insights *without the user opening Notion*.

### 2.3 Things Currently Being Built That Don't Matter (Yet)

1. **Hyper-polished UI animations** — the Motion stagger effects and serif typography are beautiful, but they do not solve the core problem (data entry friction). If no data flows in, beautiful charts are meaningless.
2. **Theme toggle** — nice-to-have, but does not move retention or engagement.
3. **8-transaction limit on recent transactions** — an arbitrary truncation that hides useful data.

---

## 3. Product Diagnostic (The Hard Questions)

### 3.1 Who is this for?

**Primary persona:** Tech-savvy individuals who already live in Notion and want to track personal expenses without leaving their workspace. They are privacy-conscious, do not want to give their bank data to yet another app, and are comfortable with manual entry in exchange for full control.

**Secondary persona:** A solo-founder building a lightweight expense tool for themselves, potentially to later productize for other Notion users.

### 3.2 What's the pain?

- **Awareness:** "I don't know where my money goes." Spreadsheets feel like work; banking apps have poor categorization.
- **Friction:** Notion is where they track everything else, but manually tagging categories is tedious.
- **Insight gap:** Notion has no native charting; they want visual summaries without exporting to Excel.

**Quantified:** If a user makes 20 transactions/week, manually categorizing each takes ~5 seconds = ~100 seconds/week = ~7 minutes/week. Over a year, that's **6 hours of tedious tagging**. The AI feature (when working) cuts this to near zero.

### 3.3 Why now?

1. **Notion APIs matured** — Data sources API (used here) is relatively new and enables programmatic database interaction.
2. **Gemini Flash is cheap** — model prices have collapsed; classifying 100 transactions costs pennies.
3. **Personal finance anxiety is high** — post-inflation era, more people are tracking spending closely.

### 3.4 What's the 10-star version?

- Real-time bank sync (Plaid/GoCardless) into Notion
- Multi-currency with live exchange rates
- Predictive budgeting: "Based on your trends, you'll exceed your Food budget by Wednesday"
- Receipt OCR: snap a photo, auto-match to transaction, extract line items
- Shared household / team workspaces with permission layers
- PWA with offline support and push notifications
- Anomaly alerts: "You spent 3x your normal Transport amount today"
- Natural language queries: "How much did I spend on coffee last month?"
- Auto-generated monthly PDF reports
- Integration with accounting tools (QuickBooks, Xero)

### 3.5 What's the MVP?

The current codebase is already past MVP for a personal tool. The smallest next step that proves wider demand is:

**"A shareable dashboard link with real-time Notion sync that any Notion user can set up in <5 minutes."**

This means: a hosted version, a setup wizard (paste Notion API key, pick database), and a public URL they can bookmark. This tests whether other Notion users want this.

### 3.6 What's the anti-goal?

- **Not a full accounting suite** — no invoicing, no tax filing, no payroll.
- **Not a mobile app** — stay web-first / PWA unless user demand is proven.
- **Not a bank replacement** — no holding funds, no transfers.
- **Not a multi-tenant SaaS yet** — no team billing, no RBAC, until single-player is sticky.

### 3.7 How do you know it's working?

1. **Setup completion rate:** % of users who visit the setup page and successfully see data in the dashboard. Target: >70%.
2. **Return rate:** % of users who view the dashboard >3 times in the first 7 days. Target: >40%.
3. **AI classification accuracy:** % of AI-suggested categories that the user does not manually change. Target: >85%.
4. **Time-to-first-chart:** seconds from first visit to seeing their own data. Target: <120s.

---

## 4. Feature Prioritization (ICE Framework)

Candidate features scored on **Impact (1–5) × Confidence (1–5) ÷ Effort (1–5)**

| # | Feature | Impact | Confidence | Effort | ICE Score | Rationale |
|---|---|---|---|---|---|---|
| 1 | **Search & filter transaction list** | 4 | 5 | 2 | **10.0** | High user value, trivial to implement. Fixes the arbitrary 8-item limit. |
| 2 | **Budgets: set monthly limits per category** | 5 | 4 | 2 | **10.0** | Transforms dashboard from "what happened" to "what should I do." Needs budget properties in Notion. |
| 3 | **AI spending insights (natural language)** | 5 | 4 | 3 | **6.7** | Differentiator. "You spent 40% more on Food this week." Uses existing Gemini integration. |
| 4 | **Export to CSV / PDF** | 3 | 5 | 2 | **7.5** | Standard table-stakes; useful for tax season. |
| 5 | **Monthly / yearly comparison views** | 4 | 4 | 3 | **5.3** | Easy win for context; needs date-range presets expanded. |
| 6 | **Recurring transaction detection** | 4 | 3 | 3 | **4.0** | Strong utility for budgeting; algorithmic complexity moderate. |
| 7 | **Receipt upload + OCR (Geminimultimodal)** | 4 | 3 | 4 | **3.0** | Powerful, but overkill until core dashboard is sticky. |
| 8 | **Bank API integration (Plaid)** | 5 | 3 | 5 | **3.0** | The 10x feature, but high effort, compliance, and cost. Defer until user base exists. |
| 9 | **Multi-user / team support** | 3 | 2 | 5 | **1.2** | Premature without proven single-user retention. |
| 10 | **PWA offline support** | 3 | 4 | 4 | **3.0** | Nice for mobile usage, but data requires Notion connection. |

### Top 3 Recommended Next Features

1. **Search & Filter + Full Transaction List**
   - Infinite scroll or paginated table of all transactions
   - Full-text search across transaction name, category, and raw email
   - Category filter chips
   - **Why first:** Zero-risk, immediate user value, sets foundation for #2 and #3

2. **Budgets with Progress Indicators**
   - Add a `Budget` number property to Notion per category (or month)
   - Dashboard shows progress bars: "Food: $340 / $500"
   - Alert state when >80% of budget consumed
   - **Why second:** Changes the product from passive analytics to active financial control

3. **AI Spending Insights Panel**
   - Add a new card below metrics: "This Week's Insights"
   - Prompt Gemini with the current dashboard data to generate 2–3 bullet observations
   - Examples: "Your Transport spend doubled vs. last week." / "You are on track to stay under your Bills budget."
   - **Why third:** Leverages existing AI infrastructure for high differentiation at low incremental cost

---

## 5. Go / No-Go Recommendation

**GO — but with a pivot in focus.**

The codebase is architecturally solid (clean separation between Notion client, AI layer, aggregation, and UI). The visual design is polished above its weight class. However, the current feature set is **passive analytics**.

To make this a durable product (or even a sticky personal tool), the next 2–4 weeks should focus on **active financial control** (budgets, search, insights) rather than **passive polish** (more animations, more themes).

If the goal is to eventually monetize, the North Star metric should be **"time from sign-up / setup to first budget alert."** That is the moment the tool becomes indispensable.

---

## 6. Next Steps

1. Implement the top 3 features above (est. 1–2 weeks for a solo developer)
2. Add a `/setup` route with a Notion API key onboarding flow
3. Capture the setup completion rate metric (even a simple log is fine)
4. Re-run Product Lens in 30 days to review retention signals

**Hand-off note:** When these features stabilize, the next lane is `product-capability` to write implementation-ready SRS documents for any chosen feature.
