import React, {ReactElement, useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import FullModal, {FullModalContent, FullModalFooter, FullModalHeader} from "@src/ui/components/FullModal";
import Button, {ButtonType} from "@src/ui/components/Button";
import {useRequestsPending} from "@src/ui/ducks/requests";
import {PendingRequest, PendingRequestType} from "@src/types";
import RPCAction from "@src/util/constants";
import postMessage from "@src/util/postMessage";
import "./confirm-modal.scss";
import Input from "@src/ui/components/Input";
import Textarea from "@src/ui/components/Textarea";

export default function ConfirmRequestModal(): ReactElement {
    const pendingRequests = useRequestsPending();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const [activeIndex, setActiveIndex] = useState(0);
    const pendingRequest = pendingRequests[activeIndex];

    const reject = useCallback(async () => {
        setLoading(true);
        try {
            const id = pendingRequest?.id;
            await postMessage({
                method: RPCAction.FINALIZE_REQUEST,
                payload: {
                    id,
                    action: 'reject',
                },
            });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [pendingRequest]);

    const approve = useCallback(async () => {
        setLoading(true);
        try {
            const id = pendingRequest?.id;
            await postMessage({
                method: RPCAction.FINALIZE_REQUEST,
                payload: {
                    id,
                    action: 'accept',
                },
            });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [pendingRequest]);

    if (!pendingRequest) return <></>;

    switch (pendingRequest.type) {
        case PendingRequestType.INJECT:
            return (
                <ConnectionApprovalModal
                    len={pendingRequests.length}
                    pendingRequest={pendingRequest}
                    accept={approve}
                    reject={reject}
                    error={error}
                    loading={loading}
                />
            );
        case PendingRequestType.PROOF:
            return (
                <ProofModal
                    len={pendingRequests.length}
                    pendingRequest={pendingRequest}
                    accept={approve}
                    reject={reject}
                    error={error}
                    loading={loading}
                />
            )
        case PendingRequestType.APPROVE:
        default:
            return <></>;
    }
}

function ConnectionApprovalModal(props: {
    len: number;
    reject: () => void;
    accept: () => void;
    loading: boolean;
    error: string;
    pendingRequest: PendingRequest;
}) {
    const origin = props.pendingRequest.payload?.origin;
    useEffect(() => {
        const url = new URL(props.pendingRequest.payload.origin);
        console.log(url)
    }, [props.pendingRequest]);

    return (
        <FullModal className="confirm-modal" onClose={() => null}>
            <FullModalHeader>
                Connect with ZK Keeper
                {props.len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${props.len}`}</div>}
            </FullModalHeader>
            <FullModalContent className="flex flex-col items-center">
                <img
                    className="w-16 h-16 rounded-full my-6 border border-gray-800 p-2 flex-shrink-0"
                    src={`${origin}/favicon.ico`}
                />
                <div className="text-lg font-semibold mb-2 text-center">
                    {`${origin} would like to connect to your identity`}
                </div>
                <div className="text-sm text-gray-500 text-center">
                    This site is requesting access to view your current identity. Always make sure you trust the site you interact with.
                </div>
            </FullModalContent>
            { props.error && <div className="text-xs text-red-500 text-center pb-1">{props.error}</div>}
            <FullModalFooter>
                <Button
                    btnType={ButtonType.secondary}
                    onClick={props.reject}
                    loading={props.loading}
                >
                    Reject
                </Button>
                <Button
                    className="ml-2"
                    onClick={props.accept}
                    loading={props.loading}
                >
                    Approve
                </Button>
            </FullModalFooter>
        </FullModal>
    );
}

function ProofModal(props: {
    len: number;
    reject: () => void;
    accept: () => void;
    loading: boolean;
    error: string;
    pendingRequest: PendingRequest;
}) {
    const {
        circuitFilePath,
        externalNullifier,
        merkleProof,
        signal,
        zkeyFilePath,
    } = props.pendingRequest?.payload || {};

    return (
        <FullModal className="confirm-modal" onClose={() => null}>
            <FullModalHeader>
                Generate Proof
                {props.len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${props.len}`}</div>}
            </FullModalHeader>
            <FullModalContent className="flex flex-col items-center">
                <Input
                    className="w-full mb-2"
                    label="External Nullifier"
                    value={externalNullifier}
                />
                <Input
                    className="w-full mb-2"
                    label="Signal"
                    value={signal}
                />
                <Input
                    className="w-full mb-2"
                    label="Circuit File URL"
                    value={circuitFilePath}
                />
                <Input
                    className="w-full mb-2"
                    label="ZKey File URL"
                    value={zkeyFilePath}
                />
                {
                    typeof merkleProof === 'string'
                        ? (
                            <Input
                                className="w-full mb-2"
                                label="Merkle Storage URL"
                                value={merkleProof}
                            />
                        )
                        : (
                            <Textarea
                                className="w-full mb-2"
                                label="Merkle Proof"
                                value={JSON.stringify(merkleProof, undefined, 2)}
                                rows={5}
                            />
                        )
                }
            </FullModalContent>
            { props.error && <div className="text-xs text-red-500 text-center pb-1">{props.error}</div>}
            <FullModalFooter>
                <Button
                    btnType={ButtonType.secondary}
                    onClick={props.reject}
                    loading={props.loading}
                >
                    Reject
                </Button>
                <Button
                    className="ml-2"
                    onClick={props.accept}
                    loading={props.loading}
                >
                    Approve
                </Button>
            </FullModalFooter>
        </FullModal>
    );
}
