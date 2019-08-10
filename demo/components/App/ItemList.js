import {useCallback} from 'react';

const deleteLabelStyle = {
    float: 'right',
    cursor: 'pointer',
    color: '#0076ff',
};

const pendingLabelStyle = {
    float: 'right',
    cursor: 'default',
    color: '#b3b3b3',
};

const DeleteLabel = ({id, onDelete}) => {
    const handleClick = useCallback(
        () => onDelete(id),
        [id, onDelete]
    );

    return <span style={deleteLabelStyle} onClick={handleClick}>delete</span>;
};

const PendingLabel = () => <span style={pendingLabelStyle}>pending...</span>;

const Item = ({id, deleted, text, pending, onDelete}) => (
    <li style={{padding: '4px 6px', borderBottom: '1px solid #ccc'}}>
        <span style={{textDecoration: deleted ? 'line-through' : 'none'}}>{text}</span>
        {deleted ? null : (pending ? <PendingLabel /> : <DeleteLabel id={id} onDelete={onDelete} />)}
    </li>
);

export default ({items, onDelete}) => (
    <ul style={{listStyle: 'none', margin: '0', padding: '0'}}>
        {items.map(item => <Item key={item.id} {...item} onDelete={onDelete} />)}
    </ul>
);
