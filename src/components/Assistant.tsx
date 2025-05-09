import {
    FunctionComponent,
    useEffect,
    useRef,
    useState,
} from 'react';

import './Assistant.css';
import Selector from './utils/Selector';
import Range from './utils/Range';
import Check from './utils/Check';
import Progress from './utils/Progress';
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

const getByKey = (items: {[key: string]: string}, key: string) => {
    console.log(items[key])
    return items[key];
}

const Assistant: FunctionComponent = () => {

    const worker = useRef<Worker | null>(null);
    const textArea = useRef<HTMLTextAreaElement | null>(null);

    const [input, setInput] = useState<Input>({
        text: Config.defaults.prompt,
        model: getByKey(Config.models,Config.defaults.model),
        task: Config.defaults.task,
        system_role: getByKey(Config.system_roles, Config.defaults.system_role),
        device: getByKey(Config.devices, Config.defaults.device),
        dtype: getByKey(Config.dtypes, Config.defaults.dtype),
        parameters: {
            max_new_tokens: Config.defaults.config.max_new_tokens,
            temperature: Config.defaults.config.temperature,
            top_p: Config.defaults.config.top_p,
            top_k: Config.defaults.config.top_k,
            repetition_penalty: Config.defaults.config.repetition_penalty,
            do_sample: Config.defaults.config.do_sample,
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
                        statusText: 'Download completed, awating response...',
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
                        statusText: `Task completed (${new Date().toLocaleString("en-us")})`,
                    })
                    console.log(output);
                    break;

                case 'error':
                    setProgressItems([]);
                    setStatus({
                        ...status,
                        error: true,
                        statusText: `${status.ready ? 'Model error' : 'Download error'} (${new Date().toLocaleString("en-us")})`,
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
                <div className='control-container'>
                    <Selector
                        disabled={status.modelDisabled}
                        title="Model"
                        tooltip="Larger models with more parameters (e.g., B for billion and M for million) typically offer better performance by capturing complex patterns but require more memory and are slower in generating responses. Smaller models, on the other hand, are faster and more efficient but may compromise accuracy or depth in understanding."
                        items={Config.models}
                        defaultItem={getByKey(Config.models,Config.defaults.model)}
                        onChange={e => setInput({ ...input, model: e.target.value })}
                    />
                    <Selector
                        disabled={status.modelDisabled}
                        title="Device"
                        tooltip="Some models are optimized for WASM and/or WebGPU due to their compatibility with the required APIs or hardware acceleration, allowing efficient execution on supported devices. Some models may be less efficient or incompatible on some platforms."
                        items={Config.devices}
                        defaultItem={getByKey(Config.devices, Config.defaults.device)}
                        onChange={e => setInput({ ...input, device: e.target.value })}
                    />
                </div>
                <div className='control-container'>
                    <Selector
                        disabled={status.disabled}
                        title="System role"
                        tooltip="The system role in a chat template sets the behavior, tone, and boundaries for the assistant throughout the conversation. It acts as an initial instruction to guide how the model should interpret and respond to the user's prompts."
                        items={Config.system_roles}
                        defaultItem={getByKey(Config.system_roles, Config.defaults.system_role)}
                        onChange={e => setInput({ ...input, system_role: e.target.value })}
                    />
                    <Selector
                        disabled={status.modelDisabled}
                        title="Data type"
                        tooltip="Implementations specifies the data type used for computations and memory storage. Choosing the right dtype affects model performance, precision, and efficiency—lower precision types can speed up inference and reduce memory usage at the cost of numerical accuracy."
                        items={Config.dtypes}
                        defaultItem={getByKey(Config.dtypes, Config.defaults.dtype)}
                        onChange={e => setInput({ ...input, dtype: e.target.value })}
                    />
                </div>
                <div className='control-container'>
                    <Range
                        disabled={status.disabled}
                        title="Max new tokens"
                        tooltip="This sets the maximum number of tokens (words, characters, or subwords) the model can generate in its output. For example, limiting this ensures concise responses."
                        min={256}
                        max={4096}
                        step={64}
                        value={input.parameters.max_new_tokens}
                        onChange={e => setInput({ ...input, parameters: { ...input.parameters, max_new_tokens: Number(e.target.value) } })}
                    />
                    <Range
                        disabled={status.disabled || !input.parameters.do_sample}
                        title="Temperature"
                        tooltip="This controls randomness in the model's output. A low temperature (e.g., 0.2) makes the responses more deterministic and focused, while a high temperature (e.g., 1.0) increases creativity and variability."
                        min={0.0}
                        max={1.0}
                        step={0.05}
                        value={input.parameters.temperature}
                        onChange={e => setInput({ ...input, parameters: { ...input.parameters, temperature: Number(e.target.value) } })}
                    />
                </div>
                <div className='control-container'>
                    <Range
                        disabled={status.disabled}
                        title="Repetition penalty"
                        tooltip="This reduces redundancy by penalizing repetitive sequences or words. For instance, setting it to 1.2 encourages the model to generate varied responses instead of repeating itself."
                        min={1.0}
                        max={1.6}
                        step={0.05}
                        value={input.parameters.repetition_penalty}
                        onChange={e => setInput({ ...input, parameters: { ...input.parameters, repetition_penalty: Number(e.target.value) } })}
                    />
                    <Range
                        disabled={status.disabled || !input.parameters.do_sample}
                        title="Top P"
                        tooltip="Also called nucleus sampling, this adjusts the probability distribution of tokens. The model considers tokens until the cumulative probability reaches the specified value (e.g., 0.95), creating more focused and realistic outputs."
                        min={0.0}
                        max={1.0}
                        step={0.05}
                        value={input.parameters.top_p}
                        onChange={e => setInput({ ...input, parameters: { ...input.parameters, top_p: Number(e.target.value) } })}
                    />
                </div>
                <div className='control-container'>
                    <Check
                        disabled={status.disabled}
                        title="Do sample"
                        tooltip="When enabled (set to True), the model samples tokens from the probability distribution, making responses more creative and less predictable. If set to False, the output becomes more deterministic and does not affected by Temperature, Top P and Top K."
                        checked={input.parameters.do_sample}
                        onChange={e => setInput({ ...input, parameters: { ...input.parameters, do_sample: !input.parameters.do_sample } })}
                    />
                    <Range
                        disabled={status.disabled || !input.parameters.do_sample}
                        title="Top K"
                        tooltip="This limits the model's token selection to the top k most probable choices. For example, if top_k = 30, the model will only consider the 30 most likely tokens, encouraging diversity."
                        min={1}
                        max={60}
                        step={1}
                        value={input.parameters.top_k}
                        onChange={e => setInput({ ...input, parameters: { ...input.parameters, top_k: Number(e.target.value) } })}
                    />
                </div>

                <div className='textbox-container'>
                    <textarea
                        disabled={status.disabled}
                        spellCheck='true'
                        value={input.text}
                        onChange={e => setInput({ ...input, text: e.target.value })}
                        className={status.disabled ? '' : 'highlight'}
                    ></textarea>
                    <textarea
                        readOnly
                        ref={textArea}
                        value={output}
                        className={status.disabled ? '' : 'highlight'}
                    ></textarea>
                </div>
            </div>

            <button disabled={status.disabled && !status.error} onClick={generate}>
                {status.error ? 'Refresh' : (status.disabled ? (status.ready ? 'Generating...' : 'Waiting...') : (status.ready ? 'Generate' : 'Download and Generate'))}
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
