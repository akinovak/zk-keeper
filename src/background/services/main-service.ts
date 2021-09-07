import {GenericService} from "@src/util/svc";

export default class Main extends GenericService {
    setAppText = async (appText: string) => {
        return this.exec('other', 'setAppText', appText);
    };
}