export default class Movie {
  movieId: string
  name: string
  duration: string
  postUrl: string | null
  tags: string | null

  public constructor(data?: {
    movieId: string
    name: string
    duration: string
    postUrl: string | null
    tags: string | null
  }) {
    if (data) {
      this.movieId = data.movieId
      this.name = data.name
      this.duration = data.duration
      this.postUrl = data.postUrl || ''
      this.tags = data.tags || ''
    } else {
      this.movieId = ''
      this.name = ''
      this.duration = ''
      this.postUrl = null
      this.tags = null
    }
  }
}
