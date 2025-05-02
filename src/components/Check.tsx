import type {
    FunctionComponent,
    ChangeEventHandler,
} from "react";

interface CheckProps {
    disabled?: boolean;
    title: string;
    tooltip?: string;
    checked: boolean;
    onChange: ChangeEventHandler<HTMLInputElement>;
}

const Check: FunctionComponent<CheckProps> = ({ disabled = false, title, tooltip = '', checked, onChange }) => {
    return (
        <div className="check">
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
            <input type="checkbox"
                disabled={disabled}
                checked={checked}
                onChange={onChange}
            />
        </div >
    )
}

export default Check;