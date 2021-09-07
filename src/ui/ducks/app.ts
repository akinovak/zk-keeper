import {useSelector} from "react-redux";
import deepEqual from "fast-deep-equal";
import {AppRootState} from "@src/ui/store/configureAppStore";
import {Dispatch} from "redux";
import postMessage from "@src/util/postMessage";

export enum ActionType {
  SET_APP_TEXT = 'app/setAppText',
}

type Action = {
  type: string;
  payload?: any;
  error?: boolean;
  meta?: any;
};

type State = {
  text: string;
};

const initialState: State = {
  text: 'Hello, World!',
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

export default function app(state = initialState, action: Action): State {
  switch (action.type) {
    case ActionType.SET_APP_TEXT:
      return {
        ...state,
        text: action.payload,
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
