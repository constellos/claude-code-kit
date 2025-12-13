/**
 * SubagentStop hook - Log agent edits and cleanup context
 *
 * This hook runs when a subagent completes execution.
 * It analyzes the agent's transcript to extract:
 * - New files created
 * - Files deleted
 * - Files edited
 * - Agent prompt and type
 *
 * Then it cleans up the saved context from SubagentStart.
 *
 * Import this hook in any plugin that needs to track subagent file operations.
 */

import type { SubagentStopInput, SubagentStopHookOutput } from '../lib/types.js';
import { getAgentEdits } from '../lib/subagent-state.js';
import { debug } from '../lib/debug.js';

const log = debug('subagent-stop');

export default async function (input: SubagentStopInput): Promise<SubagentStopHookOutput> {
  log('SubagentStop hook triggered');
  log('Agent ID:', input.agent_id);
  log('Agent Transcript:', input.agent_transcript_path);

  try {
    const edits = await getAgentEdits(input.agent_transcript_path);

    log('─────────────────────────────────────────');
    log('Agent Analysis Complete');
    log('─────────────────────────────────────────');
    log('Agent Type:', edits.subagentType);
    log('Agent Prompt:', edits.agentPrompt.slice(0, 100) + (edits.agentPrompt.length > 100 ? '...' : ''));

    if (edits.agentFile) {
      log('Agent Definition:', edits.agentFile);
    }

    if (edits.agentPreloadedSkillsFiles.length > 0) {
      log('Preloaded Skills:', edits.agentPreloadedSkillsFiles.length);
      edits.agentPreloadedSkillsFiles.forEach((skill) => {
        log('  -', skill);
      });
    }

    if (edits.agentNewFiles.length > 0) {
      log('Files Created:', edits.agentNewFiles.length);
      edits.agentNewFiles.forEach((file) => {
        log('  +', file);
      });
    }

    if (edits.agentEditedFiles.length > 0) {
      log('Files Edited:', edits.agentEditedFiles.length);
      edits.agentEditedFiles.forEach((file) => {
        log('  ~', file);
      });
    }

    if (edits.agentDeletedFiles.length > 0) {
      log('Files Deleted:', edits.agentDeletedFiles.length);
      edits.agentDeletedFiles.forEach((file) => {
        log('  -', file);
      });
    }

    if (edits.agentNewFiles.length === 0 &&
        edits.agentEditedFiles.length === 0 &&
        edits.agentDeletedFiles.length === 0) {
      log('No file operations detected');
    }

    log('─────────────────────────────────────────');

    return {};
  } catch (error) {
    log('Error analyzing agent edits:', error);
    return {};
  }
}
