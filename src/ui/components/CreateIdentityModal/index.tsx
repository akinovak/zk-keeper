import React, {ReactElement, useCallback, useState} from "react";
import {useDispatch} from "react-redux";
import {createIdentity} from "@src/ui/ducks/identities";
import FullModal, {FullModalContent, FullModalFooter, FullModalHeader} from "@src/ui/components/FullModal";
import Dropdown from "@src/ui/components/Dropdown";
import Input from "@src/ui/components/Input";
import Button from "@src/ui/components/Button";

export default function CreateIdentityModal(props: { onClose: () => void }): ReactElement {
    const [nonce, setNonce] = useState(0);
    const [web2Provider, setWeb2Provider] = useState<'Twitter' | 'Github' | 'Reddit'>('Twitter');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch()

    const create = useCallback(async () => {
        setLoading(true);
        try {
            await dispatch(
                createIdentity('interrep', {
                    nonce,
                    web2Provider
                })
            );
            props.onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }

    }, [nonce, web2Provider]);

    return (
        <FullModal onClose={props.onClose}>
            <FullModalHeader onClose={props.onClose}>Create Identity</FullModalHeader>
            <FullModalContent>
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
                    label="Nonce"
                    step={1}
                    defaultValue={nonce}
                    onChange={(e) => setNonce(Number(e.target.value))}
                />
            </FullModalContent>
            { error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}
            <FullModalFooter>
                <Button onClick={create} loading={loading}>Create</Button>
            </FullModalFooter>
        </FullModal>
    )
}
