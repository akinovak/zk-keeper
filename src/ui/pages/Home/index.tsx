import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import Button, { ButtonType } from '@src/ui/components/Button'
import { useDispatch } from 'react-redux'
import postMessage from '@src/util/postMessage'
import RPCAction from '@src/util/constants'
import { fetchWalletInfo, useAccount, useNetwork, useWeb3Connecting } from '@src/ui/ducks/web3'
import Icon from '@src/ui/components/Icon'
import Modal from '@src/ui/components/Modal'
import Input from '@src/ui/components/Input'
import Dropdown from '@src/ui/components/Dropdown'
import { createIdentity, fetchIdentities, setActiveIdentity, useIdentities } from '@src/ui/ducks/identities'
import Header from "@src/ui/components/Header";
import classNames from "classnames";
import { browser } from 'webextension-polyfill-ts';
import "./home.scss";

export default function Home(): ReactElement {
    const dispatch = useDispatch()
    const identities = useIdentities()
    const [showingModal, showModal] = useState(false)

    useEffect(() => {
        // dispatch here
        dispatch(fetchIdentities())
        dispatch(fetchWalletInfo())
    }, []);

    console.log(identities);
    return (
        <div className="w-full h-full flex flex-col">
            <Header />
            <HomeInfo />
        </div>
    )

    // return (
    //     <div className="p-4">
    //         {showingModal && <CreateIdentityModal onClose={() => showModal(false)} />}
    //         <div className="text-2xl py-2">
    //             {identities.map((identityCommitment) => (
    //                 <div
    //                     className="border rounded p-2 my-2"
    //                     onClick={async () => {
    //                         await dispatch(setActiveIdentity(identityCommitment))
    //                     }}
    //                 >
    //                     {/* <div className="font-bold text-xs text-gray-500">
    //                                 {`${type} (${web2Provider})`}
    //                             </div> */}
    //                     <div className="text-lg">
    //                         {`${identityCommitment.slice(0, 8)}...${identityCommitment.slice(-6)}`}
    //                     </div>
    //                 </div>
    //             ))}
    //         </div>
    //     </div>
    // )
}

function HomeInfo(): ReactElement {
    const network = useNetwork();
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const tabs = await browser.tabs.query({active: true, lastFocusedWindow: true});
                const [tab] = tabs || [];

                if (tab?.url) {
                    const {origin} = new URL(tab.url);
                    const isHostApproved = await postMessage({
                        method: RPCAction.IS_HOST_APPROVED,
                        payload: origin,
                    });
                    setConnected(isHostApproved);
                }
            } catch(e) {
                setConnected(false);
            }
        })();

    }, []);

    return (
        <div className="home__info">
            <div className="home__connection-button">
                <div
                    className={classNames('home__connection-button__icon', {
                        'home__connection-button__icon--connected': connected,
                    })}
                />
                <div className="text-xs home__connection-button__text">
                    { connected ? 'Connected' : 'Not Connected'}
                </div>
            </div>
            <div>
                <div className="text-3xl font-semibold">
                    { network ? `0.0000 ${network.nativeCurrency.symbol}` : '-'}
                </div>
            </div>
        </div>
    )
}

const CreateIdentityModal = function (props: { onClose: () => void }): ReactElement {
    const [nonce, setNonce] = useState(0)
    const [web2Provider, setWeb2Provider] = useState<'Twitter' | 'Github' | 'Reddit'>('Twitter')
    const dispatch = useDispatch()

    const create = useCallback(async () => {
        // TODO add radnom strategy while metamask issue is not resolved
        await dispatch(
            createIdentity('random', {
                nonce,
                web2Provider
            })
        )
        props.onClose()
    }, [nonce, web2Provider])

    return (
        <Modal className="py-2 px-4" onClose={props.onClose}>
            <div className="font-semibold">Create Identity</div>
            <Dropdown
                className="my-2"
                label="Web2 Provider"
                options={[{ value: 'Twitter' }, { value: 'Reddit' }, { value: 'Github' }]}
                onChange={(e) => {
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
                onChange={(e) => setNonce(Number(e.target.value))}
            />
            <div className="py-2 flex flex-row flex-nowrap justify-end">
                <Button onClick={create}>Create</Button>
            </div>
        </Modal>
    )
}
