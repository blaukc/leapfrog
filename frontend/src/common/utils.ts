import sha256 from "crypto-js/sha256";

export function getPlayerId(websocketId: string): string {
    return sha256(websocketId).toString().substring(0, 8);
}
