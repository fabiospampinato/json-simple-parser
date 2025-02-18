
/* IMPORT */

import type {JSONArray, JSONObject, JSONValue} from './types';

/* CONSTANTS */

const numberRe = /-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?/gy;
const stringStopCharRe = /\\|"|\r|\n/g;

/* STATE */

let $I = 0;
let $L = 0;
let $INPUT = '';
let $CODE = 0;

/* HELPERS */

const throwUnexpectedEnd = (): never => {

  throw new SyntaxError ( 'Unexpected end of input' );

};

const throwUnexpectedToken = (): never => {

  throw new SyntaxError ( `Invalid or unexpected token ${$INPUT[$I]} at index ${$I}` );

};

// This function was largely written by chatGPT, sparing the human some pain, how nice
// This is pure-JS version of the "findNumberEndIndex_regex" function
const findNumberEndIndex_pure = (): number => {
  let i = $I;
  let l = $L;
  let str = $INPUT;

  // Optional sign: /-?/
  if ( i < l && str.charCodeAt ( i ) === 45 ) { // -
    i += 1;
  }

  // Premature end
  if ( i >= l ) return -1;

  // Integer digits: /0|[1-9][0-9]*/
  if ( str.charCodeAt ( i ) === 48 ) { // 0
    i += 1;
  } else { // 1~9
    let found = 0;
    while ( i < l ) { // 0~9
      $CODE = str.charCodeAt ( i );
      if ( $CODE >= 48 && $CODE <= 57 ) {
        i += 1;
        found += 1;
      } else {
        break;
      }
    }
    // Must have at least one digit
    if ( found === 0 ) return -1;
  }

  // Optional fractional part: /(\.[0-9]+)?/
  if ( i < l && str.charCodeAt ( i ) === 46 ) { // .
    i += 1;
    let found = 0;
    while ( i < l ) {
      $CODE = str.charCodeAt ( i );
      if ( $CODE >= 48 && $CODE <= 57 ) { // 0~9
        i += 1;
        found += 1;
      } else {
        break;
      }
    }
    // Must have at least one digit
    if ( found === 0 ) return -1;
  }

  // Optional exponent part: /([eE][-+]?[0-9]+)?/
  if ( i < l && ( str.charCodeAt ( i ) === 101 || str.charCodeAt ( i ) === 69 ) ) { // e, E
    i += 1;
    // Optional exponent sign.
    if ( i < l && ( str.charCodeAt ( i ) === 43 || str.charCodeAt ( i ) === 45 ) ) { // +, -
      i += 1;
    }
    let found = 0;
    while ( i < l ) {
      $CODE = str.charCodeAt ( i );
      if ( $CODE >= 48 && $CODE <= 57 ) { // 0~9
        i += 1;
        found += 1;
      } else {
        break;
      }
    }
    // Must have at least one digit
    if ( found === 0 ) return -1;
  }

  return i;
};

const findNumberEndIndex_regex = (): number => {

  numberRe.lastIndex = $I;

  const matched = numberRe.test ( $INPUT );

  if ( !matched ) return -1;

  return numberRe.lastIndex;

};

// This is a pure-JS version of the "findStringStopCharIndex_regex" function
const findStringStopCharIndex_pure = (): number => {

  while ( $I < $L ) {

    $CODE = $INPUT.charCodeAt ( $I );

    if ( $CODE === 34 || $CODE === 92 || $CODE === 10 || $CODE === 13 ) return $I; // ", \, \n, \r

    $I += 1;

  }

  return throwUnexpectedEnd ();

};

const findStringStopCharIndex_regex = (): number => {

  stringStopCharRe.lastIndex = $I;

  const matched = stringStopCharRe.test ( $INPUT );

  if( !matched ) return throwUnexpectedEnd ();

  return stringStopCharRe.lastIndex - 1;

};

const skipWhitespace = (): void => {

  while ( $I < $L ) {

    $CODE = $INPUT.charCodeAt ( $I );

    if ( $CODE !== 32 && $CODE !== 10 && $CODE !== 13 && $CODE !== 9 ) break; // space, \n, \r, \t

    $I += 1;

  }

};

const getNull = (): null => {

  if ( $INPUT.startsWith ( 'ull', $I + 1 ) ) {

    $I += 4;

    return null;

  }

  return throwUnexpectedToken ();

};

const getTrue = (): true => {

  if ( $INPUT.startsWith ( 'rue', $I + 1 ) ) {

    $I += 4;

    return true;

  }

  return throwUnexpectedToken ();

};

const getFalse = (): false => {

  if ( $INPUT.startsWith ( 'alse', $I + 1 ) ) {

    $I += 5;

    return false;

  }

  return throwUnexpectedToken ();

};

const getNumber = (): number => {

  const indexEnd = findNumberEndIndex_regex ();

  if ( indexEnd > 0 ) {

    const number = parseFloat ( $INPUT.slice ( $I, indexEnd ) );

    $I = indexEnd;

    return number;

  }

  return throwUnexpectedToken ();

};

const getString = (): string => {

  $I += 1;

  let string = '';

  while ( $I < $L ) {

    const indexStart = $I;
    const indexEnd = findStringStopCharIndex_regex ();

    $I = indexEnd + 1;

    $CODE = $INPUT.charCodeAt ( indexEnd );

    if ( $CODE === 10 || $CODE === 13 ) { // \n, \r

      return throwUnexpectedToken ();

    } else if ( $CODE === 34 ) { // "

      string += $INPUT.slice ( indexStart, indexEnd );

      return string;

    } else { // \

      string += $INPUT.slice ( indexStart, indexEnd );
      string += getStringEscapeSequence ();

    }

  }

  return throwUnexpectedEnd ();

};

const getStringEscapeSequence = (): string => {
  $I += 1;
  switch ( $INPUT.charCodeAt ( $I - 1 ) ) {
    case 34: // "
      return '"';
    case 92: // \
      return '\\';
    case 47: // /
      return '/';
    case 98: // b
      return '\b';
    case 102: // f
      return '\f';
    case 110: // n
      return '\n';
    case 114: // r
      return '\r';
    case 116: // t
      return '\t';
    case 117: { // u
      //TODO: check that they are actually hex digits
      const hex = $INPUT.slice ( $I, $I + 4);
      if ( hex.length !== 4 ) return throwUnexpectedEnd ();
      const int = parseInt ( hex, 16 );
      if ( isNaN ( int ) ) return throwUnexpectedToken ();
      $I += 4;
      return String.fromCharCode ( int );
    }
    default:
      return throwUnexpectedToken ();
  }
};

const getArray = (): JSONArray => {

  $I += 1;

  const array: JSONArray = [];

  while ( true ) {

    const value = getValue ();

    if ( value !== undefined ) {

      skipWhitespace ();

      array.push ( value );

    } else {

      $CODE = $INPUT.charCodeAt ( $I );

      if ( $CODE === 44 ) { // ,

        $I += 1;

      } else {

        break;

      }

    }

  }

  if ( $INPUT.charCodeAt ( $I ) === 93 ) { // ]

    $I += 1;

    return array;

  }

  return throwUnexpectedToken ();

};

const getObject = (): JSONObject => {

  $I += 1;

  const object: JSONObject = {};

  while ( true ) {

    const key = getValue ();

    if ( key === undefined ) break;

    if ( typeof key === 'string' ) {

      skipWhitespace ();

      if ( $INPUT.charCodeAt ( $I ) === 58 ) { // :

        $I += 1;

        const value = getValue ();

        if ( value !== undefined ) {

          object[key] = value;

          skipWhitespace ();

          if ( $INPUT.charCodeAt ( $I ) === 44 ) { // ,

            $I += 1;

            continue;

          } else {

            break;

          }

        }

      }

    }

    return throwUnexpectedToken ();

  }

  if ( $INPUT.charCodeAt ( $I ) === 125 ) { // }

    $I += 1;

    return object;

  }

  return throwUnexpectedToken ();

};

const getValue = (): JSONValue | void => {
  while ( $I < $L ) {
    switch ( $CODE = $INPUT.charCodeAt ( $I ) ) {
      case 32: // space
      case 10: // \n
      case 13: // \r
      case 9: { // \t
        $I += 1;
        continue;
      }
      case 110: // n
        return getNull ();
      case 116: // t
        return getTrue ();
      case 102: // f
        return getFalse ();
      case 34: // "
        return getString ();
      case 91: // [
        return getArray ();
      case 123: // {
        return getObject ();
      case 45: // -
      case 48: // 0
      case 49: // 1
      case 50: // 2
      case 51: // 3
      case 52: // 4
      case 53: // 5
      case 54: // 6
      case 55: // 7
      case 56: // 8
      case 57: // 9
        return getNumber ();
      default:
        return;
    }
  }
};

/* MAIN */

const parse = ( input: string ): JSONValue => {

  $I = 0;
  $L = input.length;
  $INPUT = input;

  try {

    const value = getValue ();

    skipWhitespace ();

    if ( value !== undefined && $I === $L ) {

      return value;

    } else {

      return throwUnexpectedToken ();

    }

  } finally {

    $I = 0;
    $L = 0;
    $INPUT = '';

  }

};

/* EXPORT */

export default parse;
export type {JSONValue};
