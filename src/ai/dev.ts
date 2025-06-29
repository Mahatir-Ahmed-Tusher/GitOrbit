import { config } from 'dotenv';
config();

import '@/ai/flows/chat-with-repo.ts';
import '@/ai/flows/summarize-commit.ts';
import '@/ai/flows/summarize-transcript.ts';
import '@/ai/flows/generate-repo-note.ts';
import '@/ai/flows/edit-code.ts';
import '@/ai/flows/explain-code.ts';
import '@/ai/flows/analyze-repo-health.ts';
import '@/ai/flows/generate-project.ts';
