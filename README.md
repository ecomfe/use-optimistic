# use-optimistic

This is a set of react hooks to help manage optimistic states.

As previously stated in [redux-optimistic-thunk](https://github.com/ecomfe/redux-optimistic-thunk#why-this-middleware), manually managing optimistic states, commits, rollbacks and transactions are not ideal model of state management. React hooks provides powers to manage states in a more functional way, and this library aimed to build optimistic functions above hooks.

**This library required [ES6 Generators](https://caniuse.com/#feat=es6-generators) to work.**

## Usage

### Install

```shell
npm install use-optimistic
```

This library provides 3 hooks to developers.

### useOptimisticFactory

This is the fundamental hooks which manages a full functional optimistic state:

```js
const [state, dispatch] = useOptimisticFactory(factory, initialState);
```

The `factory` parameter referes to a function receiving a `payload` object and returns either:

- A state reducer `(state: T) => T`, this reducer will be executed immediately providing current state, the returned state is going to be the next state.
- A tuple of `[asyncWorkflow, optimisticReducer]` which defines an async workflow and a optimistic reducer to take place before async operations complete.

An `asyncWorkflow` is a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) which yields a reducer or a `Promise` instance.

Any time a state reducer is yielded, it will be executed against current state and generates the next state.

When a `Promise` is yielded, it will be awaited, the resolved value will be returned to `yield` statement.

Right after the first `Promise` is yielded, the `optimisticReducer` will be executed to generate an optimistic state, inside `useOptimisticFactory` hook it will automatically rollback this optimistic state after `Promise` is settled (either fulfilled or rejected).

Note that `optimisticReducer` will be only executed on the first `Promise`, so if `asyncWorkflow` yields several `Promise`s the later ones will not take benefit from optimistic state.

The return value of `useOptimisticFactory` is the same signature of `useReducer`, the `state` represents the latest state and `dispatch` is a function to feed `payload` to `factory` argument.

One thing to metion is that `dispatch` will be different if `factory` changes, this is different to the built-in `useReducer` hook, we recommend to cache `factory` with `useCallback`.

This is a simple example to manage a todo list with `useOptimisticFactory`:

```js
const factory = useCallback(
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
                        // Await an async api call
                        const newTodo = yield saveTodo(payload);
                        // Insert the returned new todo to list, with pending set to false
                        yield items => [
                            ...items,
                            {...newTodo, pending: false, deleted: false},
                        ];
                    },
                    items => [
                        ...items,
                        // Insert an optimistic item with property pending set to true,
                        // this item will be removed after saveTodo resolves
                        {id: uid(), text: payload, pending: true, deleted: false},
                    ],
                ];
            default:
                return s => s;
        }
    },
    []
);
const [todos, dispatch] = useOptimisticFactory(factory, []);
```

You can call `dispatch` at any time, parallelism is handled internally. See [demo](demo/components/App/index.js) to find more details.

### useOptimisticState

Like `useState` and `useReducer`, `useOptimisticState` is a simmple encapsulation to `useOptimisticFactory`.

```js
const [state, setState] = useOptimisticState(initialState);
```

The `setState` can receive 2 different arguments:

```js
setState(nextState);
setState(promise, optimisticNextState);
```

If only 1 argument is provided, this works exactly the same as `useState` hook, `nextState` can be either a state object or a state reducer `(state: T) => T`.

When 2 arguments are provided, the first one is a `Promise` which resolves to a `nextState` (which is a state object or a reducer), the second is a `nextState` takes optimistic effects.

```js
const [todos, setTodos] = useOptimisticState([]);
const addTodo = todo => setState(
    (async () => {
        const newTodo = await saveTodo(todo);
        // We recommend to use a reducer since it is asynchronous
        return todos => [...todos, {...newTodo, pending: false, deleted: false}];
    })(),
    // Optimistic next state is executed synchronously, it can be a single state object
    [...todos, {...todo, pending: true, deleted: false}]
);
```

### useOptimisticTask

This is a binding of `useOptimisticState` and an async task.

```js
const [state, run] = useOptimisticTask(task, optimisticTask);
```

- The `task` is an async function `(arg: TArg) => Promise<TState>`.
- The `optimisticTask` is a sync version of task provides an optimistic response `(arg: TArg) => TState`.
- Returned `run` function receives the same argument as `task`.

```js
const newTodo = async todo => {
    const newTodo = await saveTodo(todo);
    // We recommend to use a reducer since it is asynchronous
    return todos => [...todos, {...newTodo, pending: false, deleted: false}];
};
const optimisticNewTodo = todo => todos => [...todos, {...todo, pending: true, deleted: false}];
const [todos, addTodo] = useOptimisticTask(newTodo, optimisticNewTodo, []);
```

`useOptimisticTask` is useful when encapsulating business aware hooks.
