export function buildSystemPrompt(memories: string[]): string {
  if (memories.length === 0) {
    return `You are a helpful AI assistant.`;
  }

  const memorySection = memories.map((m, i) => `${i + 1}. ${m}`).join("\n");

  return `You are a helpful AI assistant with memory of this user.

You remember the following facts about this user:
${memorySection}

Use these facts naturally when relevant. Do not say "I remember" or mention having a memory system. Weave relevant facts in as if you simply know them. Ignore facts that aren't relevant to the current message.`;
}