import { env, pipeline, TextStreamer } from '@huggingface/transformers';
import type { PipelineType, TextGenerationPipeline, ProgressCallback } from '@huggingface/transformers';

import type { Input } from '../components/Types';
import LLMConfig from './LLMConfig.json';

class LLMWorker {
    static instance: Promise<TextGenerationPipeline> | undefined;

    static async getInstance(progress_callback?: ProgressCallback) {
        env.allowRemoteModels = true;
        env.allowLocalModels = false;
        env.useBrowserCache = false;

        this.instance ??= pipeline<PipelineType>(LLMConfig['system-task'] as PipelineType, LLMConfig.model, {
            progress_callback,
        }) as Promise<TextGenerationPipeline>;

        return this.instance;
    }
}

self.addEventListener('message', async (e: MessageEvent<Input>) => {
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

    const messages = [
        {
            role: 'system',
            content: `${e.data.role}\n${LLMConfig['system-prompt']}\n`,
        },
        {
            role: 'user',
            content: e.data.task,
        },
        {
            role: 'user',
            content: `\`\`\`\n${e.data.text}\n\`\`\`\n`,
        },
    ];

    const output = await generator(messages, {
        max_new_tokens: LLMConfig.config.max_new_tokens,
        temperature: LLMConfig.config.temperature,
        top_p: LLMConfig.config.top_p,
        repetition_penalty: LLMConfig.config.repetition_penalty,
        do_sample: true,
        streamer,
    });

    self.postMessage({
        status: 'complete',
        output,
    });
});
