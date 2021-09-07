import {GenericService} from "@src/util/svc";
import pushMessage from "@src/util/pushMessage";
import {setAppText} from "@src/ui/ducks/app";

export default class Other extends GenericService {
    setAppText = async (appText: string) => {
        return pushMessage(setAppText(appText));
    };
}