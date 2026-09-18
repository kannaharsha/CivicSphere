import { Router, Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';

const router = Router();

// Root directory of the project
const projectRoot = path.resolve(process.cwd());
const pythonScriptPath = path.join(projectRoot, 'RAG+LLM', 'query_understanding.py');

/**
 * POST /api/ai/query-understanding
 * Connects the AI Assistant chat interface with Phase 2 User Query Understanding (Steps 10 -> 14).
 */
router.post('/query-understanding', async (req: Request, res: Response): Promise<void> => {
  const {
    original_query,
    query,
    prompt,
    user_id,
    userId = 'Civs1001',
    session_id,
    sessionId,
    conversation_id,
    conversationId,
    input_type,
    inputType = 'text'
  } = req.body;

  const userPrompt = (original_query || query || prompt || '').trim();
  const effectiveUserId = user_id || userId || 'Civs1001';
  const effectiveSessionId = session_id || sessionId;
  const effectiveConvId = conversation_id || conversationId;
  const effectiveInputType = input_type || inputType || 'text';

  if (!userPrompt) {
    res.status(400).json({
      success: false,
      error: 'Query or prompt is required.'
    });
    return;
  }

  const isVoice = String(effectiveInputType).toLowerCase() === 'voice';

  // Build python command arguments
  const args = [
    pythonScriptPath,
    '--query', userPrompt,
    '--user-id', String(effectiveUserId),
    '--raw-json'
  ];

  if (effectiveSessionId) {
    args.push('--session-id', String(effectiveSessionId));
  }
  if (effectiveConvId) {
    args.push('--conversation-id', String(effectiveConvId));
  }
  if (isVoice) {
    args.push('--voice');
  }

  console.log(`\n================================================================================`);
  console.log(`[AI ASSIST] Phase 2: Processing User Query Understanding...`);
  console.log(`[AI ASSIST] User Query: "${userPrompt}" (Type: ${isVoice ? 'voice' : 'text'})`);
  console.log(`================================================================================`);

  try {
    const pythonProcess = spawn('python', args, {
      cwd: projectRoot,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`[AI ASSIST ERROR] Python process exited with code ${code}:`, stderrData);
        res.status(500).json({
          success: false,
          error: 'Failed to process query understanding in Python pipeline.',
          details: stderrData
        });
        return;
      }

      try {
        const parsedResult = JSON.parse(stdoutData.trim());

        console.log(`[AI ASSIST PHASE 2 SUCCESS]`);
        console.log(`  - Intent   : ${parsedResult.structured_intent?.intent}`);
        console.log(`  - Scheme   : ${parsedResult.structured_intent?.scheme_name || 'None'}`);
        console.log(`  - Sector   : ${parsedResult.structured_intent?.sector}`);
        console.log(`  - State    : ${parsedResult.personalized_eligibility_filters?.eligible_state}`);
        console.log(`  - Score    : ${parsedResult.personalized_eligibility_filters?.priority_matching_score}`);
        console.log(`================================================================================\n`);

        res.json({
          success: true,
          data: parsedResult
        });
      } catch (parseErr: any) {
        console.error('[AI ASSIST ERROR] Failed to parse Python JSON output:', stdoutData);
        res.status(500).json({
          success: false,
          error: 'Invalid JSON returned from query understanding pipeline.',
          raw: stdoutData
        });
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('[AI ASSIST ERROR] Failed to spawn Python process:', err);
      res.status(500).json({
        success: false,
        error: 'Could not spawn Python query understanding process.',
        message: err.message
      });
    });

  } catch (err: any) {
    console.error('[AI ASSIST EXCEPTION]:', err);
    res.status(500).json({
      success: false,
      error: 'Unexpected error executing query understanding.',
      message: err.message
    });
  }
});

const retrievalScriptPath = path.join(projectRoot, 'RAG+LLM', 'retrieval_pipeline.py');

/**
 * POST /api/ai/retrieval
 * Connects AI Assistant to Phase 3 Retrieval (Hybrid RAG Pipeline, Steps 15 -> 19).
 */
router.post('/retrieval', async (req: Request, res: Response): Promise<void> => {
  const {
    query,
    original_query,
    prompt,
    userId = 'Civs1001',
    user_id,
    inputType = 'text',
    input_type,
    topK = 10
  } = req.body;

  const userPrompt = (query || original_query || prompt || '').trim();
  const effectiveUserId = user_id || userId || 'Civs1001';
  const effectiveInputType = input_type || inputType || 'text';
  const isVoice = String(effectiveInputType).toLowerCase() === 'voice';

  if (!userPrompt) {
    res.status(400).json({
      success: false,
      error: 'Query or prompt is required for retrieval.'
    });
    return;
  }

  const args = [
    retrievalScriptPath,
    '--query', userPrompt,
    '--user-id', String(effectiveUserId),
    '--top-k', String(topK),
    '--raw-json'
  ];

  if (isVoice) {
    args.push('--voice');
  }

  console.log(`\n================================================================================`);
  console.log(`[AI ASSIST] Phase 3: Executing Hybrid Retrieval (Steps 15 -> 19)...`);
  console.log(`[AI ASSIST] Query: "${userPrompt}"`);
  console.log(`================================================================================`);

  try {
    const pythonProcess = spawn('python', args, {
      cwd: projectRoot,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`[AI ASSIST ERROR] Retrieval Python process exited with code ${code}:`, stderrData);
        res.status(500).json({
          success: false,
          error: 'Failed to process retrieval in Python pipeline.',
          details: stderrData
        });
        return;
      }

      try {
        const parsedResult = JSON.parse(stdoutData.trim());

        console.log(`[AI ASSIST PHASE 3 SUCCESS]`);
        console.log(`  - Candidate Schemes (Supabase) : ${parsedResult.FilteredCandidates?.total_candidates}`);
        console.log(`  - Top Chunks Retrieved         : ${parsedResult.TopKChunks?.retrieved_count}`);
        console.log(`  - Re-ranked Context Chunks     : ${parsedResult.RankedContext?.total_ranked}`);
        console.log(`  - Retrieval Confidence Score   : ${parsedResult.RetrievalConfidence?.final_confidence_score} (${parsedResult.RetrievalConfidence?.confidence_category})`);
        console.log(`  - Fallback Triggered           : ${parsedResult.RetrievalConfidence?.fallback_triggered}`);
        console.log(`================================================================================\n`);

        res.json({
          success: true,
          data: parsedResult
        });
      } catch (parseErr: any) {
        console.error('[AI ASSIST ERROR] Failed to parse Python Retrieval JSON output:', stdoutData);
        res.status(500).json({
          success: false,
          error: 'Invalid JSON returned from retrieval pipeline.',
          raw: stdoutData
        });
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('[AI ASSIST ERROR] Failed to spawn Retrieval Python process:', err);
      res.status(500).json({
        success: false,
        error: 'Could not spawn Python retrieval process.',
        message: err.message
      });
    });

  } catch (err: any) {
    console.error('[AI ASSIST EXCEPTION]:', err);
    res.status(500).json({
      success: false,
      error: 'Unexpected error executing retrieval.',
      message: err.message
    });
  }
});

const contextAssemblyScriptPath = path.join(projectRoot, 'RAG+LLM', 'context_assembly.py');

/**
 * POST /api/ai/context-assembly
 * Connects AI Assistant to Phase 4 Context Assembly (Steps 20 -> 21).
 * Produces VerifiedContextPackage and StrictLLMPrompt for Groq Llama.
 */
router.post('/context-assembly', async (req: Request, res: Response): Promise<void> => {
  const {
    query,
    original_query,
    prompt,
    userId = 'Civs1001',
    user_id,
    inputType = 'text',
    input_type
  } = req.body;

  const userPrompt = (query || original_query || prompt || '').trim();
  const effectiveUserId = user_id || userId || 'Civs1001';
  const effectiveInputType = input_type || inputType || 'text';
  const isVoice = String(effectiveInputType).toLowerCase() === 'voice';

  if (!userPrompt) {
    res.status(400).json({
      success: false,
      error: 'Query or prompt is required for context assembly.'
    });
    return;
  }

  const args = [
    contextAssemblyScriptPath,
    '--query', userPrompt,
    '--user-id', String(effectiveUserId),
    '--raw-json'
  ];

  if (isVoice) {
    args.push('--voice');
  }

  console.log(`\n================================================================================`);
  console.log(`[AI ASSIST] Phase 4: Executing Context Assembly (Steps 20 -> 21)...`);
  console.log(`[AI ASSIST] Query: "${userPrompt}"`);
  console.log(`================================================================================`);

  try {
    const pythonProcess = spawn('python', args, {
      cwd: projectRoot,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`[AI ASSIST ERROR] Context Assembly Python process exited with code ${code}:`, stderrData);
        res.status(500).json({
          success: false,
          error: 'Failed to process context assembly in Python pipeline.',
          details: stderrData
        });
        return;
      }

      try {
        const parsedResult = JSON.parse(stdoutData.trim());

        console.log(`[AI ASSIST PHASE 4 SUCCESS]`);
        console.log(`  - Matched Scheme  : ${parsedResult.VerifiedContextPackage?.matching_scheme_information?.scheme_name}`);
        console.log(`  - Status          : ${parsedResult.VerifiedContextPackage?.eligibility_checklist?.overall_status}`);
        console.log(`  - Verified Docs   : ${parsedResult.VerifiedContextPackage?.required_documents_checklist?.length}`);
        console.log(`  - Target Model    : ${parsedResult.StrictLLMPrompt?.target_model}`);
        console.log(`  - Grounding Rules : ${parsedResult.StrictLLMPrompt?.prompt_rules?.length}`);
        console.log(`================================================================================\n`);

        res.json({
          success: true,
          data: parsedResult
        });
      } catch (parseErr: any) {
        console.error('[AI ASSIST ERROR] Failed to parse Context Assembly JSON output:', stdoutData);
        res.status(500).json({
          success: false,
          error: 'Invalid JSON returned from context assembly pipeline.',
          raw: stdoutData
        });
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('[AI ASSIST ERROR] Failed to spawn Context Assembly Python process:', err);
      res.status(500).json({
        success: false,
        error: 'Could not spawn Python context assembly process.',
        message: err.message
      });
    });

  } catch (err: any) {
    console.error('[AI ASSIST EXCEPTION]:', err);
    res.status(500).json({
      success: false,
      error: 'Unexpected error executing context assembly.',
      message: err.message
    });
  }
});

const groundedLlmScriptPath = path.join(projectRoot, 'RAG+LLM', 'grounded_llm.py');

/**
 * POST /api/ai/chat
 * Full End-to-End CivicSphere AI Assist Generation Pipeline (Phase 2 -> 3 -> 4 -> 5).
 * Receives user prompt from frontend chat and returns verified, grounded response with citations.
 */
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  const {
    query,
    original_query,
    prompt,
    message,
    userId = 'Civs1001',
    user_id,
    inputType = 'text',
    input_type,
    target_scheme_id,
    scheme_id,
    schemeId,
    target_scheme_name,
    scheme_name,
    schemeName
  } = req.body;

  const userPrompt = (query || original_query || prompt || message || '').trim();
  const effectiveUserId = user_id || userId || 'Civs1001';
  const effectiveInputType = input_type || inputType || 'text';
  const isVoice = String(effectiveInputType).toLowerCase() === 'voice';
  const effectiveSchemeId = target_scheme_id || scheme_id || schemeId;
  const effectiveSchemeName = target_scheme_name || scheme_name || schemeName;

  if (!userPrompt) {
    res.status(400).json({
      success: false,
      error: 'Query or message is required.'
    });
    return;
  }

  const args = [
    groundedLlmScriptPath,
    '--query', userPrompt,
    '--user-id', String(effectiveUserId),
    '--raw-json'
  ];

  if (effectiveSchemeId) {
    args.push('--scheme-id', String(effectiveSchemeId));
  }
  if (effectiveSchemeName) {
    args.push('--scheme-name', String(effectiveSchemeName));
  }

  if (isVoice) {
    args.push('--voice');
  }

  console.log(`\n================================================================================`);
  console.log(`[AI ASSIST] Full Pipeline (Phase 2 -> 3 -> 4 -> 5): Grounded Generation...`);
  console.log(`[AI ASSIST] Citizen Prompt: "${userPrompt}"`);
  if (effectiveSchemeId) {
    console.log(`[AI ASSIST] Target Scheme ID: ${effectiveSchemeId} (${effectiveSchemeName || 'unnamed'})`);
  }
  console.log(`================================================================================`);

  try {
    const pythonProcess = spawn('python', args, {
      cwd: projectRoot,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`[AI ASSIST ERROR] Grounded LLM Python process exited with code ${code}:`, stderrData);
        res.status(500).json({
          success: false,
          error: 'Failed to generate grounded response in Python pipeline.',
          details: stderrData
        });
        return;
      }

      try {
        const parsedResult = JSON.parse(stdoutData.trim());
        const verified = parsedResult.VerifiedResponse || {};

        console.log(`[AI ASSIST PHASE 5 SUCCESS]`);
        console.log(`  - Recommended Scheme : ${verified.recommended_scheme}`);
        console.log(`  - Eligibility Status : ${verified.eligibility_status}`);
        console.log(`  - Confidence         : ${verified.confidence_percentage} (${verified.confidence_category})`);
        console.log(`  - Official Link      : ${verified.primary_registration_link}`);
        console.log(`  - Citations Attached : ${verified.citation_sources?.length}`);
        console.log(`================================================================================\n`);

        res.json({
          success: true,
          data: verified,
          raw_pipeline: parsedResult
        });
      } catch (parseErr: any) {
        console.error('[AI ASSIST ERROR] Failed to parse Grounded LLM JSON output:', stdoutData);
        res.status(500).json({
          success: false,
          error: 'Invalid JSON returned from grounded LLM pipeline.',
          raw: stdoutData
        });
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('[AI ASSIST ERROR] Failed to spawn Grounded LLM Python process:', err);
      res.status(500).json({
        success: false,
        error: 'Could not spawn Python grounded LLM process.',
        message: err.message
      });
    });

  } catch (err: any) {
    console.error('[AI ASSIST EXCEPTION]:', err);
    res.status(500).json({
      success: false,
      error: 'Unexpected error executing grounded LLM.',
      message: err.message
    });
  }
});

export default router;


