export interface ApiResponse<T = unknown> {
    code: number;
    message: string;
    payload: T;
    tt?: number;
}
