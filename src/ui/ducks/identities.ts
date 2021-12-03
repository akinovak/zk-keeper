/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CreateInterrepIdentityMetadata as CreateInterrepIdentityOption } from '@src/types'
import { Dispatch } from 'redux'
import postMessage from '@src/util/postMessage'
import RPCAction from '@src/util/constants'
import { useSelector } from 'react-redux'
import { AppRootState } from '@src/ui/store/configureAppStore'
import deepEqual from 'fast-deep-equal'

enum ActionType {
    SET_COMMITMENTS = 'app/identities/setCommitments',
    SET_REQUEST_PENDING = 'app/identities/setRequestPending'
}

type Action<payload> = {
    type: ActionType
    payload?: payload
    meta?: any
    error?: boolean
}

type State = {
    identityCommitments: string[]
    requestPending: boolean
}

const initialState: State = {
    identityCommitments: [],
    requestPending: false
}

export const createIdentity = (strategy: string, options: any) => async (dispatch: Dispatch) => postMessage({
        method: RPCAction.CREATE_IDENTITY,
        payload: {
            strategy,
            options
        }
    })

export const setActiveIdentity = (identityCommitment: string) => async (dispatch: Dispatch) => {
    if (!identityCommitment) {
        throw new Error('Identity Commitment not provided!')
    }
    return postMessage({
        method: RPCAction.SET_ACTIVE_IDENTITY,
        payload: {
            identityCommitment
        }
    })
}

export const setIdentities = (identities: string[]): Action<string[]> => ({
    type: ActionType.SET_COMMITMENTS,
    payload: identities
})

export const setIdentityRequestPending = (requestPending: boolean): Action<boolean> => ({
    type: ActionType.SET_REQUEST_PENDING,
    payload: requestPending
})

export const fetchIdentities = () => async (dispatch: Dispatch) => {
    const identities = await postMessage({ method: RPCAction.GET_COMMITMENTS })
    dispatch(setIdentities(identities))
}

// eslint-disable-next-line @typescript-eslint/default-param-last
export default function identities(state = initialState, action: Action<any>): State {
    switch (action.type) {
        case ActionType.SET_COMMITMENTS:
            return {
                ...state,
                identityCommitments: action.payload
            }
        case ActionType.SET_REQUEST_PENDING:
            return {
                ...state,
                requestPending: action.payload
            }
        default:
            return state
    }
}

export const useIdentities = () => useSelector((state: AppRootState) => state.identities.identityCommitments, deepEqual)

export const useIdentityRequestPending = () => useSelector((state: AppRootState) => state.identities.requestPending, deepEqual)
