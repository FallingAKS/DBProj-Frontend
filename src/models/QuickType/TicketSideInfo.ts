// To parse this data:
//
//   import { Convert, TicketSideInfo } from "./file";
//
//   const ticketSideInfo = Convert.toTicketSideInfo(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface TicketSideInfo {
  movie: Movie
  session: Session
}

export interface Movie {
  movieId: string
  name: string
  duration: string
  instruction: string
  score: number
  postUrl: string
  tags: string
  releaseDate: Date
  removalDate: Date
  acts: Act[]
  comments: Comment[]
  sessions: Session[]
}

export interface Act {
  staffId: string
  movieId: string
  role: string
  staff: Staff
}

export interface Staff {
  staffId: string
  name: string
  gender: number
  introduction: string
  imageUrl: string
}

export interface Comment {
  commentId: string
  content: string
  score: number
  likeCount: number
  dislikeCount: number
  publishDate: Date
  display: boolean
  movieId: string
  customerId: string
  sender: Sender
}

export interface Sender {
  customerId: string
  name: string
  password: string
  email: string
  avatarUrl: string
  vip: Vip
}

export interface Vip {
  customerId: string
  endDate: Date
}

export interface Session {
  movieId: string
  cinemaId: string
  hallId: string
  startTime: Date
  attendence: number
  price: number
  language: string
  dimesion: string
  hallLocatedAt: HallLocatedAt
}

export interface HallLocatedAt {
  id: string
  cinemaId: string
  hallType: string
  seat: Seat
  cinemaBelongTo: CinemaBelongTo
}

export interface CinemaBelongTo {
  cinemaId: string
  location: string
  name: string
  managerId: string
  cinemaImageUrl: string
  feature: string
  manager: Manager
}

export interface Manager {
  id: string
  name: string
  password: string
  email: string
  avatarUrl: string
}

export interface Seat {
  rows: number
  cols: number[]
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toTicketSideInfo(json: string): TicketSideInfo {
    return cast(JSON.parse(json), r('TicketSideInfo'))
  }

  public static ticketSideInfoToJson(value: TicketSideInfo): string {
    return JSON.stringify(uncast(value, r('TicketSideInfo')), null, 2)
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
  const prettyTyp = prettyTypeName(typ)
  const parentText = parent ? ` on ${parent}` : ''
  const keyText = key ? ` for key "${key}"` : ''
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`
  )
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a)
        })
        .join(', ')}]`
    }
  } else if (typeof typ === 'object' && typ.literal !== undefined) {
    return typ.literal
  } else {
    return typeof typ
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }))
    typ.jsonToJS = map
  }
  return typ.jsonToJS
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {}
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }))
    typ.jsToJSON = map
  }
  return typ.jsToJSON
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val
    return invalidValue(typ, val, key, parent)
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length
    for (let i = 0; i < l; i++) {
      const typ = typs[i]
      try {
        return transform(val, typ, getProps)
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent)
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val
    return invalidValue(
      cases.map((a) => {
        return l(a)
      }),
      val,
      key,
      parent
    )
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l('array'), val, key, parent)
    return val.map((el) => transform(el, typ, getProps))
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null
    }
    const d = new Date(val)
    if (isNaN(d.valueOf())) {
      return invalidValue(l('Date'), val, key, parent)
    }
    return d
  }

  function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return invalidValue(l(ref || 'object'), val, key, parent)
    }
    const result: any = {}
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key]
      const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined
      result[prop.key] = transform(v, prop.typ, getProps, key, ref)
    })
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref)
      }
    })
    return result
  }

  if (typ === 'any') return val
  if (typ === null) {
    if (val === null) return val
    return invalidValue(typ, val, key, parent)
  }
  if (typ === false) return invalidValue(typ, val, key, parent)
  let ref: any = undefined
  while (typeof typ === 'object' && typ.ref !== undefined) {
    ref = typ.ref
    typ = typeMap[typ.ref]
  }
  if (Array.isArray(typ)) return transformEnum(typ, val)
  if (typeof typ === 'object') {
    return typ.hasOwnProperty('unionMembers')
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty('arrayItems')
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty('props')
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val, key, parent)
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== 'number') return transformDate(val)
  return transformPrimitive(typ, val)
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps)
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps)
}

function l(typ: any) {
  return { literal: typ }
}

function a(typ: any) {
  return { arrayItems: typ }
}

function u(...typs: any[]) {
  return { unionMembers: typs }
}

function o(props: any[], additional: any) {
  return { props, additional }
}

function m(additional: any) {
  return { props: [], additional }
}

function r(name: string) {
  return { ref: name }
}

const typeMap: any = {
  TicketSideInfo: o(
    [
      { json: 'movie', js: 'movie', typ: r('Movie') },
      { json: 'session', js: 'session', typ: r('Session') }
    ],
    false
  ),
  Movie: o(
    [
      { json: 'movieId', js: 'movieId', typ: '' },
      { json: 'name', js: 'name', typ: '' },
      { json: 'duration', js: 'duration', typ: '' },
      { json: 'instruction', js: 'instruction', typ: '' },
      { json: 'score', js: 'score', typ: 0 },
      { json: 'postUrl', js: 'postUrl', typ: '' },
      { json: 'tags', js: 'tags', typ: '' },
      { json: 'releaseDate', js: 'releaseDate', typ: Date },
      { json: 'removalDate', js: 'removalDate', typ: Date },
      { json: 'acts', js: 'acts', typ: a(r('Act')) },
      { json: 'comments', js: 'comments', typ: a(r('Comment')) },
      { json: 'sessions', js: 'sessions', typ: a(r('Session')) }
    ],
    false
  ),
  Act: o(
    [
      { json: 'staffId', js: 'staffId', typ: '' },
      { json: 'movieId', js: 'movieId', typ: '' },
      { json: 'role', js: 'role', typ: '' },
      { json: 'staff', js: 'staff', typ: r('Staff') }
    ],
    false
  ),
  Staff: o(
    [
      { json: 'staffId', js: 'staffId', typ: '' },
      { json: 'name', js: 'name', typ: '' },
      { json: 'gender', js: 'gender', typ: 0 },
      { json: 'introduction', js: 'introduction', typ: '' },
      { json: 'imageUrl', js: 'imageUrl', typ: '' }
    ],
    false
  ),
  Comment: o(
    [
      { json: 'commentId', js: 'commentId', typ: '' },
      { json: 'content', js: 'content', typ: '' },
      { json: 'score', js: 'score', typ: 0 },
      { json: 'likeCount', js: 'likeCount', typ: 0 },
      { json: 'dislikeCount', js: 'dislikeCount', typ: 0 },
      { json: 'publishDate', js: 'publishDate', typ: Date },
      { json: 'display', js: 'display', typ: true },
      { json: 'movieId', js: 'movieId', typ: '' },
      { json: 'customerId', js: 'customerId', typ: '' },
      { json: 'sender', js: 'sender', typ: r('Sender') }
    ],
    false
  ),
  Sender: o(
    [
      { json: 'customerId', js: 'customerId', typ: '' },
      { json: 'name', js: 'name', typ: '' },
      { json: 'password', js: 'password', typ: '' },
      { json: 'email', js: 'email', typ: '' },
      { json: 'avatarUrl', js: 'avatarUrl', typ: '' },
      { json: 'vip', js: 'vip', typ: r('Vip') }
    ],
    false
  ),
  Vip: o(
    [
      { json: 'customerId', js: 'customerId', typ: '' },
      { json: 'endDate', js: 'endDate', typ: Date }
    ],
    false
  ),
  Session: o(
    [
      { json: 'movieId', js: 'movieId', typ: '' },
      { json: 'cinemaId', js: 'cinemaId', typ: '' },
      { json: 'hallId', js: 'hallId', typ: '' },
      { json: 'startTime', js: 'startTime', typ: Date },
      { json: 'attendence', js: 'attendence', typ: 0 },
      { json: 'price', js: 'price', typ: 0 },
      { json: 'language', js: 'language', typ: '' },
      { json: 'dimesion', js: 'dimesion', typ: '' },
      { json: 'hallLocatedAt', js: 'hallLocatedAt', typ: r('HallLocatedAt') }
    ],
    false
  ),
  HallLocatedAt: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'cinemaId', js: 'cinemaId', typ: '' },
      { json: 'hallType', js: 'hallType', typ: '' },
      { json: 'seat', js: 'seat', typ: r('Seat') },
      { json: 'cinemaBelongTo', js: 'cinemaBelongTo', typ: r('CinemaBelongTo') }
    ],
    false
  ),
  CinemaBelongTo: o(
    [
      { json: 'cinemaId', js: 'cinemaId', typ: '' },
      { json: 'location', js: 'location', typ: '' },
      { json: 'name', js: 'name', typ: '' },
      { json: 'managerId', js: 'managerId', typ: '' },
      { json: 'cinemaImageUrl', js: 'cinemaImageUrl', typ: '' },
      { json: 'feature', js: 'feature', typ: '' },
      { json: 'manager', js: 'manager', typ: r('Manager') }
    ],
    false
  ),
  Manager: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'name', js: 'name', typ: '' },
      { json: 'password', js: 'password', typ: '' },
      { json: 'email', js: 'email', typ: '' },
      { json: 'avatarUrl', js: 'avatarUrl', typ: '' }
    ],
    false
  ),
  Seat: o(
    [
      { json: 'rows', js: 'rows', typ: 0 },
      { json: 'cols', js: 'cols', typ: a(0) }
    ],
    false
  )
}
