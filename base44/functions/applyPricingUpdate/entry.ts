import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const { pricing_update_id } = await req.json();
    if (!pricing_update_id) {
      return Response.json({ error: "Missing pricing_update_id" }, { status: 400 });
    }

    const update = await base44.asServiceRole.entities.RawPricingUpdate.get(pricing_update_id);
    if (!update) {
      return Response.json({ error: "RawPricingUpdate not found" }, { status: 404 });
    }

    // Find and update SupplierMapping
    const existing = await base44.asServiceRole.entities.SupplierMapping.filter({
      supplier_sku: update.product_identifier,
      supplier_name: update.supplier_name
    });

    let supplierMappingId;
    if (existing.length > 0) {
      await base44.asServiceRole.entities.SupplierMapping.update(existing[0].id, {
        price: update.new_price,
        availability: update.availability_status,
        last_sync_date: new Date().toISOString()
      });
      supplierMappingId = existing[0].id;
    }

    // Mark pricing update as approved
    await base44.asServiceRole.entities.RawPricingUpdate.update(pricing_update_id, {
      review_status: "approved"
    });

    // Log action
    await base44.asServiceRole.entities.ManusAuditLog.create({
      manus_job_id: update.manus_job_id,
      action_type: "approval",
      entity_type: "RawPricingUpdate",
      entity_id: pricing_update_id,
      summary: `Pricing approved for ${update.product_identifier} @ ${update.supplier_name}: $${update.new_price}`,
      details: { pricing_update_id, supplier_mapping_id: supplierMappingId },
      performed_by: user.email,
      timestamp: new Date().toISOString()
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});