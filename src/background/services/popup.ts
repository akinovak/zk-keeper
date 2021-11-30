import pushMessage from "@src/util/pushMessage";
import { GenericService } from "@src/util/svc";

export default class PopupMenager extends GenericService {

    confirmRequest = async () => {
        // const identities = await this.getIdentities();
        // this.emit('accepted', identities);
        // this.requestPending = false;
        // return pushMessage();
    }

    rejectRequest = async () => {
        // this.emit('rejected');
        // this.requestPending = false;
        // return pushMessage();
    }
}