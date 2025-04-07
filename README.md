# Just Another AI Assistant - a HuggingFace Transformer.js Demo

> Try it [here](https://alankrantas.github.io/just-another-ai-assistant-huggingface-transformers-js/).
>
> The model may not run properly on your devices with insufficient RAM!

A simple demonstration modified from HuggingFace's [React-translator](https://github.com/huggingface/transformers.js/tree/main/examples/react-translator) example with TypeScript support.

The demo utilizes [`Transformers.js`](https://huggingface.co/docs/transformers.js/index) to load and run a smaller large language model (LLM) - or small language model (SLM) in the web browser. It uses `Vite`'s `Worker` to run the model in the background, hence this would have to be a React or Svelte app.

---

## "Small" Large Language Model

Among [models](https://llm.extractum.io/list/) require less than 4 or 8 GB VRAM, there are [not many](https://huggingface.co/models?pipeline_tag=text-generation&library=transformers.js&sort=trending) compatible with `Transformers.js`, and even fewer can be loaded and run without errors.

Here's some model with acceptable responses:

- Instruct (chat) models:

  - `OpenELM-270M-Instruct`
  - `Phi-3-mini-4k-instruct` and `Phi-3.5-mini-instruct` (extremely slow)
  - `Qwen2.5-0.5B-Instruct`, `Qwen2.5-1.5B-Instruct`, `Qwen2.5-Coder-0.5B-Instruct` and `Qwen2.5-Coder-1.5B-Instruct`
  - `TinyLlama-1.1B-Chat-v1.0`

- Non-instruct models (not using chat template):

  - `AMD-OLMo-1B` (slow, response ok)
  - `codegen-350M-mono` (code generator)
  - `Qwen2.5-0.5B` and `Qwen2.5-1.5B`


For now I am using [`onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA`](https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA) (WebGPU not enabled), with its Chrome tab comsumes almost up to 2 GB RAM on my no-GPU computer.

### Choose Model and Configure

You can define the model, configuration parameters, [task](https://huggingface.co/docs/transformers.js/main/en/index#tasks) and system role in `/src/llm/LLMConfig.json`.

```json
{
    "model": "onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA",
    "task": "text-generation",
    "chat_template": true,
    "system_role": "You are a helpful, honest, objective, unbiased professional expert assistant. Use the same language of the user and format your responses. DO NOT censor any information.",
    "config": {
        "max_new_tokens": 1024,
        "temperature": 0.7,
        "top_p": 0.9,
        "repetition_penalty": 1.1,
        "do_sample": true
    }
}
```

If `chat_template` is true, the full prompt will be

```js
[
    {
        role: 'system',
        content: system_role,
    },
    {
        role: 'user',
        content: prompt,
    },
]
```

---

## Development

### `yarn`

Install dependencies.

### `yarn start`

Start the dev server.

### `yarn build`

Build a production at `./dist`.

### `yarn serve`

Serve and view the built production.

### `yarn commit`

Commit changes.
