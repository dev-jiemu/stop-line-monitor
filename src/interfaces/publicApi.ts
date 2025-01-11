export interface BusStationResponse {
    BusStation: BusStation[]
}

interface BusStation {
    head?: Head[]
    rows?: Row[]
}

interface Head {
    list_total_count?: number
    Result?: Result
    api_version?: string
}

interface Result {
    CODE: string
    MESSAGE: string
}

interface Row {
    SIGUN_NM: string,
    SIGUN_CD: string,
    STATION_NM_INFO: string,
    STATION_ID: string,
    STATION_MANAGE_NO: string,
    STATION_DIV_NM: string,
    JURISD_INST_NM: string,
    LOCPLC_LOC: string,
    ENG_STATION_NM_INFO: string,
    WGS84_LOGT: string,
    WGS84_LAT: string,
}