import {OptimisticState, ReduceNext, Execute, AsyncWorkFlow} from '../types';

const NONE = {};

export const initialize = <T>(state: T): OptimisticState<T> => {
    return {
        optimistic: false,
        archive: NONE,
        queue: [],
        hostState: state,
    };
};

const putOptimisticBy = <T>(transactionID: number, next: ReduceNext<T>): ReduceNext<OptimisticState<T>> => state => {
    return {
        ...state,
        optimistic: true,
        archive: state.archive === NONE ? state.hostState : state.archive,
        queue: state.queue.concat({transactionID, next}),
        hostState: next(state.hostState),
    };
};

const putNormalBy = <T>(next: ReduceNext<T>): ReduceNext<OptimisticState<T>> => state => {
    return {
        ...state,
        queue: state.optimistic ? state.queue.concat({next}) : state.queue,
        hostState: next(state.hostState),
    };
};

const rollbackBy = <T>(transactionID: number, next: ReduceNext<T>): ReduceNext<OptimisticState<T>> => {
    const putNormal = putNormalBy(next);

    return state => {
        /* eslint-disable no-param-reassign */
        const rollbackedState = state.queue.reduce(
            (input, action) => {
                if (action.transactionID === transactionID) {
                    return input;
                }

                const isOptimisticAction = !!action.transactionID;

                // The next save point should be the first time an optimistic action is dispatched,
                // so any actions earlier than new save point should be safe to discard
                if (input.archive === NONE && isOptimisticAction) {
                    input.archive = input.hostState;
                }

                if (input.archive !== NONE) {
                    input.queue.push(action);
                }

                // Still mark state to optimistic if an optimistic action occurs
                if (isOptimisticAction) {
                    input.optimistic = true;
                }

                // Apply remaining action to make state up to time,
                // here we just need to apply all middlewares **after** redux-optimistic-manager,
                // so use `next` instead of global `dispatch`
                input.hostState = action.next(input.hostState);

                return input;
            },
            {archive: NONE, queue: [] as typeof state['queue'], hostState: state.archive as T, optimistic: false}
        );
        /* eslint-enable no-param-reassign */
        return putNormal(rollbackedState);
    };
};

const uuid = (() => {
    let i = 1;
    return () => i++;
})();

const isPromise = (value: any) => value && typeof value.then === 'function';

export const consumeOptimistic = async <T, TAsyncResult>(
    execute: Execute<T>,
    reduceAsync: AsyncWorkFlow<T, TAsyncResult>,
    reduceOptimistic: ReduceNext<T>
) => {
    const transactionID = uuid();
    const generator = reduceAsync();
    let next = generator.next();
    let isPromiseOccured = false;
    let isRollbacked = false;

    while (!next.done) {
        const yieldValue = next.value;

        if (isPromise(yieldValue)) {
            if (!isPromiseOccured) {
                isPromiseOccured = true;
                execute(putOptimisticBy(transactionID, reduceOptimistic));
            }

            try {
                const result = await yieldValue;
                next = generator.next(result);
            }
            catch (ex) {
                // TODO: TypeScript 3.6.0 may fix this
                next = (generator.throw as Function)(ex);
            }
        }
        else {
            const nextRduce = yieldValue as ReduceNext<T>;
            if (isPromiseOccured && !isRollbacked) {
                isRollbacked = true;
                execute(rollbackBy(transactionID, nextRduce));
            }
            else {
                execute(putNormalBy(nextRduce));
            }

            next = generator.next();
        }
    }
};

export const consumeReduce = <T>(execute: Execute<T>, reduce: ReduceNext<T>) => execute(putNormalBy(reduce));
