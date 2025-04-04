import type {
    FunctionComponent,
    ChangeEventHandler,
} from "react";

interface SelectorProps {
    disabled: boolean;
    type: string;
    items: {
        [key: string]: string;
    };
    defaultItem: string;
    onChange: ChangeEventHandler<HTMLSelectElement>;
}

const Selector: FunctionComponent<SelectorProps> = ({ disabled, type, items, defaultItem, onChange }) => {
    return (
        <div className="selector">
            <label><b>{type}</b>: </label>
            <select disabled={disabled} onChange={onChange} defaultValue={defaultItem}>
                {Object.entries(items).map(([key, value]) => {
                    return <option key={key} value={value}>{key}</option>
                })}
            </select>
        </div >
    )
}

export default Selector;