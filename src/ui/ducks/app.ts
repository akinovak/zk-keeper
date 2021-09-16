import {useSelector} from "react-redux";
import deepEqual from "fast-deep-equal";
import {AppRootState} from "@src/ui/store/configureAppStore";
import {Dispatch} from "redux";
import postMessage from "@src/util/postMessage";

export enum ActionType {
  SET_APP_TEXT = 'app/setAppText',
  SET_IDENTITIES = 'app/setIdentity',
}

type Action = {
  type: string;
  payload?: any;
  error?: boolean;
  meta?: any;
};

type State = {
  text: string;
  identityCommitment: string,
};

const initialState: State = {
  text: 'Hello, World!',
  identityCommitment: '',
};

export const updateAppText = (text: string) => async (dispatch: Dispatch) => {
  await postMessage({
    type: 'SET_APP_TEXT',
    payload: text,
  });

  dispatch(setAppText(text));
};

export const setAppText = (text: string) => ({
  type: ActionType.SET_APP_TEXT,
  payload: text,
});

export const setIdentity = (identity: any) => ({
  type: ActionType.SET_IDENTITIES,
  payload: identity,
});

export default function app(state = initialState, action: Action): State {
  switch (action.type) {
    case ActionType.SET_APP_TEXT:
      return {
        ...state,
        text: action.payload,
      };
    case ActionType.SET_IDENTITIES:
      return {
        ...state,
        identityCommitment: action.payload,
      };
    default:
      return state;
  }
}

export const useAppText = () => {
  return useSelector((state: AppRootState) => {
    return state.app.text;
  }, deepEqual)
};

export const useIdentityComitment = () => {
  return useSelector((state: AppRootState) => {
    return state.app.identityCommitment;
  }, deepEqual)
};

// import postMessage from "@src/util/postMessage";

export const getIdentity = () => async (dispatch: Dispatch) => {
  // this will post a message to background and invoke the controller handler
  const identityCommitment = await postMessage({ type: 'GET_IDENTITY' });
  dispatch({
    type: ActionType.SET_IDENTITIES,
    payload: identityCommitment,
  });
}

export interface IBuiltTreeData {
  merkleProof: any, 
  externalNullifier: string | bigint, 
  signal: string, 
  wasmFilePath: string, 
  finalZkeyPath: string
}