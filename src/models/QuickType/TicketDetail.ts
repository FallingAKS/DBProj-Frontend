// To parse this data:
//
//   import { Convert, TicketDetail } from "./file";
//
//   const ticketDetail = Convert.toTicketDetail(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface TicketDetail {
    id: string;
    row: number;
    col: number;
    orderTime: Date;
    state: number;
    draw: number;
    price: number;
    customerId: string;
    movieId: string;
    hallId: string;
    startTime: Date;
    cinemaId: string;
    sessionAt: SessionAt;
    buyer: Buyer;
}

export interface Buyer {
    customerId: string;
    name: string;
    password: string;
    email: string;
    avatarUrl: string;
    vip: Vip;
}

export interface Vip {
    customerId: string;
    endDate: Date;
}

export interface SessionAt {
    movieId: string;
    cinemaId: string;
    hallId: string;
    startTime: Date;
    attendence: number;
    price: number;
    language: string;
    dimesion: string;
    hallLocatedAt: HallLocatedAt;
}

export interface HallLocatedAt {
    id: string;
    cinemaId: string;
    hallType: string;
    seat: Seat;
    cinemaBelongTo: CinemaBelongTo;
}

export interface CinemaBelongTo {
    cinemaId: string;
    location: string;
    name: string;
    managerId: string;
    cinemaImageUrl: string;
    feature: string;
    manager: Manager;
}

export interface Manager {
    id: string;
    name: string;
    password: string;
    email: string;
    avatarUrl: string;
}

export interface Seat {
    rows: number;
    cols: number[];
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toTicketDetail(json: string): TicketDetail {
        return cast(JSON.parse(json), r("TicketDetail"));
    }

    public static ticketDetailToJson(value: TicketDetail): string {
        return JSON.stringify(uncast(value, r("TicketDetail")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => {
                return prettyTypeName(a);
            }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = {key: p.js, typ: p.typ});
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = {key: p.json, typ: p.typ});
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {
            }
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => {
            return l(a);
        }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems") ? transformArray(typ.arrayItems, val)
                : typ.hasOwnProperty("props") ? transformObject(getProps(typ), typ.additional, val)
                    : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return {literal: typ};
}

function a(typ: any) {
    return {arrayItems: typ};
}

function u(...typs: any[]) {
    return {unionMembers: typs};
}

function o(props: any[], additional: any) {
    return {props, additional};
}

function m(additional: any) {
    return {props: [], additional};
}

function r(name: string) {
    return {ref: name};
}

const typeMap: any = {
    "TicketDetail": o([
        {json: "id", js: "id", typ: ""},
        {json: "row", js: "row", typ: 0},
        {json: "col", js: "col", typ: 0},
        {json: "orderTime", js: "orderTime", typ: Date},
        {json: "state", js: "state", typ: 0},
        {json: "draw", js: "draw", typ: 0},
        {json: "price", js: "price", typ: 0},
        {json: "customerId", js: "customerId", typ: ""},
        {json: "movieId", js: "movieId", typ: ""},
        {json: "hallId", js: "hallId", typ: ""},
        {json: "startTime", js: "startTime", typ: Date},
        {json: "cinemaId", js: "cinemaId", typ: ""},
        {json: "sessionAt", js: "sessionAt", typ: r("SessionAt")},
        {json: "buyer", js: "buyer", typ: r("Buyer")},
    ], false),
    "Buyer": o([
        {json: "customerId", js: "customerId", typ: ""},
        {json: "name", js: "name", typ: ""},
        {json: "password", js: "password", typ: ""},
        {json: "email", js: "email", typ: ""},
        {json: "avatarUrl", js: "avatarUrl", typ: ""},
        {json: "vip", js: "vip", typ: r("Vip")},
    ], false),
    "Vip": o([
        {json: "customerId", js: "customerId", typ: ""},
        {json: "endDate", js: "endDate", typ: Date},
    ], false),
    "SessionAt": o([
        {json: "movieId", js: "movieId", typ: ""},
        {json: "cinemaId", js: "cinemaId", typ: ""},
        {json: "hallId", js: "hallId", typ: ""},
        {json: "startTime", js: "startTime", typ: Date},
        {json: "attendence", js: "attendence", typ: 0},
        {json: "price", js: "price", typ: 0},
        {json: "language", js: "language", typ: ""},
        {json: "dimesion", js: "dimesion", typ: ""},
        {json: "hallLocatedAt", js: "hallLocatedAt", typ: r("HallLocatedAt")},
    ], false),
    "HallLocatedAt": o([
        {json: "id", js: "id", typ: ""},
        {json: "cinemaId", js: "cinemaId", typ: ""},
        {json: "hallType", js: "hallType", typ: ""},
        {json: "seat", js: "seat", typ: r("Seat")},
        {json: "cinemaBelongTo", js: "cinemaBelongTo", typ: r("CinemaBelongTo")},
    ], false),
    "CinemaBelongTo": o([
        {json: "cinemaId", js: "cinemaId", typ: ""},
        {json: "location", js: "location", typ: ""},
        {json: "name", js: "name", typ: ""},
        {json: "managerId", js: "managerId", typ: ""},
        {json: "cinemaImageUrl", js: "cinemaImageUrl", typ: ""},
        {json: "feature", js: "feature", typ: ""},
        {json: "manager", js: "manager", typ: r("Manager")},
    ], false),
    "Manager": o([
        {json: "id", js: "id", typ: ""},
        {json: "name", js: "name", typ: ""},
        {json: "password", js: "password", typ: ""},
        {json: "email", js: "email", typ: ""},
        {json: "avatarUrl", js: "avatarUrl", typ: ""},
    ], false),
    "Seat": o([
        {json: "rows", js: "rows", typ: 0},
        {json: "cols", js: "cols", typ: a(0)},
    ], false),
};
