export default () => (
    <div style={{marginTop: '40px', color: '#4d4d4d'}}>
        <p>Try these steps to see how optimistic UI effects you app:</p>
        <ol>
            <li>Keep delay default to 10s, submit a new item, you will see a pending item in top of list.</li>
            <li>Quickly change delay to 5s, submit another item, another item appears on top.</li>
            <li>Quickly delete some existing items, deleted item will have line-through effect.</li>
            <li>Wait for all item creation to finish, observe the order of items.</li>
        </ol>
        <p>
            Since a 5s-delayed item will response faster than a 10s-delayed one,
            the final order will be different from how you create them (optimistic order).
        </p>
    </div>
);
