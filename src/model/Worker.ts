import { env, pipeline, TextStreamer } from '@huggingface/transformers';
import type { PipelineType, Pipeline, ProgressCallback } from '@huggingface/transformers';

import Config from './Config.json';
import type { Input } from '../types/Type';

class ModelPipeline {
    static instance: Promise<Pipeline> | undefined;

    static async getInstance(input: Input, progress_callback?: ProgressCallback) {
        env.allowRemoteModels = true;
        env.allowLocalModels = false;
        env.useBrowserCache = false;

        const options: any = {
            device: input.device,
            dtype: input.dtype,
            progress_callback
        };

        this.instance ??= pipeline<PipelineType>(input.task as PipelineType, input.model, options) as Promise<Pipeline>;

        return this.instance;
    }
}

self.addEventListener('message', async (e: MessageEvent<Input>) => {
    console.log(e.data);

    try {
        const generator = await ModelPipeline.getInstance(
            e.data,
            (x) => { self.postMessage(x) }
        );

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

        const prompt = e.data?.text || '';

        const messages = e.data.chat_template ? [
            {
                role: 'system',
                content: Config.defaults.system_role,
            },
            {
                role: 'user',
                content: prompt,
            },
        ] : `Your role: ${Config.defaults.system_role}\nPrompt: ${prompt}`;

        await generator(messages, {
            ...e.data.parameters,
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
