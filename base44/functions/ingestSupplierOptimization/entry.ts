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
    const { manus_job_id, suggestions } = body;

    if (!manus_job_id || !Array.isArray(suggestions) || suggestions.length === 0) {
      return Response.json({ error: "Missing manus_job_id or suggestions array" }, { status: 400 });
    }

    const created = [];

    for (const s of suggestions) {
      if (!s.product_identifier || !s.suggested_supplier) continue;

      const record = await base44.asServiceRole.entities.SupplierOptimizationSuggestion.create({
        manus_job_id,
        product_identifier: s.product_identifier,
        current_supplier: s.current_supplier || null,
        suggested_supplier: s.suggested_supplier,
        current_price: s.current_price || null,
        suggested_price: s.suggested_price || null,
        estimated_savings_percentage: s.estimated_savings_percentage || null,
        reason: s.reason || "lower_price",
        confidence_score: s.confidence_score || 75,
        review_status: "pending_review"
      });

      await base44.asServiceRole.entities.ManusAuditLog.create({
        manus_job_id,
        action_type: "ingestion",
        entity_type: "SupplierOptimizationSuggestion",
        entity_id: record.id,
        summary: `Supplier suggestion for ${s.product_identifier}: switch to ${s.suggested_supplier}`,
        details: { s },
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