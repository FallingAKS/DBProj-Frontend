export default class MovieData{
    movieName: string
    totalBoxOffice: number
    attendance: number
    audienceNumber: number
    premiereDate: Date

    public constructor(data?: {
        movieName: string
        totalBoxOffice: number
        attendance: number
        audienceNumber: number
        premiereDate: Date
    }) {
        if (data) {
            this.movieName = data.movieName
            this.totalBoxOffice = data.totalBoxOffice
            this.attendance = data.attendance
            this.audienceNumber = data.audienceNumber
            this.premiereDate = data.premiereDate
        }
        else {
            this.movieName = ""
            this.totalBoxOffice = 0.0
            this.attendance = 0.0
            this.audienceNumber = 0
            this.premiereDate = new Date()
        }
    }
}
