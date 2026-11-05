import { NextRequest, NextResponse } from "next/server";
import { reconcileLedger, backfillLedgerEntries } from "@repo/db/client";

/**
 * GET /api/reconcile
 * Executes an audit check of the double-entry ledger without mutating data.
 * Checks:
 * 1. Debits equal credits globally.
 * 2. Every transaction leg is balanced.
 * 3. Each wallet balance matches its ledger sum.
 */
export async function GET() {
  try {
    const report = await reconcileLedger({ autoFix: false, verbose: false });
    return NextResponse.json({
      success: true,
      report,
    }, {
      status: 200,
    });
  } catch (error: any) {
    console.error("[Reconciliation API] Error running audit:", error);
    return NextResponse.json(
      { success: false, message: "Failed to run reconciliation audit", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reconcile
 * Runs reconciliation with optional parameters:
 * Body: { autoFix?: boolean, backfill?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const shouldBackfill = Boolean(body.backfill);
    const shouldAutoFix = Boolean(body.autoFix);

    let backfillResult = null;
    if (shouldBackfill) {
      backfillResult = await backfillLedgerEntries();
    }

    const report = await reconcileLedger({
      autoFix: shouldAutoFix,
      verbose: false,
    });

    return NextResponse.json({
      success: true,
      backfill: backfillResult,
      reconciliation: report,
    }, { status: 200 });
  } catch (error: any) {
    console.error("[Reconciliation API] Error executing reconciliation:", error);
    return NextResponse.json(
      { success: false, message: "Failed to execute reconciliation", error: error.message },
      { status: 500 }
    );
  }
}
