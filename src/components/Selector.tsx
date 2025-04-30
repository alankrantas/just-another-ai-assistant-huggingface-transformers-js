import type {
    FunctionComponent,
    ChangeEventHandler,
} from "react";

interface SelectorProps {
    disabled: boolean;
    title: string;
    items: {
        [key: string]: string;
    };
    defaultItem: string;
    onChange: ChangeEventHandler<HTMLSelectElement>;
}

const Selector: FunctionComponent<SelectorProps> = ({ disabled, title, items, defaultItem, onChange }) => {
    return (
        <div className="selector">
            <label><b>{title}</b>:&nbsp;</label>
            <select disabled={disabled} onChange={onChange} defaultValue={defaultItem}>
                {Object.entries(items).map(([key, value]) => {
                    return <option key={key} value={value}>{key}</option>
                })}
            </select>
        </div >
    )
}

export default Selector;