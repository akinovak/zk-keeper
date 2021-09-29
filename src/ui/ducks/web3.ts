import {useSelector} from "react-redux";
import deepEqual from "fast-deep-equal";
import {AppRootState} from "@src/ui/store/configureAppStore";
import {Dispatch} from "redux";
import postMessage from "@src/util/postMessage";
import {RPCAction} from "@src/util/constants";

enum ActionTypes {
    SET_LOADING = 'web3/setLoading',
    SET_CONNECTING = 'web3/setConnecting',
    SET_ACCOUNT = 'web3/setAccount',
    SET_NETWORK = 'web3/setNetwork',
}

type Action<payload> = {
    type: ActionTypes;
    payload?: payload;
    meta?: any;
    error?: boolean;
}

type State = {
    account: string;
    networkType: string;
    loading: boolean;
    connecting: boolean;
}

const initialState: State = {
    account: '',
    networkType: '',
    loading: false,
    connecting: false,
};

export const setWeb3Connecting = (connecting: boolean): Action<boolean> => ({
    type: ActionTypes.SET_CONNECTING,
    payload: connecting,
});

export const setAccount = (account: string): Action<string> => ({
    type: ActionTypes.SET_ACCOUNT,
    payload: account,
});

export const setNetwork = (network: string): Action<string> => ({
    type: ActionTypes.SET_NETWORK,
    payload: network,
});

export const fetchWalletInfo = () => async (dispatch: Dispatch) => {
    const info = await postMessage({ type: RPCAction.GET_WALLET_INFO });

    if (info) {
        dispatch(setAccount(info.account));
    }
}

export default function web3(state = initialState, action: Action<any>): State {
    switch (action.type) {
        case ActionTypes.SET_ACCOUNT:
            return {
                ...state,
                account: action.payload,
            };
        case ActionTypes.SET_NETWORK:
            return {
                ...state,
                networkType: action.payload,
            };
        case ActionTypes.SET_CONNECTING:
            return {
                ...state,
                connecting: action.payload,
            };
        default:
            return state;
    }
}

export const useWeb3Connecting = () => {
    return useSelector((state: AppRootState) => {
        return state.web3.connecting;
    }, deepEqual);
};

export const useAccount = () => {
    return useSelector((state: AppRootState) => {
        return state.web3.account;
    }, deepEqual);
};


