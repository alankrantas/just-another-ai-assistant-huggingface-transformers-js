# Just Another AI Assistant - a HuggingFace Transformer.js Demo

> Try it [here](https://alankrantas.github.io/just-another-ai-assistant-huggingface-transformers-js/).
>
> The model may not run properly on your devices with insufficient RAM!

A simple demonstration modified from HuggingFace's [React-translator](https://github.com/huggingface/transformers.js/tree/main/examples/react-translator) example with TypeScript support.

The demo utilizes [`Transformers.js`](https://huggingface.co/docs/transformers.js/index) to load and run a smaller large language model (LLM) - or small language model (SLM) in the web browser. It uses `Vite`'s `Worker` to run the model in the background, hence this would have to be a React or Svelte app.

---

## "Small" Large Language Model and Configuration

You can define the [models](https://huggingface.co/models?pipeline_tag=text-generation&library=transformers.js&sort=trending), [tasks](https://huggingface.co/docs/transformers.js/main/en/index#tasks), [device](https://github.com/huggingface/transformers.js/blob/main/src/utils/devices.js) and model parameters in `/src/model/Config.json`:

```json
{
    "models": {
        "SmolLM2-135M-Instruct": "HuggingFaceTB/SmolLM2-135M-Instruct",
        "SmolLM2-360M-Instruct": "HuggingFaceTB/SmolLM2-360M-Instruct",
        "OpenELM-270M-Instruct": "Xenova/OpenELM-270M-Instruct",
        "Qwen2.5-0.5B-Instruct": "Mozilla/Qwen2.5-0.5B-Instruct",
        "Qwen2.5-1.5B-Instruct": "onnx-community/Qwen2.5-1.5B-Instruct",
        "Phi-3-mini-4k-Instruct": "Xenova/Phi-3-mini-4k-instruct",
        "Phi-3.5-mini-Instruct": "onnx-community/Phi-3.5-mini-instruct-onnx-web",
        "Gemma-3-1B-It": "onnx-community/gemma-3-1b-it-ONNX",
        "Falcon3-1B-Instruct": "onnx-community/Falcon3-1B-Instruct",
        "TinyLlama-1.1B-Chat": "Xenova/TinyLlama-1.1B-Chat-v1.0",
        "TinySwallow-1.5B-Instruct": "onnx-community/TinySwallow-1.5B-Instruct-ONNX"
    },
    "tasks": {
        "Text Generation": "text-generation",
        "Text-to-text Generation": "text2text-generation",
        "Text Classification": "text-classification",
        "Question Answering": "question-answering",
        "Summarization": "summarization",
        "Fill-Mask": "fill-mask",
        "Translation": "translation"
    },
    "devices": {
        "WASM": "wasm",
        "WebGPU": "webgpu"
    },
    "system_role": "You are a helpful, honest, objective, unbiased professional expert assistant. Be concise and to the point. Use the same language of the user and format your responses.",
    "parameters": {
        "max_new_tokens": 2048,
        "temperature": 0.2,
        "top_p": 0.95,
        "top_k": 30,
        "repetition_penalty": 1.05,
        "do_sample": true
    }
}
```

Be noted that not all model works, and WASM/WebGPU may not work on some devices and models. [dtype](https://github.com/huggingface/transformers.js/blob/main/src/utils/dtypes.js) is set to `auto`.

You can add other paramgers under `parameters` (they will be passed to the model).

A "chat template" will be used for instruct models, which may also not supported by some other models:

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
