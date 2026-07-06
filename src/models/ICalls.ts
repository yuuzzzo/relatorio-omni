import { IPagination } from "./IPagination";

export interface ICalls {
    callId: string,
    contactId: string,
    contactName: string,
    contactNumber: string,
    date: string,
    startDate: string,
    endDate: string,
    duration: number,
    totalDuration: number,
    waitingTime: number,
    trunk: string,
    ramal: string,
    protocol: string,
    status: string,
    tabulation: string,
    subtabulation: string,
    type: string,
    userId: string,
    userName: string,
    userEmail: string,
    userProfile: string,
    teamId: string,
    teamName: string,
    hangup: string,
}

export interface IApiResponseCalls {
    data: ICalls[];
    meta: IPagination;
}