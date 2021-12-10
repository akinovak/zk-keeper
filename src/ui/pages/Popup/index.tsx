/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/function-component-definition */
import React, {ReactElement, ReactNode, useCallback, useEffect, useState} from 'react'
import './popup.scss'
import { Redirect, Route, Switch } from 'react-router'
import Home from '@src/ui/pages/Home'
import { useRequestsPending, fetchRequestPendingStatus } from '@src/ui/ducks/requests'
import Button, { ButtonType } from '@src/ui/components/Button'
import { useDispatch } from 'react-redux'
import RPCAction from '@src/util/constants'
import postMessage from '@src/util/postMessage'
import {fetchStatus, useAppStatus} from "@src/ui/ducks/app";
import Onboarding from "@src/ui/pages/Onboarding";
import Login from "@src/ui/pages/Login";

export default function Popup(): ReactElement {
    // const pendingRequests = useRequestsPending()
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const { initialized, unlocked } = useAppStatus();

    useEffect(() => {
        (async () => {
            try {
                await dispatch(fetchStatus());
                await dispatch(fetchRequestPendingStatus());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // const finalizeRequest = useCallback(
    //     (id: string, action: string) =>
    //         postMessage({
    //             method: RPCAction.FINALIZE_REQUEST,
    //             payload: {
    //                 id,
    //                 action
    //             }
    //         }),
    //     []
    // )
    //
    // if (pendingRequests.length) {
    //     const [pendingRequest] = pendingRequests
    //     return (
    //         <div className="popup">
    //             <div className="p-4">
    //                 <div>{`1 of ${pendingRequests.length} requests`}</div>
    //                 <div>Do you want to allow proof</div>
    //                 <Button btnType={ButtonType.secondary} onClick={() => finalizeRequest(pendingRequest.id, 'accept')}>
    //                     Confirm
    //                 </Button>
    //                 <Button btnType={ButtonType.primary} onClick={() => finalizeRequest(pendingRequest.id, 'reject')}>
    //                     Reject
    //                 </Button>
    //             </div>
    //         </div>
    //     )
    // }

    if (loading) {
        return <></>;
    }

    let content: ReactNode;

    if (!initialized) {
        content = <Onboarding />;
    } else if (!unlocked) {
        content = <Login />;
    } else {
        content = (
            <Switch>
                <Route path="/">
                    <Home />
                </Route>
                <Route>
                    <Redirect to="/" />
                </Route>
            </Switch>
        );
    }

    return (
        <div className="popup">
            {content}
        </div>
    )
}
