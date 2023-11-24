export default class Cinema {
  cinemaId: string
  location: string
  name: string
  managerId: string
  cinemaImageUrl: string
  feature: string

  public constructor() {
    this.cinemaId = ''
    this.location = ''
    this.name = ''
    this.managerId = ''
    this.cinemaImageUrl = ''
    this.feature = ''
  }
}

export class CinemaCreator extends Cinema {
  // managerName: string
  managerPassword: string
  // managerEmail: string

  public constructor() {
    super()
    this.cinemaId = '系统自动生成'
    // this.managerName = ''
    this.managerPassword = ''
    // this.managerEmail = ''
  }
}