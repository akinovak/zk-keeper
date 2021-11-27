import React, {ReactElement, useEffect} from "react";
import "./popup.scss";
import {Redirect, Route, Switch} from "react-router";
import Home from "@src/ui/pages/Home";
import { useIdentityRequestPending} from "@src/ui/ducks/identities";
import Button, {ButtonType} from "@src/ui/components/Button";
import {useDispatch} from "react-redux";
import {RPCAction} from "@src/util/constants";
import postMessage from "@src/util/postMessage";

export default function Popup (): ReactElement {
  // const idRequestPending = useIdentityRequestPending();
  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(fetchIdentityRequestPendingStatus());
  // }, []);

  // if (idRequestPending) {
  //   return (
  //     <div className="popup">
  //       <div className="p-4">
  //         <div>Do you want to share you identities?</div>
  //         <Button
  //             btnType={ButtonType.secondary}
  //             onClick={() => postMessage({ type: RPCAction.REJECT_REQUEST })}
  //         >
  //           Reject
  //         </Button>
  //         <Button
  //             btnType={ButtonType.primary}
  //             onClick={() => postMessage({ type: RPCAction.CONFIRM_REQUEST })}
  //         >
  //           Confirm
  //         </Button>
  //       </div>
  //     </div>
  //     );
  // }

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
