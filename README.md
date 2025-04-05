# Just Another AI Assistant - a HuggingFace Transformer.js Demo

> Try it [here](https://alankrantas.github.io/just-another-ai-assistant-huggingface-transformers-js/).
>
> The model may not load properly on mobile devices!

A simple demonstration modified from HuggingFace's [React-translator](https://github.com/huggingface/transformers.js/tree/main/examples/react-translator) example with TypeScript support.

The demo utilizes [`Transformers.js`](https://huggingface.co/docs/transformers.js/index) to load and run a smaller large language model (LLM) - or small language model (SLM) in the web browser. It uses `Vite`'s `Worker` to run the model in the background, hence this would have to be a React or Svelte app.

---

## "Small" Large Language Model

Among [models](https://llm.extractum.io/list/) require less than 4 or 8 GB VRAM, there are [not many](https://huggingface.co/models?pipeline_tag=text-generation&library=transformers.js&sort=trending) compatible with `Transformers.js`, and even fewer can be loaded and run without errors.

The ones I've successfully tested includes:

- `Phi-3-mini-4k-instruct` and `Phi-3.5-mini-instruct` (~7.7 VRAM; extremely slow)
- `TinyLlama-1.1B-Chat-v1.0` (2.2 VRAM; poor output)
- `Qwen2.5-0.5B-Instruct` (1 VRAM)
- `Qwen2.5-1.5B-Instruct` (3.1 VRAM; slightly slower than 0.5B)

For now I am using [`onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA`](https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA). Hopefully we will have some other small but powerful models available.

### Choose Model and Configure

You can define the model and additional configuration in `/src/llm/LLMConfig.json`.

The role prompt will be used as the system role (in third person), and the task prompt will be added before your prompt (in first person). Although these doesn't seem to have significant effects on these smaller language models.

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
