import React, {ReactElement} from "react";
import "./popup.scss";
import {Redirect, Route, Switch} from "react-router";
import Home from "@src/ui/pages/Home";

export default function Popup (): ReactElement {
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
