# PKV Invoice Tracker

Private health insurance reimbursement tracker (client-side only).

Demo (GitHub Pages): `https://stavgian.github.io/pkv-invoice-tracker/`

## Setup
```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

1. Push this repo to GitHub (branch `main`).
2. In GitHub: **Settings → Pages → Source**: select **GitHub Actions**.
3. Push to `main` to trigger the workflow. The site will be available at:
   - `https://stavgian.github.io/pkv-invoice-tracker/`

Notes:
- Data is stored in your browser (`localStorage`). Nothing is uploaded anywhere.
- Don’t commit real exports/import files if they contain personal data.

## Build
```bash
npm run build
# serve dist/ with Nginx
```

## Import JSON Schema

Use `rechnungen.schema.json` as the reference schema for manual imports.

Expected top-level structure:
- JSON array
- each item is one invoice entry object

Core fields:
- `provider` (string, required)
- `amountPaid` (string, required)
- `receivedDate` (YYYY-MM-DD, required)
- optional: `paidDate`, `submittedDate`, `pkvResponseDate`, `reimbursedAmount`, `notes`, `person`, `rechnungNr`, `category`

VS Code tip for validation/intellisense:
```json
{
  "$schema": "./rechnungen.schema.json"
}
```

You can also validate your import file with any JSON Schema validator by selecting Draft 2020-12.
