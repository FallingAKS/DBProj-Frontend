export default class Interaction {
  commentId: string
  customerId: string
  type: number

  public constructor(commentId?: string) {
    this.commentId = commentId ?? ''
    this.customerId = ''
    this.type = -1
  }
}
