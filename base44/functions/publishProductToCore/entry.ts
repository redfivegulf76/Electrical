import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const { extracted_product_id } = await req.json();
    if (!extracted_product_id) {
      return Response.json({ error: "Missing extracted_product_id" }, { status: 400 });
    }

    const extracted = await base44.asServiceRole.entities.ExtractedProduct.get(extracted_product_id);
    if (!extracted) {
      return Response.json({ error: "ExtractedProduct not found" }, { status: 404 });
    }

    // Create or update CoreProduct
    const coreProduct = await base44.asServiceRole.entities.CoreProduct.create({
      manufacturer: extracted.manufacturer,
      mpn: extracted.mpn,
      product_category: extracted.product_category || "other",
      amperage: extracted.amperage || null,
      poles: extracted.poles || null,
      voltage: extracted.voltage || null,
      material_type: extracted.material_type || null,
      application_type: extracted.application_type || null,
      compatibility_notes: extracted.compatibility_notes || null,
      description: extracted.description || null,
      specifications: extracted.specifications || null,
      unit: extracted.unit || "each",
      image_url: extracted.image_url || null
    });

    // Mark extracted product as approved
    await base44.asServiceRole.entities.ExtractedProduct.update(extracted_product_id, {
      review_status: "approved",
      approved_to_coreproduct: true
    });

    // Log the action
    await base44.asServiceRole.entities.ManusAuditLog.create({
      manus_job_id: extracted.extraction_job_id || "unknown",
      action_type: "published",
      entity_type: "ExtractedProduct",
      entity_id: extracted_product_id,
      summary: `Product published to CoreProduct: ${extracted.manufacturer} ${extracted.mpn}`,
      details: { core_product_id: coreProduct.id, extracted_product_id },
      performed_by: user.email,
      timestamp: new Date().toISOString()
    });

    return Response.json({ success: true, core_product_id: coreProduct.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});