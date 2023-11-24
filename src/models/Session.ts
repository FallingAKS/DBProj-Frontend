export default class Session {
    movieId: string
    cinemaId: string
    hallId: string
    startTime: Date
    attendence: number
    price: number
    language: string
    dimesion:string

    public constructor(data?: {
        movieId: string
        cinemaId: string
        hallId: string
        startTime: Date
        attendence: number
        price: number
        language: string
        dimesion:string
    }) {
        if (data) {
            this.movieId = data.movieId ? data.movieId : ''
            this.cinemaId = data.cinemaId ? data.cinemaId : ''
            this.hallId = data.hallId ? data.hallId : ''
            this.startTime = data.startTime ? data.startTime : new Date()
            this.attendence = data.attendence ? data.attendence : 0
            this.price = data.price ? data.price : 0
            this.language = data.language ? data.language : ''
            this.dimesion = data.dimesion ? data.dimesion : ''
        }
        else {
            this.movieId = ''
            this.cinemaId = ''
            this.hallId = ''
            this.startTime = new Date()
            this.attendence = 0
            this.price = 0
            this.language = ''
            this.dimesion = ''
        }
    }
}