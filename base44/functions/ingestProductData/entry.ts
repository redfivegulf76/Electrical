import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Validate Manus API key
    const apiKey = req.headers.get("x-manus-api-key");
    const expectedKey = Deno.env.get("MANUS_API_KEY");
    if (!expectedKey || apiKey !== expectedKey) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { manus_job_id, products } = body;

    if (!manus_job_id || !Array.isArray(products) || products.length === 0) {
      return Response.json({ error: "Missing manus_job_id or products array" }, { status: 400 });
    }

    const created = [];
    const errors = [];

    for (const product of products) {
      if (!product.manufacturer || !product.mpn) {
        errors.push({ product, reason: "Missing required fields: manufacturer, mpn" });
        continue;
      }

      const record = await base44.asServiceRole.entities.ExtractedProduct.create({
        extraction_job_id: manus_job_id,
        source_url: product.source_url || "",
        manufacturer: product.manufacturer,
        mpn: product.mpn,
        product_category: product.product_category || "other",
        amperage: product.amperage || null,
        poles: product.poles || null,
        voltage: product.voltage || null,
        material_type: product.material_type || null,
        application_type: product.application_type || null,
        compatibility_notes: product.compatibility_notes || null,
        description: product.description || null,
        specifications: product.specifications || null,
        unit: product.unit || "each",
        image_url: product.image_url || null,
        raw_extracted_data: product,
        review_status: "pending_review",
        confidence_score: product.confidence_score || 70,
        approved_to_coreproduct: false
      });

      await base44.asServiceRole.entities.ManusAuditLog.create({
        manus_job_id,
        action_type: "ingestion",
        entity_type: "ExtractedProduct",
        entity_id: record.id,
        summary: `Product ingested: ${product.manufacturer} ${product.mpn}`,
        details: { product },
        performed_by: "MANUS_AI",
        timestamp: new Date().toISOString()
      });

      created.push(record.id);
    }

    return Response.json({
      success: true,
      created_count: created.length,
      error_count: errors.length,
      created_ids: created,
      errors
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});