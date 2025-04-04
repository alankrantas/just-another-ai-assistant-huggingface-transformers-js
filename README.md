# Just Another AI Assistant - a HuggingFace Transformer.js Demo

> Try it [here](https://alankrantas.github.io/just-another-ai-assistant-huggingface-transformer/).

A simple demonstration modified from HuggingFace's [React-translator](https://github.com/huggingface/transformers.js/tree/main/examples/react-translator) example with TypeScript support.

The demo utilizes [`Transformer.js`](https://huggingface.co/docs/transformers.js/index) to load and run a (smaller) LLM (large language model) in the web browser. It uses `Vite`'s `Worker` to run the model in the background, hence this would have to be a React or Svelte app.

## Large Language Model

Among [models](https://llm.extractum.io/list/?4GB) require less than 4GB VRAM, There are [not many](https://huggingface.co/models?pipeline_tag=text-generation&library=transformers.js&sort=trending) supported by `Transformer.js`, and even fewer can be loaded and run properly. Due to some bundling issue of `Vite`, it's actually harder to load and run models locally.

The ones I've successfully tested includes:

- `Phi-3-mini-4k-instruct` and `Phi-3.5-mini-instruct` (extremely slow)
- `Qwen2.5-0.5B-Instruct` and `Qwen2.5-1.5B-Instruct`
- `TinyLlama-1.1B-Chat-v1.0` (poor output)

Right now I use `onnx-community/Qwen2.5-0.5B-Instruct-ONNX-MHA`. I know it's a Chinese model, and this is only meant as a demo anyway.

I add options to apply different roles and tasks as part of the prompts, although it doesn't seem to have significant effects on these smaller models.

### Choose Model and Modify Prompt

You can define the model and additional prompts in `src/llm/LLMConfig.json`.

The role prompt will be used as the system role (third person), and the task prompt will be added before your prompt (first person).

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
