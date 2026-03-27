import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const apiKey = req.headers.get("x-manus-api-key");
    const expectedKey = Deno.env.get("MANUS_API_KEY");
    if (!expectedKey || apiKey !== expectedKey) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { manus_job_id, pricing_updates } = body;

    if (!manus_job_id || !Array.isArray(pricing_updates) || pricing_updates.length === 0) {
      return Response.json({ error: "Missing manus_job_id or pricing_updates array" }, { status: 400 });
    }

    const created = [];

    for (const update of pricing_updates) {
      if (!update.product_identifier || !update.supplier_name || update.new_price == null) {
        continue;
      }

      // Check for major price change by finding existing SupplierMapping
      let flagReason = null;
      let reviewStatus = "pending_review";

      const existing = await base44.asServiceRole.entities.SupplierMapping.filter({
        supplier_sku: update.product_identifier,
        supplier_name: update.supplier_name
      });

      if (existing.length > 0 && existing[0].price) {
        const priceDiff = Math.abs(update.new_price - existing[0].price) / existing[0].price;
        if (priceDiff > 0.1) {
          flagReason = "major_price_change";
          reviewStatus = "flagged_change";
        }
      }

      const record = await base44.asServiceRole.entities.RawPricingUpdate.create({
        manus_job_id,
        product_identifier: update.product_identifier,
        supplier_name: update.supplier_name,
        new_price: update.new_price,
        currency: update.currency || "USD",
        availability_status: update.availability_status || "in_stock",
        last_checked_date: update.last_checked_date || new Date().toISOString(),
        confidence_score: update.confidence_score || 80,
        review_status: reviewStatus,
        flag_reason: flagReason,
        raw_data: update
      });

      await base44.asServiceRole.entities.ManusAuditLog.create({
        manus_job_id,
        action_type: flagReason ? "flagged" : "ingestion",
        entity_type: "RawPricingUpdate",
        entity_id: record.id,
        summary: `Pricing update for ${update.product_identifier} @ ${update.supplier_name}: $${update.new_price}${flagReason ? ' [FLAGGED]' : ''}`,
        details: { update, flag_reason: flagReason },
        performed_by: "MANUS_AI",
        timestamp: new Date().toISOString()
      });

      created.push(record.id);
    }

    return Response.json({ success: true, created_count: created.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});