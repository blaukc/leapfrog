import type {
    CreatePlayerReponse,
    CreateSpectatorReponse,
    HostGameReponse,
    JoinGameResponse,
} from "./types";
import { get, post, toast } from "./utils";

export const joinGame = async (gameCode: string) => {
    const res = await get<JoinGameResponse>(`/game/${gameCode}/join`);
    toast(res.message, res.success ? "success" : "error");
    return res;
};

export const hostGame = async () => {
    const res = await post<HostGameReponse>(`/host`);
    toast(res.message, res.success ? "success" : "error");
    return res;
};

export const createPlayer = async (gameCode: string, playerName: string) => {
    const res = await post<CreatePlayerReponse>(
        `/game/${gameCode}/create-player`,
        {
            name: playerName,
        }
    );
    toast(res.message, res.success ? "success" : "error");
    return res;
};

export const createSpectator = async (gameCode: string) => {
    const res = await post<CreateSpectatorReponse>(
        `/game/${gameCode}/create-spectator`
    );
    toast(res.message, res.success ? "success" : "error");
    return res;
};
