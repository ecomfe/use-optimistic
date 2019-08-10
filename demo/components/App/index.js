import {useState, useCallback} from 'react';
import {useOptimisticFactory} from '../../../src';
import ChooseDelay from './ChooseDelay';
import Introduction from './Introduction';
import ItemList from './ItemList';
import NewItemForm from './NewItemForm';

const uid = (() => {
    let value = 0;

    return () => ++value;
})();

const timeout = time => new Promise(resolve => setTimeout(resolve, time));

export default () => {
    const [delay, setDelay] = useState(10);
    const executeItems = useCallback(
        ({type, payload}) => {
            switch (type) {
                case 'DELETE':
                    return items => {
                        const index = items.findIndex(i => i.id === payload);
                        return [
                            ...items.slice(0, index),
                            {...items[index], deleted: true},
                            ...items.slice(index + 1),
                        ];
                    };
                case 'CREATE':
                    return [
                        function* create() {
                            yield timeout(delay * 1000);
                            yield items => [
                                ...items,
                                {id: uid(), text: payload, pending: false, deleted: false},
                            ];
                        },
                        items => [
                            ...items,
                            {id: uid(), text: payload, pending: true, deleted: false},
                        ],
                    ];
                default:
                    return s => s;
            }
        },
        [delay]
    );
    const [items, dispatch] = useOptimisticFactory(
        executeItems,
        [
            {id: uid(), text: 'Buy a milk', pending: false, deleted: false},
            {id: uid(), text: 'Talk with Berry', pending: false, deleted: false},
            {id: uid(), text: 'Fitness - Run 10km', pending: false, deleted: false},
            {id: uid(), text: 'Read "Node.js for Embedded Systems"', pending: false, deleted: false},
            {id: uid(), text: 'Book next week\'s flight ticket', pending: false, deleted: false},
        ]
    );
    const deleteItem = useCallback(
        id => dispatch({type: 'DELETE', payload: id}),
        [dispatch]
    );
    const submitNewItem = useCallback(
        text => dispatch({type: 'CREATE', payload: text}),
        [dispatch]
    );

    return (
        <div style={{width: '720px', margin: '0 auto'}}>
            <ChooseDelay value={delay} onChange={setDelay} />
            <NewItemForm onSubmit={submitNewItem} />
            <ItemList items={items} onDelete={deleteItem} />
            <Introduction />
        </div>
    );
};
