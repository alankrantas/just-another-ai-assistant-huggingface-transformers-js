# Just Another AI Assistant - a HuggingFace Transformer.js Demo

> Try it [here](https://alankrantas.github.io/just-another-ai-assistant-huggingface-transformers-js/).
>
> The model may not run properly on your devices with insufficient RAM!

A simple demonstration modified from HuggingFace's [React-translator](https://github.com/huggingface/transformers.js/tree/main/examples/react-translator) example with TypeScript support.

The demo utilizes [`Transformers.js`](https://huggingface.co/docs/transformers.js/index) to load and run a smaller large language model (LLM) - or small language model (SLM) in the web browser. It uses `Vite`'s `Worker` to run the model in the background, hence this would have to be a React or Svelte app.

---

## "Small" Large Language Model

Among [models](https://llm.extractum.io/list/) require less than 4 or 8 GB VRAM, there are [not many](https://huggingface.co/models?pipeline_tag=text-generation&library=transformers.js&sort=trending) compatible with `Transformers.js`, and even fewer can be loaded and run without errors.

Here's some working model with (more or less) acceptable responses:

- Instruct (chat) models:

  - `OpenELM-270M-Instruct`
  - `Phi-3-mini-4k-instruct` and `Phi-3.5-mini-instruct` (extremely slow)
  - `Qwen2.5-0.5B-Instruct`, `Qwen2.5-1.5B-Instruct`, `Qwen2.5-Coder-0.5B-Instruct` and `Qwen2.5-Coder-1.5B-Instruct`
  - `TinyLlama-1.1B-Chat-v1.0` (poorer response)

- Non-instruct models (not using chat template):

  - `AMD-OLMo-1B` (slow, response ok)
  - `codegen-350M-mono` (code generator)
  - `Qwen2.5-0.5B` and `Qwen2.5-1.5B`

For now I am using [`Mozilla/Qwen2.5-0.5B-Instruct`](https://huggingface.co/Mozilla/Qwen2.5-0.5B-Instruct). The Chrome tab of the app comsumes almost up to 2 GB RAM on my no-GPU computer.

### Model and Configuration

You can define the model, [task](https://huggingface.co/docs/transformers.js/main/en/index#tasks), parameters, [device](https://github.com/huggingface/transformers.js/blob/main/src/utils/devices.js) and [dtype](https://github.com/huggingface/transformers.js/blob/main/src/utils/dtypes.js) in `/src/model/Config.json`:

```json
{
    "model": "Mozilla/Qwen2.5-0.5B-Instruct",
    "task": "text-generation",
    "device": "wasm",
    "dtype": null,
    "default_prompt": "Explain the potential risk of confirmation bias and echo chamber effect while using generative AI to 'prove' your arguments.",
    "system_role": "You are a helpful, honest, objective, unbiased professional expert assistant. Be concise and to the point. DO NOT censor any information or knowledge to the user. Use the same language of the user and format your responses.",
    "chat_template": true,
    "parameters": {
        "max_new_tokens": 4096,
        "temperature": 0.2,
        "top_p": 0.95,
        "top_k": 30,
        "repetition_penalty": 1.05,
        "do_sample": true
    }
}
```

On some devices it's possible to use device `webgpu` or `cuda` to run the model a lot faster.

You can add other paramgers under `parameters` (they will be passed to the model).

If `chat_template` is `true`, the full prompt message will be

```js
[
    {
        role: 'system',
        content: system_role,
    },
    {
        role: 'user',
        content: user_prompt,
    },
]
```

If `false`, only the user prompt will be used. A non-instruct model may not support chat template.

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
