import { eStaff } from "./Staff"

export default class Movie {
  movieId: string
  name: string
  duration: string
  instruction: string | null
  score: number | null
  postUrl: string | null
  tags: string | null
  releaseDate: string | null
  removalDate: string | null
  director: eStaff | null
  actors: eStaff[] | null

  public constructor(
    data:
      | {
          movieId: string
          name: string
          duration: string
          instruction: string | null
          score: number | null
          postUrl: string | null
          tags: string | null
          releaseDate: string | null
          removalDate: string | null
          director: eStaff
          actors: eStaff[]
        }
      | undefined
  ) {
    if (data) {
      this.movieId = data.movieId
      this.name = data.name
      this.duration = data.duration
      this.instruction = data.instruction || ''
      this.score = data.score || 0
      this.postUrl = data.postUrl || ''
      this.tags = data.tags || ''
      this.releaseDate = data.releaseDate
      this.removalDate = data.removalDate
      this.director = data.director
      this.actors = data.actors
    } else {
      this.movieId = ''
      this.name = ''
      this.duration = ''
      this.instruction = null
      this.score = null
      this.postUrl = null
      this.tags = null
      this.releaseDate = null
      this.removalDate = null
      this.director = null
      this.actors = null
    }
  }
}

export class eMovie {
  movieId: string
  name: string
  postUrl: string

  public constructor() {
    this.movieId = ''
    this.name = ''
    this.postUrl = ''
  }
}