/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const __ = (variable: any) => {
  if (variable === null) {
    return "null";
  }
  if (variable === undefined) {
    return "undefined";
  }
  if (typeof variable === "string") {
    return variable;
  }
  if (typeof variable === "number") {
    return String(variable);
  }
  if (typeof variable === "boolean") {
    return String(variable);
  }
  if (typeof variable === "object") {
    try {
      return JSON.stringify(variable);
    } catch (e: any) {
      return "[Object with circular reference]";
    }
  }
  if (typeof variable === "function") {
    return variable.toString();
  }
  if (typeof variable === "symbol") {
    return String(variable);
  }
  return String(variable);
};
