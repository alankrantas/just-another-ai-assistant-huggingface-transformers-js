import {
    type FunctionComponent,
} from "react";

interface ProgressProps {
    text?: string;
    percentage?: number;
}

const Progress: FunctionComponent<ProgressProps> = ({ text = '', percentage = 0 }) => {
    percentage = percentage ?? 0;
    return (
        <div className="progress-container">
            <div className='progress-bar' style={{ 'width': `${percentage}%` }}>
                ({`${percentage.toFixed(2)}%`}) {text}
            </div>
        </div>
    );
}

export default Progress;