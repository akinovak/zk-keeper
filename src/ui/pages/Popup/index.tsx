import React, {ReactElement, useCallback, useState} from "react";
import "./popup.scss";
import {Redirect, Route, Switch} from "react-router";
import Button from "@src/ui/components/Button";
import Input from "@src/ui/components/Input";
import Icon from "@src/ui/components/Icon";
import Textarea from "@src/ui/components/Textarea";
import Checkbox from "@src/ui/components/Checkbox";
import SwitchButton from "@src/ui/components/SwitchButton";
import {setAppText, updateAppText, useAppText} from "@src/ui/ducks/app";
import {useDispatch} from "react-redux";

export default function Popup (): ReactElement {
  const appText = useAppText();
  const dispatch = useDispatch();

  const [text, setText] = useState('');
  const onUpdate = useCallback(async () => {
    await dispatch(updateAppText(text));
    setText('');
  }, [text, dispatch]);

  return (
    <div className="popup">
      <Switch>
        <Route path="/">
          <div className="p-4">
            <div className="text-xs font-bold">APP TEXT</div>
            <div className="text-2xl">{appText}</div>
            <Input
                className="my-4"
                label="Update app text here"
                onChange={e => setText(e.target.value)}
                value={text}
            />
            <Button
                className="my-4 w-full"
                onClick={onUpdate}
                disabled={!text}
            >
              <Icon className="text-white my-4 mr-2" fontAwesome="fas fa-pen" size={1} />
              <span>Update Text</span>
            </Button>
          </div>
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </div>
  )
};
