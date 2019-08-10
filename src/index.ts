import {useReducer, useCallback, Reducer} from 'react';
import {OptimisticState, ReduceNext, SetState, Factory, ReduceHint, AsyncWorkFlow, SetStateAsync} from '../types';
import {initialize, consumeOptimistic, consumeReduce} from './manager';

const reduceInvert = <T>(state: T, reduce: ReduceNext<T>) => reduce(state);

type InvertReducer<T> = Reducer<OptimisticState<T>, ReduceNext<OptimisticState<T>>>;

export const useOptimisticFactory = <TState, TPayload, TAsyncResult = TState>(
    factory: Factory<TState, TPayload, TAsyncResult>,
    initialState: TState
): [TState, (paylod: TPayload) => void] => {
    const [state, execute] = useReducer<InvertReducer<TState>>(reduceInvert, initialize(initialState));
    const dispatch = useCallback(
        (payload: TPayload): void => {
            const reduce = factory(payload);

            if (typeof reduce === 'function') {
                consumeReduce(execute, reduce);
                return;
            }

            const [reduceAsync, reduceOptimistic] = reduce;
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            consumeOptimistic(execute, reduceAsync, reduceOptimistic);
        },
        [factory]
    );
    return [state.hostState, dispatch];
};

const identity = <T>(input: T): T => input;

const isPromise = (value: any) => value && typeof value.then === 'function';

const wrapToReduce = <T>(input: T | ReduceNext<T>): ReduceNext<T> => {
    if (typeof input === 'function') {
        return input as ReduceNext<T>;
    }

    return () => input;
};

export const useOptimisticState = <T>(initialState: T): [T, SetState<T>] => {
    const [state, dispatch] = useOptimisticFactory<T, ReduceHint<T>>(identity, initialState);
    const setState = useCallback<SetState<T>>(
        (x: T | ReduceNext<T> | Promise<T> | Promise<ReduceNext<T>>, y?: T | ReduceNext<T>): void => {
            if (isPromise(x)) {
                const promise = x as Promise<T | ReduceNext<T>>;
                const optimistic = y as T | ReduceNext<T>;
                const hint: ReduceHint<T> = [
                    function* run() {
                        const result = (yield promise) as T | ReduceNext<T>;
                        yield wrapToReduce(result);
                    } as AsyncWorkFlow<T>,
                    wrapToReduce(optimistic),
                ];
                dispatch(hint);
            }
            else {
                dispatch(wrapToReduce<T>(x as T | ReduceNext<T>));
            }
        },
        [dispatch]
    );
    return [state, setState];
};

export const useOptimisticTask = <T, TArg>(
    task: (arg: TArg) => Promise<T>,
    optimisticTask: (arg: TArg) => T,
    initialState: T
) => {
    const [state, setState] = useOptimisticState<T>(initialState);
    const run = useCallback(
        (arg: TArg) => (setState as SetStateAsync<T>)(task(arg), optimisticTask(arg)),
        [setState, task, optimisticTask]
    );
    return [state, run];
};
