export const setIncomingCall = (state, number) => ({
    type: 'INCOMING_CALL',
    payload: { state, number }
});

export const setActiveCall = (state, number, isMine) => ({
    type: 'ACTIVE_CALL',
    payload: { state, number, isMine }
});

export const setCallStatus = (status) => ({
    type: 'SET_CALL_STATUS',
    payload: status
});

export const setCall = (state) => ({
    type: 'SET_CALL',
    payload: state
});