import {GenericService} from "@src/util/svc";
import pushMessage from "@src/util/pushMessage";
import { getIdentity } from "@src/ui/ducks/app";

export default class Identity extends GenericService {

    private identity: any;

    start = async () => {
        this.identity = { secret: 'hey man'} //await to fetch from storage or create new if nothing exists
    }

    get = async () => {
        return pushMessage(getIdentity(this.identity));
    };
}