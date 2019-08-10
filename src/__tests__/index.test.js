import {renderHook, act} from '@testing-library/react-hooks';
import {useOptimisticState, useOptimisticTask} from '..';

const immediate = () => new Promise(resolve => setImmediate(resolve));

describe('useOptimisticState', () => {
    it('should return state and setState', () => {
        const {result} = renderHook(() => useOptimisticState(1));
        expect(result.current[0]).toBe(1);
        expect(typeof result.current[1]).toBe('function');
    });

    it('should work with next state', () => {
        const {result} = renderHook(() => useOptimisticState(1));
        act(() => result.current[1](2));
        expect(result.current[0]).toBe(2);
    });

    it('should work with sync reducer', () => {
        const {result} = renderHook(() => useOptimisticState(1));
        act(() => result.current[1](v => v + 1));
        expect(result.current[0]).toBe(2);
    });

    it('should work with async state', async () => {
        const {result, waitForNextUpdate} = renderHook(() => useOptimisticState(1));
        await act(async () => {
            const setState = result.current[1];
            setState(
                immediate().then(() => 2),
                3
            );
            await waitForNextUpdate();
            expect(result.current[0]).toBe(3);
            await waitForNextUpdate();
            expect(result.current[0]).toBe(2);
        });
    });
});

describe('useOptimisticTask', () => {
    it('should work', async () => {
        const task = v => immediate().then(() => v);
        const optimistic = v => v + 1;
        const {result, waitForNextUpdate} = renderHook(() => useOptimisticTask(task, optimistic, 0));
        await act(async () => {
            const run = result.current[1];
            run(1);
            await waitForNextUpdate();
            expect(result.current[0]).toBe(2);
            await waitForNextUpdate();
            expect(result.current[0]).toBe(1);
        });
    });
});
