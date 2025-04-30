import {
    FunctionComponent,
    useEffect,
    useRef,
    useState,
} from 'react';

import './Assistant.css';
import Selector from './Selector';
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
    });
    const [output, setOutput] = useState('');
    const [ready, setReady] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [modelDisabled, setModelDisabled] = useState(false);
    const [progressItems, setProgressItems] = useState<Data[]>([]);
    const [statusText, setStatusText] = useState('');

    const generate = () => {
        if (!input.text) {
            alert('Please provide some prompt for the model!');
            return;
        }
        if (!modelDisabled) setModelDisabled(true);
        setDisabled(true);
        setStatusText('');
        setOutput('');
        worker?.current?.postMessage(input);
    }

    useEffect(() => {
        worker.current ??= new Worker();

        const onMessageReceived = (e: MessageEvent<Data>) => {
            console.log(e.data);

            switch (e.data.status) {
                case 'initiate':
                    setReady(false);
                    setProgressItems(prev => [...prev, e.data]);
                    setStatusText('Downloading model...');
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
                    setReady(true);
                    setStatusText('Download completed...');
                    break;

                case 'update':
                    if (e.data?.output) {
                        setOutput(output + e.data.output);
                        const area = textArea.current;
                        if (area) area.scrollTop = area.scrollHeight;
                    }
                    setStatusText('Model inferencing...');
                    break;

                case 'complete':
                    setProgressItems([]);
                    setDisabled(false);
                    setStatusText('Task completed (refresh to switch model)');
                    console.log(output);
                    break;

                case 'error':
                    setProgressItems([]);
                    setDisabled(false);
                    setStatusText(`${ready ? 'Model error' : 'Download error'} (refresh to switch model)`);
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
            <h3>HuggingFace Transformers.js Demo (<a href='https://github.com/alankrantas/just-another-ai-assistant-huggingface-transformers-js' target='_blank' rel='noreferrer noopener'>repo</a>)</h3>

            <div className='container'>
                <div className='selector-container'>
                    <Selector disabled={modelDisabled} title={'Model'} items={Config.models} defaultItem={default_model} onChange={e => setInput({ ...input, model: e.target.value })} />
                    <Selector disabled={disabled} title={'Task'} items={Config.tasks} defaultItem={default_task} onChange={e => setInput({ ...input, task: e.target.value })} />
                </div>
                <div className='selector-container'>
                    <Selector disabled={modelDisabled} title={'Device'} items={Config.devices} defaultItem={default_device} onChange={e => setInput({ ...input, device: e.target.value })} />
                </div>
                <div className='textbox-container'>
                    <textarea value={input.text} disabled={disabled} spellCheck='true' onChange={e => setInput({ ...input, text: e.target.value })}></textarea>
                    <textarea value={output} readOnly ref={textArea}></textarea>
                </div>
            </div>

            <button disabled={disabled} onClick={generate}>
                {disabled ? (ready ? 'Generating' : 'Waiting') : (ready ? 'Generate' : 'Download and Generate')}
            </button>

            <div className='progress-bars-container'>
                {statusText}
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
