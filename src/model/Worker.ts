import { env, pipeline, TextStreamer } from '@huggingface/transformers';
import type { PipelineType, TextGenerationPipeline, ProgressCallback } from '@huggingface/transformers';

import Config from './Config.json';

class ModelPipeline {
    static instance: Promise<TextGenerationPipeline> | undefined;

    static async getInstance(progress_callback?: ProgressCallback) {
        env.allowRemoteModels = true;
        env.allowLocalModels = false;
        env.useBrowserCache = false;

        this.instance ??= pipeline<PipelineType>(
            Config['task'] as PipelineType,
            Config.model,
            {
                progress_callback,
            }
        ) as Promise<TextGenerationPipeline>;

        return this.instance;
    }
}

self.addEventListener('message', async (e: MessageEvent<{ prompt: string }>) => {
    try {
        const generator = await ModelPipeline.getInstance((x) => {
            self.postMessage(x);
        });
    
        const streamer = new TextStreamer(generator.tokenizer, {
            skip_prompt: true,
            skip_special_tokens: true,
            callback_function: (text) => {
                self.postMessage({
                    status: 'update',
                    output: text,
                });
            },
        });
    
        const messages = Config['chat_template'] ? [
            {
                role: 'system',
                content: Config['system_role'],
            },
            {
                role: 'user',
                content: e.data?.prompt || '',
            },
        ] : e.data?.prompt || '';
    
        await generator(messages, {
            ...Config.config,
            return_full_text: false,
            streamer,
        });

        self.postMessage({
            status: 'complete',
        });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        self.postMessage({
            status: 'error',
            output: message,
        });

    }
});
