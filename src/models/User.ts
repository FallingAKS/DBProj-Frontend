export default class User {
  id: string
  displayName: string
  avatarUrl: string
  email: string
  type: 'Anonymous' | 'Customer' | 'Manager' | 'Administrator'
  vip: boolean

  constructor() {
    this.id = ''
    this.displayName = '未登录'
    this.avatarUrl = '/img/default_avatar.jpg'
    this.email = ''
    this.type = 'Anonymous'
    this.vip = false
  }
}
