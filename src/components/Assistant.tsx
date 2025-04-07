import {
    FunctionComponent,
    useEffect,
    useRef,
    useState,
} from 'react';

import './Assistant.css';
import Progress from './Progress';
import LLMWorker from '../llm/LLMWorker?worker';
import LLMConfig from '../llm/LLMConfig.json';

export interface Data {
    status: string;
    name?: string;
    file?: string;
    progress?: number;
    output?: string;
}

export interface Message {
    data: Data;
}

const Assistant: FunctionComponent = () => {

    const worker = useRef<Worker | null>(null);
    const textArea = useRef<HTMLTextAreaElement | null>(null);

    const [input, setInput] = useState('What is the answer to the meaning of life, the universe and everything?');
    const [output, setOutput] = useState('');
    const [ready, setReady] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [progressItems, setProgressItems] = useState<Data[]>([]);

    const generate = () => {
        setDisabled(true);
        setOutput('');
        worker?.current?.postMessage({ prompt: input });
    }

    useEffect(() => {
        worker.current ??= new LLMWorker();

        const onMessageReceived = (e: Message) => {
            console.log(e.data);

            switch (e.data.status) {
                case 'initiate':
                    setReady(false);
                    setProgressItems(prev => [...prev, e.data]);
                    break;

                case 'progress':
                    setProgressItems(
                        prev => prev.map(item => {
                            if (item?.file === e.data?.file) {
                                return { ...item, progress: e.data?.progress }
                            }
                            return item;
                        })
                    );
                    break;

                case 'done':
                    setProgressItems(
                        prev => prev.filter(item => item?.file !== e.data?.file)
                    );
                    break;

                case 'ready':
                    setReady(true);
                    break;

                case 'update':
                    if (e.data?.output) {
                        setOutput(output + e.data.output);
                        const area = textArea.current;
                        if (area) area.scrollTop = area.scrollHeight;
                    }
                    break;

                case 'complete':
                    setDisabled(false);
                    break;
            }
        };

        worker.current.addEventListener('message', onMessageReceived);

        return () => worker?.current?.removeEventListener('message', onMessageReceived);
    });

    return (
        <>
            <h1>Just Another AI Assistant</h1>
            <h2>HuggingFace Transformers.js Demo (<a href='https://github.com/alankrantas/just-another-ai-assistant-huggingface-transformers-js' target='_blank' rel='noreferrer noopener'>repo</a>)</h2>
            <h3>
                <code>
                    Model: <a href={`https://huggingface.co/${LLMConfig.model}`} target='_blank' rel='noreferrer noopener'>{LLMConfig.model}</a>
                    <br />
                    Task: {LLMConfig.task}
                </code>
            </h3>

            <div className='container'>
                <div className='textbox-container'>
                    <textarea value={input} disabled={disabled} onChange={e => setInput(e.target.value)} spellCheck='true' wrap='hard'></textarea>
                    <textarea value={output} readOnly ref={textArea} wrap='soft'></textarea>
                </div>
            </div>

            <button disabled={disabled} onClick={generate}>
                {ready ? (disabled ? 'Generating...' : 'Generate') : (disabled ? 'Downloading...' : 'Download and Generate')}
            </button>

            <div className='progress-bars-container'>
                {ready === false && (
                    <h5>
                        The model run <i>only</i> in your browser and has to be downloaded once.
                        <br />
                        It may not run properly on your device with insufficient RAM!
                    </h5>
                )}
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
