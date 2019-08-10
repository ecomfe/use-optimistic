import {useCallback} from 'react';

const DelayRadio = ({delay, value, onSelect}) => {
    return (
        <label style={{marginRight: 12}}>
            <input
                type="radio"
                name="delay"
                value={value}
                onChange={onSelect}
                checked={delay === value}
            />
            {value}s
        </label>
    );
};

export default ({value, onChange}) => {
    const choose = useCallback(
        e => {
            if (e.target.checked) {
                onChange(+e.target.value);
            }
        },
        [onChange]
    );

    return (
        <div>
            <span style={{display: 'inline-block', marginRight: 20}}>Set delay to:</span>
            <DelayRadio value={1} delay={value} onSelect={choose} />
            <DelayRadio value={2} delay={value} onSelect={choose} />
            <DelayRadio value={5} delay={value} onSelect={choose} />
            <DelayRadio value={10} delay={value} onSelect={choose} />
        </div>
    );
};
