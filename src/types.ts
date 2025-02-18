
/* MAIN */

type JSONPrimitive = null | true | false | number | string;
type JSONArray = Array<JSONValue>;
type JSONObject = { [key: string]: JSONValue };
type JSONValue = JSONPrimitive | JSONArray | JSONObject;

/* EXPORT */

export type {JSONPrimitive, JSONArray, JSONObject, JSONValue};
