import { useSession } from "next-auth/react";

import {getDeviceKeyEncodedMessage} from '../backendAuth';

export default function useSessionEncodedMessage(){
    const {data : session, status : sessionStatus } = useSession();

    const {data : msg_encoded, error : msg_error} = useSWR(session, getDeviceKeyEncodedMessage, {refreshInterval : 60});

    return {session, sessionStatus, msg_encoded, msg_error};
}