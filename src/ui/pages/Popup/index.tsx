import React, {ReactElement, useEffect} from "react";
import "./popup.scss";
import {Redirect, Route, Switch} from "react-router";
import Home from "@src/ui/pages/Home";
import { finalizeRequest, useRequestPending, fetchRequestPendingStatus } from "@src/ui/ducks/requests";
import Button, {ButtonType} from "@src/ui/components/Button";
import {useDispatch} from "react-redux";

export default function Popup (): ReactElement {
  const requestPending = useRequestPending();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRequestPendingStatus());
  }, []);

  if (requestPending) {
    return (
      <div className="popup">
        <div className="p-4">
          <div>Do you want to allow proof</div>
          <Button
              btnType={ButtonType.secondary}
              onClick={() => finalizeRequest(requestPending.id, 'accept')}
          >
            Reject
          </Button>
          <Button
              btnType={ButtonType.primary}
              onClick={() => finalizeRequest(requestPending.id, 'reject')}
          >
            Confirm
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
