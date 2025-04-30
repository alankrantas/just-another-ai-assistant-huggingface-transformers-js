import type {
    FunctionComponent,
    ChangeEventHandler,
} from "react";

interface RangeProps {
    disabled?: boolean;
    title: string;
    tooltip?: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: ChangeEventHandler<HTMLInputElement>;
}

const Range: FunctionComponent<RangeProps> = ({ disabled = false, title, tooltip = '', min, max, step, value, onChange }) => {
    return (
        <div className="range-item-container">
            <label>
                {title}
                {tooltip ? (
                    <span className="tooltip">
                        &nbsp;ⓘ
                        <span className="tooltiptext">
                            <code>{tooltip}</code>
                        </span>
                    </span>
                ) : (<span></span>)}
            </label>
            <input type="range"
                disabled={disabled}
                min={min} max={max} step={step}
                value={value}
                onChange={onChange}
            />
            <code>({value})</code>
        </div >
    )
}

export default Range;