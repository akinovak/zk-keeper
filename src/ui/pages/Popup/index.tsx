import React, {ReactElement, useCallback, useEffect} from "react";
import "./popup.scss";
import {Redirect, Route, Switch} from "react-router";
import Home from "@src/ui/pages/Home";
import { useRequestsPending, fetchRequestPendingStatus } from "@src/ui/ducks/requests";
import Button, {ButtonType} from "@src/ui/components/Button";
import {useDispatch} from "react-redux";
import {RPCAction} from "@src/util/constants";
import postMessage from "@src/util/postMessage";

export default function Popup (): ReactElement {
  const pendingRequests = useRequestsPending();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRequestPendingStatus());
  }, []);

  const finalizeRequest = useCallback((id: string, action: string) => {
    return postMessage({
      method: RPCAction.FINALIZE_REQUEST,
      payload: {
        id,
        action,
      },
    });
  }, []);

  if (pendingRequests.length) {
    const [pendingRequest] = pendingRequests;
    return (
      <div className="popup">
        <div className="p-4">
          <div>{`1 of ${pendingRequests.length} requests`}</div>
          <div>Do you want to allow proof</div>
          <Button
              btnType={ButtonType.secondary}
              onClick={() => finalizeRequest(pendingRequest.id, 'accept')}
          >
            Confirm
          </Button>
          <Button
              btnType={ButtonType.primary}
              onClick={() => finalizeRequest(pendingRequest.id, 'reject')}
          >
            Reject
          </Button>
        </div>
      </div>
      );
  }

  return (
    <div className="popup">
      <Switch>
        <Route path="/">
          <Home />
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </div>
  )
};
