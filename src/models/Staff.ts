import { eMovie } from './Movie'

export default class Staff {
  staffId: string
  name: string
  gender: number
  introduction: string
  imageUrl: string

  public constructor() {
    this.staffId = ''
    this.name = ''
    this.gender = 0// 0: 男, 1: 女
    this.introduction = ''
    this.imageUrl = ''
  }
}

export class eStaff {
  staffId: string = ''
  name: string = ''

  public constructor() {
    this.staffId = ''
    this.name = ''
  }
}

export class StaffDetail extends Staff {
  directMovies: eMovie[] | null
  starMovies: eMovie[] | null

  public constructor() {
    super()
    this.directMovies = null
    this.starMovies = null
  }
}
