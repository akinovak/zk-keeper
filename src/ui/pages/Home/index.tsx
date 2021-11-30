import React, {ReactElement, useCallback, useEffect, useState} from "react";
import Button, {ButtonType} from "@src/ui/components/Button";
import {useDispatch} from "react-redux";
import postMessage from "@src/util/postMessage";
import {RPCAction} from "@src/util/constants";
import {fetchWalletInfo, useAccount, useNetwork, useWeb3Connecting} from "@src/ui/ducks/web3";
import Icon from "@src/ui/components/Icon";
import Modal from "@src/ui/components/Modal";
import Input from "@src/ui/components/Input";
import Dropdown from "@src/ui/components/Dropdown";
import {createIdentity, fetchIdentities, setActiveIdentity, useIdentities} from "@src/ui/ducks/identities";

export default function Home (): ReactElement {
    const dispatch = useDispatch();
    const web3Connecting = useWeb3Connecting();
    const account = useAccount();
    const networkType = useNetwork();
    const identities = useIdentities();
    const [showingModal, showModal] = useState(false);

    useEffect(() => {
        // dispatch here
        dispatch(fetchIdentities());
        dispatch(fetchWalletInfo());
    }, []);

    const connectMetamask = useCallback(async () => {
        await postMessage({ method: RPCAction.CONNECT_METAMASK });
    }, []);

    return (
        <div className="p-4">
            { showingModal && <CreateIdentityModal onClose={() => showModal(false)} /> }
            <div className="text-xs font-bold mb-1">
                {
                    account
                        ? `Account (${networkType})`
                        : 'Connect to Metamask'
                }
            </div>
            <div className="text-lg mb-2">
                {
                    account
                        ? `${account.slice(0, 6)}...${account.slice(-4)}`
                        : (
                            <Button
                                btnType={ButtonType.primary}
                                onClick={connectMetamask}
                                loading={web3Connecting}
                            >
                                Connect to Metamask
                            </Button>
                        )}
            </div>
            <div className="flex flex-row flex-nowrap items-center text-xs font-bold">
                <div className="flex-grow">Identities</div>
                <Icon
                    className="rounded-full border-2 p-1 text-gray-400 border-gray-400 hover:border-gray-900 hover:text-gray-900"
                    fontAwesome="fas fa-plus"
                    onClick={() => showModal(true)}
                />
            </div>
            <div className="text-2xl py-2">
                {
                    identities.map((identityCommitment) => {
                        return (
                            <div 
                                className="border rounded p-2 my-2"
                                onClick={
                                    async () => {
                                        await dispatch(setActiveIdentity(identityCommitment))
                                    }
                                }
                            >
                                {/* <div className="font-bold text-xs text-gray-500">
                                    {`${type} (${web2Provider})`}
                                </div> */}
                                <div className="text-lg">
                                    {`${identityCommitment.slice(0, 8)}...${identityCommitment.slice(-6)}`}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

function CreateIdentityModal(props: {onClose: () => void}): ReactElement {
    const [nonce, setNonce] = useState(0);
    const [web2Provider, setWeb2Provider] = useState<'Twitter' | 'Github' | 'Reddit'>('Twitter');
    const dispatch = useDispatch();

    const create = useCallback(async () => {
        await dispatch(createIdentity('interrep', {
            nonce,
            web2Provider,
            sign: () => Promise.resolve(''),
            account: '',
        }))
        props.onClose();
    }, [nonce, web2Provider]);

    return (
        <Modal
            className="py-2 px-4"
            onClose={props.onClose}
        >
            <div className="font-semibold">Create Identity</div>
            <Dropdown
                className="my-2"
                label="Web2 Provider"
                options={[
                    {value: 'Twitter'},
                    {value: 'Reddit'},
                    {value: 'Github'},
                ]}
                onChange={e => {
                    console.log(e);
                    setWeb2Provider(e.target.value as any)
                }}
                value={web2Provider}
            />
            <Input
                className="my-2"
                type="number"
                label="nonce"
                step={1}
                defaultValue={nonce}
                onChange={e => setNonce(Number(e.target.value))}
            />
            <div className="py-2 flex flex-row flex-nowrap justify-end">
                <Button
                    onClick={create}
                >
                    Create
                </Button>
            </div>
        </Modal>
    );
}
