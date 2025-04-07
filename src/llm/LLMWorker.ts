import { env, pipeline, TextStreamer } from '@huggingface/transformers';
import type { PipelineType, TextGenerationPipeline, ProgressCallback } from '@huggingface/transformers';

import LLMConfig from './LLMConfig.json';

class LLMWorker {
    static instance: Promise<TextGenerationPipeline> | undefined;

    static async getInstance(progress_callback?: ProgressCallback) {
        env.allowRemoteModels = true;
        env.allowLocalModels = false;
        env.useBrowserCache = false;

        this.instance ??= pipeline<PipelineType>(
            LLMConfig['task'] as PipelineType,
            LLMConfig.model,
            {
                progress_callback,
            }
        ) as Promise<TextGenerationPipeline>;

        return this.instance;
    }
}

self.addEventListener('message', async (e: MessageEvent<{ prompt: string }>) => {
    try {
        const generator = await LLMWorker.getInstance((x) => {
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
    
        const messages = LLMConfig['chat_template'] ? [
            {
                role: 'system',
                content: LLMConfig['system_role'],
            },
            {
                role: 'user',
                content: e.data?.prompt || '',
            },
        ] : e.data?.prompt || '';
    
        await generator(messages, {
            max_new_tokens: LLMConfig.config.max_new_tokens,
            temperature: LLMConfig.config.temperature,
            top_p: LLMConfig.config.top_p,
            repetition_penalty: LLMConfig.config.repetition_penalty,
            do_sample: LLMConfig.config.do_sample,
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
