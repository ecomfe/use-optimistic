/* eslint-disable max-len */
export type ReduceNext<T> = (state: T) => T;

export type AsyncWorkFlow<TState, TAsyncResult = TState> = () => Iterator<ReduceNext<TState> | Promise<TAsyncResult>>;

export interface ReducerEntry<T> {
    readonly transactionID?: number;
    readonly next: ReduceNext<T>;
}

export interface OptimisticState<T> {
    readonly optimistic: boolean;
    readonly archive: T | {};
    readonly queue: Array<ReducerEntry<T>>;
    readonly hostState: T;
}

export type Execute<T> = (next: ReduceNext<OptimisticState<T>>) => void;

export type ReduceHint<TState, TAsyncResult = TState> =(ReduceNext<TState> | [AsyncWorkFlow<TState, TAsyncResult>, ReduceNext<TState>]);

export type Factory<TState, TPayload, TAsyncResult = TState> = (payload: TPayload) => ReduceHint<TState, TAsyncResult>;

type SetStateSync<T> = (input: T | ReduceNext<T>) => void;

type SetStateAsync<T> = (setAsync: Promise<T> | Promise<ReduceNext<T>>, setSync: T | ReduceNext<T>) => void;

export type SetState<T> = SetStateSync<T> | SetStateAsync<T>;
