import { env, pipeline, TextStreamer } from '@huggingface/transformers';
import type { PipelineType, Pipeline, ProgressCallback } from '@huggingface/transformers';

import type { Input } from '../types/Type';

interface ModelParameters {
    model: string;
    task: string;
    device: string;
    dtype: string;
    progress_callback: ProgressCallback;
}

class ModelPipeline {
    static instance: Promise<Pipeline> | undefined;

    static async getInstance(parameters: ModelParameters) {
        env.allowRemoteModels = true;
        env.allowLocalModels = false;
        env.useBrowserCache = false;

        const options: any = {
            device: parameters.device,
            dtype: parameters.dtype,
            progress_callback: parameters.progress_callback,
        };

        this.instance ??= pipeline<PipelineType>(
            parameters.task as PipelineType,
            parameters.model,
            options,
        ) as Promise<Pipeline>;

        return this.instance;
    }
}

self.addEventListener('message', async (e: MessageEvent<Input>) => {
    const input = e.data;
    console.log(input);

    try {
        const generator = await ModelPipeline.getInstance(
            {
                model: input.model,
                task: input.task,
                device: input.device,
                dtype: input.dtype,
                progress_callback: (x) => { self.postMessage(x) },
            }
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

        const prompt = input.text || '';

        const message = input.system_role ? [
            {
                role: 'system',
                content: input.system_role,
            },
            {
                role: 'user',
                content: prompt,
            },
        ] : prompt;

        console.log(message);

        await generator(message, {
            ...input.parameters,
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
