import { decodeJwt } from "jose";

export function getUDID(token: string) {
    const data = decodeJwt(token);
    return (
        data.data as {
            token: string;
        }
    ).token;
}
