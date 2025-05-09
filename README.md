# Just Another AI Assistant - a HuggingFace Transformer.js Demo

> Try it [here](https://alankrantas.github.io/just-another-ai-assistant-huggingface-transformers-js/).
>
> The model may not run properly on your devices with insufficient RAM!

A simple demonstration modified from HuggingFace's [React-translator](https://github.com/huggingface/transformers.js/tree/main/examples/react-translator) example with TypeScript support.

The demo utilizes [`Transformers.js`](https://huggingface.co/docs/transformers.js/index) to load and run a smaller large language model (LLM) - or small language model (SLM) in the web browser. The app uses `Vite`'s `Worker` to run the model in the background, hence this would have to be a React or Svelte app.

---

## "Small" Large Language Models and Configuration

You can define the [models](https://huggingface.co/models?pipeline_tag=text-generation&library=transformers.js&sort=trending), [tasks](https://huggingface.co/docs/transformers.js/main/en/index#tasks), [device](https://github.com/huggingface/transformers.js/blob/main/src/utils/devices.js) and other model parameters in `/src/model/Config.json`:

Notes:

* The model loading time and memory usage mostly depends on model size. It is recommended to have at least 4-8 GB free memory on your device.
* System roles may not work well on certain models.
* Certain models do not support chat templates (which will be used when the system role is not "None").
* Certain devices and dtype options may not work for certain models.
* After loading a model, you must refresh the page to load a different one. There is no way to release the old model from the memory, and trying to load more than two models proved to be problematic.

```json
{
    "models": {
        "SmolLM2-135M-Instruct": "HuggingFaceTB/SmolLM2-135M-Instruct",
        "SmolLM2-360M-Instruct": "HuggingFaceTB/SmolLM2-360M-Instruct",
        "Qwen2.5-0.5B-Instruct": "Mozilla/Qwen2.5-0.5B-Instruct",
        "Qwen3-0.6B": "onnx-community/Qwen3-0.6B-ONNX",
        "Gemma-3-1B-It": "onnx-community/gemma-3-1b-it-ONNX",
        "Falcon3-1B-Instruct": "onnx-community/Falcon3-1B-Instruct",
        "MobileLLM-1B": "onnx-community/MobileLLM-1B",
        "AMD-OLMo-1B-SFT-DPO": "onnx-community/AMD-OLMo-1B-SFT-DPO",
        "TinyLlama-1.1B-Chat": "Xenova/TinyLlama-1.1B-Chat-v1.0",
        "ZR1-1.5B": "onnx-community/ZR1-1.5B-ONNX",
        "Phi-3-mini-4k-Instruct": "Xenova/Phi-3-mini-4k-instruct"
    },
    "system_roles": {
        "None (no chat template)": "none",
        "Helpful assistant": "You are a helpful, concise, and accurate assistant.",
        "Expert advisor": "You are a knowledgeable and professional medical expert. Provide clear, evidence-based answers.",
        "Socratic guide": "You are a Socratic tutor. Ask thoughtful questions to guide the user to their own conclusions.",
        "Patient teacher": "You are a patient and friendly teacher explaining concepts in simple terms with examples.",
        "Quiz generator": "You are a quiz master. Generate multiple-choice questions to test knowledge of a topic.",
        "Code assistant": "You are a skilled software engineer. Help the user write clean, efficient code.",
        "Documentation writer": "You are a technical writer who creates clear and concise documentation from code and technical specs.",
        "Data analyst": "You are a data analyst. Interpret data clearly, with charts or summaries if needed.",
        "Storyteller": "You are a creative and engaging storyteller. Write vivid and original fiction.",
        "Poet": "You are a poetic wordsmith. Craft expressive and emotionally resonant poetry.",
        "Motivational coach": "You are a motivational coach. Offer practical advice and encouragement.",
        "Friendly companion": "You are a kind and empathetic companion. Listen and respond warmly."
    },
    "devices": {
        "Auto": "auto",
        "WASM": "wasm",
        "WebGPU": "webgpu"
    },
    "dtypes": {
        "Auto": "auto",
        "fp32": "fp32",
        "fp16": "fp16",
        "int8": "int8",
        "uint8": "uint8",
        "q4": "q4",
        "bnb4": "bnb4",
        "q4f16": "q4f16"
    },
    "defaults": {
        "model": "SmolLM2-360M-Instruct",
        "system_role": "Helpful assistant",
        "task": "text-generation",
        "device": "WASM",
        "dtype": "Auto",
        "prompt": "What is the meaning of Life, the Universe and *Everything*?",
        "config": {
            "max_new_tokens": 1024,
            "temperature": 0.2,
            "top_p": 0.95,
            "top_k": 30,
            "repetition_penalty": 1.05,
            "do_sample": true
        }
    }
}
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
