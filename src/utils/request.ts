/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {AxiosError} from 'axios'

const host = process.env.NEXT_PUBLIC_LORE_HOST

type Token = { token: string, clientToken: string }

interface ApiResponse<T = any> {
    response: {
        status: number;
        data: T;
    };
}

export const post = async <B = any, R = any>(
    endpoint: string,
    body: B | FormData,
): Promise<ApiResponse<R>> => {
    try {
        const response = await axios.post(host + endpoint, body)
        return {response: {status: response.status, data: response.data as R}}
    } catch (e) {
        if (e instanceof AxiosError && e.response?.status === 513) {
            const res = await post('/session/refresh', {
                token: localStorage.getItem('__lorest'),
                clientToken: localStorage.getItem('__lore_client'),
            })
            if (res.response.status === 200) {
                const successfulRes = res.response.data as Token
                console.log('Refreshed')
                localStorage.setItem('__lorest', successfulRes.token)
                localStorage.setItem('__lore_client', successfulRes.clientToken)

                if (body instanceof FormData) {
                    const fd = new FormData();
                    for (const [k, v] of body.entries()) fd.append(k, v as any);
                    fd.append('token', successfulRes.token);
                    fd.append('clientToken', successfulRes.clientToken);
                    return await post<B, R>(endpoint, fd)
                }

                return await post<Record<string, any>, R>(endpoint, {
                    ...(body as Record<string, any>),
                    token: successfulRes.token,
                    clientToken: successfulRes.clientToken,
                })
            } else {
                localStorage.removeItem('__lorest')
                localStorage.removeItem('__lore_client')
                console.log('Nah bruh')
                return {response: {status: e.response.status, data: e.response.data as R}}
            }
        } else if (e instanceof AxiosError)
            return {response: {status: e.response?.status || 500, data: (e.response?.data as R) || ({} as R)}}
        else return {response: {status: 500, data: 'Unknown error' as unknown as R}}
    }
}

export const get = async <R = any>(endpoint: string): Promise<ApiResponse<R>> => {
    try {
        const response = await axios.get(host + endpoint)
        return {response: {status: response.status, data: response.data as R}}
    } catch (e: unknown) {
        if (e instanceof AxiosError)
            return {response: {status: e.response?.status || 500, data: e.response?.data as R}}
        else return {response: {status: 500, data: 'Unknown error' as unknown as R}}
    }
}