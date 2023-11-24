export default class Hall {
    hallID: string
    cinemaID: string
    hallType: string
    seat: {
        rows: number
        cols: number[]
    }

    public constructor(data?: {
        hallID: string
        cinemaID: string
        hallType: string
        seat: {
            rows: number
            cols: number[]
        }
    }) {
        if (data) {
            this.hallID = data.hallID
            this.cinemaID = data.cinemaID
            this.hallType = data.hallType
            this.seat = data.seat
        }
        else {
            this.hallID = ''
            this.cinemaID = ''
            this.hallType = ''
            this.seat = {
                rows: 1,
                cols: [1]
            }
        }
    }
}
