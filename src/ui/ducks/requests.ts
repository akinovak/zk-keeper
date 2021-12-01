import {useSelector} from "react-redux";
import {AppRootState} from "@src/ui/store/configureAppStore";
import deepEqual from "fast-deep-equal";
import { PendingRequest, RequestResolutionAction } from "@src/background/interfaces";
import {Dispatch} from "redux";
import { RPCAction } from "@src/util/constants";
import postMessage from "@src/util/postMessage";

enum ActionType {
    SET_PENDING_RQUEST = 'request/pending',
}

type Action<payload> = {
    type: ActionType;
    payload?: payload;
    meta?: any;
    error?: boolean;
}

type State = {
    pendingRequest: PendingRequest | undefined;
}

const initialState: State = {
    pendingRequest: undefined
};


export const setPendingRequest = (pendingRequests: PendingRequest | undefined): Action<PendingRequest> => {
    return { 
        type: ActionType.SET_PENDING_RQUEST,
        payload: pendingRequests
    }
}

export const fetchRequestPendingStatus = () => async (dispatch: Dispatch) => {
    const pendingRequests = await postMessage({ method: RPCAction.GET_PENDING_REQUESTS });
    const pendingRequest: PendingRequest | undefined = pendingRequests.size ? pendingRequests.pop() : undefined;
    dispatch(setPendingRequest(pendingRequest));
}

export const finalizeRequest = (id: string, action: RequestResolutionAction) => async (dispatch: Dispatch) => {
    return postMessage({
        method: RPCAction.FINALIZE_REQUEST,
        payload: {
            id,
            action,
        },
    });
}

export default function identities(state = initialState, action: Action<any>): State {
    switch (action.type) {
        case ActionType.SET_PENDING_RQUEST:
            return {
                ...state,
                pendingRequest: action.payload,
            };
        default:
            return state;
    }
}

export const useRequestPending = () => {
    return useSelector((state: AppRootState) => {
        return state.requests.pendingRequest;
    }, deepEqual);
}