import type { HostGameReponse, JoinGameResponse } from "./types";
import { get, post, toast } from "./utils";

export const joinGame = async (gameCode: string) => {
    const res = await get<JoinGameResponse>(`/join/${gameCode}`);
    toast(res.message, res.success ? "success" : "error");
    return res;
};

export const hostGame = async () => {
    const res = await post<HostGameReponse>(`/host`);
    toast(res.message, res.success ? "success" : "error");
    return res;
};
