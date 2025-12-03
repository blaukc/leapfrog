import type { HostGameReponse, JoinGameResponse } from "./types";
import { get, post } from "./utils";

export const joinGame = async (gameCode: string) => {
    return get<JoinGameResponse>(`/join/${gameCode}`);
};

export const hostGame = async () => {
    return post<HostGameReponse>(`/host`);
};
