import axios from 'axios'

export const fetchApiGet = async <T>(url: string, header?: Record<string, string>): Promise<T | null> => {
    try {
        let axiosHeader = {
            'Content-Type': 'application/json',
        }

        if (header && Object.entries(header).length > 0) {
            axiosHeader = {
                ...axiosHeader,
                ...header,
            }
        }

        console.log('fetch get url : ', url)

        const response = await axios.get(url, {
            headers: axiosHeader,
        })

        return response.data
    } catch (err) {
        console.error('error fetch get API data : ', err)
        return err
    }
}
const fetchApiPost = async <T>(url: string, header?: Record<string, string>, body?: any): Promise<T | null> => {
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