export interface BaseApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}