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
    const { manus_job_id, feedbacks } = body;

    if (!manus_job_id || !Array.isArray(feedbacks) || feedbacks.length === 0) {
      return Response.json({ error: "Missing manus_job_id or feedbacks array" }, { status: 400 });
    }

    const created = [];

    for (const fb of feedbacks) {
      if (!fb.feedback_type || !fb.analysis_summary) continue;

      const record = await base44.asServiceRole.entities.EstimationFeedback.create({
        manus_job_id,
        project_id: fb.project_id || null,
        feedback_type: fb.feedback_type,
        analysis_summary: fb.analysis_summary,
        suggested_improvements: fb.suggested_improvements || null,
        recommendation_data: fb.recommendation_data || null,
        confidence_score: fb.confidence_score || 75,
        review_status: "pending_review"
      });

      await base44.asServiceRole.entities.ManusAuditLog.create({
        manus_job_id,
        action_type: "ingestion",
        entity_type: "EstimationFeedback",
        entity_id: record.id,
        summary: `Estimation feedback ingested: ${fb.feedback_type}`,
        details: { fb },
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