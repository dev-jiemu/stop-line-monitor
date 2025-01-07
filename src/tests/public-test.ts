import axios from 'axios'
import { type BusStationResponse } from './public-interface'

const fetchApiData = async (url: string, accessKey: string): Promise<BusStationResponse | null> => {
    try {
        let reqUrl = url + '?key=' + accessKey + '&Type=json&pSize=50&SIGUN_CD=41280'

        const response = await axios.get(reqUrl, {
            headers: {
                'Content-Type': 'application/json',
            },
        })

        return response.data
    } catch (err) {
        console.error('error fetch API data : ', err)
        return null
    }
}

const main = async () => {
    const url = 'https://openapi.gg.go.kr/BusStation'
    const accessKey = ''

    return await fetchApiData(url, accessKey)
}

main().then(result => {
    console.log(result)
    console.log(result.BusStation)
}).catch(err => {
    console.error(err)
})