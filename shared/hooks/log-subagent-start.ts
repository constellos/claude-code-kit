/**
 * SubagentStart hook - Save agent context for later retrieval
 *
 * This hook runs when a subagent begins execution (via Task tool).
 * It saves the agent's context (type, prompt, toolUseId) to .claude/logs/subagent-tasks.json
 * so it can be retrieved later in SubagentStop.
 *
 * Import this hook in any plugin that needs to track subagent execution.
 */

import type { SubagentStartInput, SubagentStartHookOutput } from '../lib/types.js';
import { saveAgentStartContext } from '../lib/subagent-state.js';
import { debug } from '../lib/debug.js';

const log = debug('subagent-start');

export default async function (input: SubagentStartInput): Promise<SubagentStartHookOutput> {
  log('SubagentStart hook triggered');
  log('Agent ID:', input.agent_id);
  log('Agent Type:', input.agent_type);
  log('Session ID:', input.session_id);

  try {
    const context = await saveAgentStartContext({
      agent_id: input.agent_id,
      agent_type: input.agent_type,
      session_id: input.session_id,
      cwd: input.cwd,
      transcript_path: input.transcript_path,
    });

    log('Saved agent context:', context);
    log('Context includes:');
    log('  - Prompt:', context.prompt.slice(0, 100) + (context.prompt.length > 100 ? '...' : ''));
    log('  - Tool Use ID:', context.toolUseId);
    log('  - Timestamp:', context.timestamp);

    return {
      hookSpecificOutput: {
        hookEventName: 'SubagentStart',
      },
    };
  } catch (error) {
    log('Error saving agent context:', error);
    return {
      hookSpecificOutput: {
        hookEventName: 'SubagentStart',
      },
    };
  }
}
