import {useState, useCallback} from 'react';

const inputStyle = {
    boxSizing: 'border-box',
    width: '100%',
    height: '36px',
    lineHeight: '36px',
    padding: '0 10px',
    outline: 'none',
};

const buttonStyle = {
    position: 'absolute',
    right: '0',
    top: '1px',
    bottom: '1px',
    cursor: 'pointer',
    border: 'none',
    padding: '0 12px',
    backgroundColor: '#0076ff',
    color: '#fff',
    fontSize: '16px',
};

export default ({onSubmit}) => {
    const [text, setText] = useState('');
    const updateText = useCallback(
        e => setText(e.target.value),
        []
    );
    const handleSubmit = useCallback(
        () => {
            setText('');
            onSubmit(text);
        },
        [text, onSubmit]
    );

    return (
        <div style={{position: 'relative', margin: '20px 0'}}>
            <input
                type="text"
                style={inputStyle}
                value={text}
                placeholder="New item"
                onChange={updateText}
            />
            <button type="button" style={buttonStyle} onClick={handleSubmit}>Submit</button>
        </div>
    );
};
