import type {
    FunctionComponent,
    ChangeEventHandler,
} from "react";

interface SelectorProps {
    disabled?: boolean;
    title: string;
    tooltip?: string;
    items: {
        [key: string]: string;
    };
    defaultItem: string;
    onChange: ChangeEventHandler<HTMLSelectElement>;
}

const Selector: FunctionComponent<SelectorProps> = ({ disabled = false, title, tooltip = '', items, defaultItem, onChange }) => {
    return (
        <div className="selector">
            <label>
                {title}
                {tooltip ? (
                    <span className="tooltip">
                        &nbsp;ⓘ&nbsp;
                        <span className="tooltiptext">
                            <code>{tooltip}</code>
                        </span>
                    </span>
                ) : (<span></span>)}
                :&nbsp;
            </label>
            <select disabled={disabled} onChange={onChange} defaultValue={defaultItem}>
                {Object.entries(items).map(([key, value]) => {
                    return <option key={key} value={value}>{key}</option>
                })}
            </select>
        </div >
    )
}

export default Selector;