import axios from 'axios';

interface FetchOptions {
    timeout?: number
    retries?: number
    logMetrics?: boolean
}

export const fetchApiGet = async <T>(
        url: string,
        header?: Record<string, string>,
        options?: FetchOptions
    ): Promise<T | null> => {

    const { timeout = 15000, retries = 2, logMetrics = false } = options || {} // default options

    let axiosHeader = {
        'Content-Type': 'application/json',
    }

    if (header && Object.entries(header).length > 0) {
        axiosHeader = {
            ...axiosHeader,
            ...header,
        }
    }

    // 재시도 로직
    for (let attempt = 0; attempt <= retries; attempt++) {
        const startTime = Date.now();

        try {
            const response = await axios.get(url, {
                headers: axiosHeader,
                timeout: timeout,
            });

            // 성능체크
            if (logMetrics) {
                const duration = Date.now() - startTime;
                if (duration > 10000) {
                    console.warn(`Slow API response: ${duration}ms - ${url}`)
                } else {
                    console.log(`API response: ${duration}ms`)
                }
            }
            return response.data
        } catch (err) {
            const duration = Date.now() - startTime;

            const shouldRetry = attempt < retries && (
                    err.code === 'ECONNRESET' ||
                    err.code === 'ETIMEDOUT' ||
                    err.code === 'ENOTFOUND' ||
                    err.response?.status >= 500
            )

            if (shouldRetry) {
                const delay = (attempt + 1) * 1000
                if (logMetrics) {
                    console.log(`Retrying API call (${attempt + 1}/${retries}) after ${delay}ms: ${err.message}`)
                }
                await new Promise(resolve => setTimeout(resolve, delay))
                continue
            }

            if (logMetrics) {
                console.error(`API call failed after ${duration}ms: ${err.message}`)
            }
            console.error('error fetch get API data : ', err)
            throw err
        }
    }
}


// TODO : post 도 재시도 로직 필요하면 get 처럼 변경 요망
export const fetchApiPost = async <T>(url: string, header?: Record<string, string>, body?: any): Promise<T | null> => {
    try {
        let axiosHeader = {
            'Content-Type': 'application/json',
        }

        if (Object.entries(header).length > 0) {
            axiosHeader = {
                ...axiosHeader,
                ...header,
            }
        }

        const response = await axios.post(url, body, {
            headers: axiosHeader,
        })

        return response.data
    } catch (err) {
        console.error('error fetch get API data : ', err)
        return err
    }
}