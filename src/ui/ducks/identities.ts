import {CreateIdentityOption as CreateInterrepIdentityOption} from "@src/util/idTypes/interrep";
import {Dispatch} from "redux";
import postMessage from "@src/util/postMessage";
import {RPCAction} from "@src/util/constants";
import {SafeIdentity} from "@src/util/idTypes";
import {useSelector} from "react-redux";
import {AppRootState} from "@src/ui/store/configureAppStore";
import deepEqual from "fast-deep-equal";

enum ActionType {
    SET_IDENTITIES = 'app/identities/setIdentities',
}

type Action<payload> = {
    type: ActionType;
    payload?: payload;
    meta?: any;
    error?: boolean;
}

type State = {
    order: SafeIdentity[];
}

const initialState: State = {
    order: [],
};

export const createIdentity = (id: string, option: CreateInterrepIdentityOption) => async (dispatch: Dispatch) => {
    return postMessage({
        type: RPCAction.CREATE_IDENTITY,
        payload: {
            id,
            option,
        },
    });
}

export const setIdentities = (identities: SafeIdentity[]): Action<SafeIdentity[]> => ({
    type: ActionType.SET_IDENTITIES,
    payload: identities,
})

export const fetchIdentities = () => async (dispatch: Dispatch) => {
    const identities = await postMessage({ type: RPCAction.GET_IDENTITIES });
    dispatch(setIdentities(identities));
}

export default function identities(state = initialState, action: Action<any>): State {
    switch (action.type) {
        case ActionType.SET_IDENTITIES:
            return {
                ...state,
                order: action.payload,
            };
        default:
            return state;
    }
}

export const useIdentities = () => {
    return useSelector((state: AppRootState) => {
        return state.identities.order;
    }, deepEqual);
}