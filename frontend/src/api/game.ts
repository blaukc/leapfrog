import type {
    CreatePlayerResponse,
    CreateSpectatorResponse,
    HostGameResponse,
    JoinGameResponse,
} from "./types";
import { post, toast } from "./utils";

export const joinGame = async (gameCode: string, clientId: string | null) => {
    const res = await post<JoinGameResponse>(`/game/${gameCode}/join`, {
        clientId,
    });
    toast(res.message, res.success ? "success" : "error");
    return res;
};

export const hostGame = async () => {
    const res = await post<HostGameResponse>(`/host`);
    toast(res.message, res.success ? "success" : "error");
    return res;
};

export const createPlayer = async (gameCode: string, playerName: string) => {
    const res = await post<CreatePlayerResponse>(
        `/game/${gameCode}/create-player`,
        {
            name: playerName,
        },
    );
    toast(res.message, res.success ? "success" : "error");
    return res;
};

export const createSpectator = async (gameCode: string) => {
    const res = await post<CreateSpectatorResponse>(
        `/game/${gameCode}/create-spectator`,
    );
    toast(res.message, res.success ? "success" : "error");
    return res;
};
