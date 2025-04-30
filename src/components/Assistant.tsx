import {
    FunctionComponent,
    useEffect,
    useRef,
    useState,
} from 'react';

import './Assistant.css';
import Selector from './Selector';
import Range from './Range';
import Check from './Check';
import Progress from './Progress';
import Worker from '../model/Worker?worker';
import Config from '../model/Config.json';
import type { Input } from '../types/Type';

interface Data {
    status: string;
    name?: string;
    file?: string;
    progress?: number;
    output?: string;
}

const default_prompt = 'Explain the potential risk of confirmation bias and echo chamber effect while using generative AI to "prove" your arguments.'
const default_model = Config.models['SmolLM2-360M-Instruct'];
const default_task = Config.tasks['Text Generation'];
const default_device = Config.devices['WASM'];

const Assistant: FunctionComponent = () => {

    const worker = useRef<Worker | null>(null);
    const textArea = useRef<HTMLTextAreaElement | null>(null);

    const [input, setInput] = useState<Input>({
        text: default_prompt,
        model: default_model,
        task: default_task,
        device: default_device,
        parameters: {
            max_new_tokens: 1024,
            temperature: 0.2,
            top_p: 0.95,
            top_k: 30,
            repetition_penalty: 1.05,
            do_sample: true,
        },
    });
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState({
        ready: false,
        disabled: false,
        modelDisabled: false,
        error: false,
        statusText: '',
    })
    const [progressItems, setProgressItems] = useState<Data[]>([]);

    const generate = () => {
        if (status.error) window.location.reload();
        if (!input.text) {
            alert('Please provide some prompt for the model!');
            return;
        }
        setStatus({
            ...status,
            disabled: true,
            modelDisabled: true,
            statusText: '',
        })
        setOutput('');
        worker?.current?.postMessage(input);
    }

    useEffect(() => {
        worker.current ??= new Worker();

        const onMessageReceived = (e: MessageEvent<Data>) => {
            console.log(e.data);

            switch (e.data.status) {
                case 'initiate':
                    setStatus({
                        ...status,
                        ready: false,
                        statusText: 'Downloading model...',
                    });
                    setProgressItems(prev => [...prev, e.data]);
                    break;

                case 'progress':  // a model file is downloading
                    setProgressItems(
                        prev => prev.map(
                            item => (item?.file === e.data?.file) ?
                                { ...item, progress: e.data?.progress } :
                                item)
                    );
                    break;

                case 'done':  // a model file is downloaded
                    setProgressItems(
                        prev => prev.filter(item => item?.file !== e.data?.file)
                    );
                    break;

                case 'ready':  // all model files are downloaded
                    setStatus({
                        ...status,
                        ready: true,
                        statusText: 'Download completed...',
                    });
                    break;

                case 'update':
                    if (e.data?.output) {
                        setOutput(output + e.data.output);
                        const area = textArea.current;
                        if (area) area.scrollTop = area.scrollHeight;
                    }
                    setStatus({
                        ...status,
                        statusText: 'Model inferencing...',
                    });
                    break;

                case 'complete':
                    setProgressItems([]);
                    setStatus({
                        ...status,
                        disabled: false,
                        statusText: 'Task completed (refresh to switch model)',
                    })
                    console.log(output);
                    break;

                case 'error':
                    setProgressItems([]);
                    setStatus({
                        ...status,
                        disabled: false,
                        error: true,
                        statusText: `${status.ready ? 'Model error' : 'Download error'} (refresh to switch model)`,
                    })
                    setOutput(e.data?.output || 'Unknown error');
                    break;
            }
        };

        worker.current.addEventListener('message', onMessageReceived);

        return () => worker?.current?.removeEventListener('message', onMessageReceived);
    });

    return (
        <>
            <h1>Just Another AI Assistant</h1>
            <h2>
                HuggingFace Transformers.js Demo
                (<a href='https://github.com/alankrantas/just-another-ai-assistant-huggingface-transformers-js' target='_blank' rel='noreferrer noopener'>repo</a>)
            </h2>
            <h4>Note: This does not work on mobile devices due to memory limitations.</h4>

            <div className='container'>
                <div className='selector-container'>
                    <Selector
                        disabled={status.modelDisabled}
                        title="Model"
                        tooltip="Larger models with more parameters (e.g., B for billion and M for million) typically offer better performance by capturing complex patterns but require more memory and are slower in generating responses. Smaller models, on the other hand, are faster and more efficient but may compromise accuracy or depth in understanding."
                        items={Config.models}
                        defaultItem={default_model}
                        onChange={e => setInput({ ...input, model: e.target.value })}
                    />
                    <div className='range-container'>
                        <Range
                            title="Max new tokens"
                            tooltip="This sets the maximum number of tokens (words, characters, or subwords) the model can generate in its output. For example, limiting this ensures concise responses."
                            min={256}
                            max={4096}
                            step={64}
                            value={input.parameters.max_new_tokens}
                            onChange={e => setInput({ ...input, parameters: { ...input.parameters, max_new_tokens: Number(e.target.value) } })}
                        />
                        <Range
                            disabled={!input.parameters.do_sample}
                            title="Temperature"
                            tooltip="This controls randomness in the model's output. A low temperature (e.g., 0.2) makes the responses more deterministic and focused, while a high temperature (e.g., 1.0) increases creativity and variability."
                            min={0.0}
                            max={1.0}
                            step={0.05}
                            value={input.parameters.temperature}
                            onChange={e => setInput({ ...input, parameters: { ...input.parameters, temperature: Number(e.target.value) } })}
                        />
                    </div>
                </div>
                <div className='selector-container'>
                    <Selector
                        disabled={status.modelDisabled}
                        title="Device"
                        tooltip="Some models are optimized for WASM and/or WebGPU due to their compatibility with the required APIs or hardware acceleration, allowing efficient execution on supported devices. Some models may be less efficient or incompatible on some platforms."
                        items={Config.devices}
                        defaultItem={default_device}
                        onChange={e => setInput({ ...input, device: e.target.value })}
                    />
                    <div className='range-container'>
                        <Range
                            disabled={!input.parameters.do_sample}
                            title="Top P"
                            tooltip="Also called nucleus sampling, this adjusts the probability distribution of tokens. The model considers tokens until the cumulative probability reaches the specified value (e.g., 0.95), creating more focused and realistic outputs."
                            min={0.0}
                            max={1.0}
                            step={0.05}
                            value={input.parameters.top_p}
                            onChange={e => setInput({ ...input, parameters: { ...input.parameters, top_p: Number(e.target.value) } })}
                        />
                        <Range
                            disabled={!input.parameters.do_sample}
                            title="Top K"
                            tooltip="This limits the model's token selection to the top k most probable choices. For example, if top_k = 30, the model will only consider the 30 most likely tokens, encouraging diversity."
                            min={1}
                            max={60}
                            step={1}
                            value={input.parameters.top_k}
                            onChange={e => setInput({ ...input, parameters: { ...input.parameters, top_k: Number(e.target.value) } })}
                        />
                    </div>
                </div>
                <div className='selector-container'>
                    <Selector
                        disabled={status.disabled}
                        title="Task"
                        tooltip="Some models are trained for specific tasks and have architecture or tokenizer constraints tailored to those tasks. Attempting to perform an unsupported task on a model may result in errors due to incompatible configurations or missing task-specific components."
                        items={Config.tasks}
                        defaultItem={default_task}
                        onChange={e => setInput({ ...input, task: e.target.value })}
                    />
                    <div className='range-container'>
                        <Range
                            title="Repetition penalty"
                            tooltip="This reduces redundancy by penalizing repetitive sequences or words. For instance, setting it to 1.2 encourages the model to generate varied responses instead of repeating itself."
                            min={1.0}
                            max={1.6}
                            step={0.05}
                            value={input.parameters.repetition_penalty}
                            onChange={e => setInput({ ...input, parameters: { ...input.parameters, repetition_penalty: Number(e.target.value) } })}
                        />
                        <Check
                            title="Do sample"
                            tooltip="When enabled (set to True), the model samples tokens from the probability distribution, making responses more creative and less predictable. If set to False, the output becomes more deterministic and does not affected by Temperature, Top P and Top K."
                            checked={input.parameters.do_sample}
                            onChange={e => setInput({ ...input, parameters: { ...input.parameters, do_sample: !input.parameters.do_sample } })}
                        />
                    </div>
                </div>

                <div className='textbox-container'>
                    <textarea value={input.text} disabled={status.disabled} spellCheck='true' onChange={e => setInput({ ...input, text: e.target.value })}></textarea>
                    <textarea value={output} readOnly ref={textArea}></textarea>
                </div>
            </div>

            <button disabled={status.disabled} onClick={generate}>
                {status.error ? 'Refresh' : (status.disabled ? (status.ready ? 'Generating' : 'Waiting') : (status.ready ? 'Generate' : 'Download and Generate'))}
            </button>

            <div className='progress-bars-container'>
                {status.statusText}
                {progressItems.map(data => (
                    <div key={data?.file}>
                        <Progress text={data?.file} percentage={data?.progress} />
                    </div>
                ))}
            </div>
        </>
    )
}

export default Assistant;
