export interface BusStationResponse {
    BusStation: {
        head: {
            list_total_count?: number
            RESULT?: {
                CODE: string
                MESSAGE: string
            }
            api_version?: string
        }[]
        row: {
            SIGUN_NM: string
            SIGUN_CD: string
            STATION_NM_INFO: string
            STATION_ID: string
            STATION_MANAGE_NO: string
            STATION_DIV_NM: string
            JURISD_INST_NM: string
            LOCPLC_LOC: string | null
            ENG_STATION_NM_INFO: string
            WGS84_LOGT: string
            WGS84_LAT: string
        }[]
    }[]
}