import React, {ReactElement, useCallback, useEffect, useState} from "react";
import "./popup.scss";
import {Redirect, Route, Switch} from "react-router";
import Button, {ButtonType} from "@src/ui/components/Button";
import {getIdentity, useAppText, useIdentityComitment} from "@src/ui/ducks/app";
import {useDispatch} from "react-redux";
import postMessage from "@src/util/postMessage";
import {RPCAction} from "@src/util/constants";
import {fetchWalletInfo, useAccount, useNetwork, useWeb3Connecting} from "@src/ui/ducks/web3";

export default function Popup (): ReactElement {
  const identityCommitment = useIdentityComitment();
  const dispatch = useDispatch();
  const web3Connecting = useWeb3Connecting();
  const account = useAccount();
  const networkType = useNetwork();

  useEffect(() => {
    // dispatch here
    dispatch(getIdentity())
    dispatch(fetchWalletInfo());
  }, []);

  const connectMetamask = useCallback(async () => {
    await postMessage({ type: RPCAction.CONNECT_METAMASK });
  }, []);

  return (
    <div className="popup">
      <Switch>
        <Route path="/">
          <div className="p-4">
            <div className="text-xs font-bold mb-1">
              {
                account
                  ? `Account (${networkType})`
                  : ''
              }
            </div>
            <div className="text-lg mb-2">
              {account || (
                  <Button
                      btnType={ButtonType.primary}
                      onClick={connectMetamask}
                      loading={web3Connecting}
                  >
                    Connect to Metamask
                  </Button>
              )}
            </div>
            <div className="text-xs font-bold">Identity Commitment</div>
            <div className="text-2xl">{identityCommitment}</div>

          </div>
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </div>
  )
};
