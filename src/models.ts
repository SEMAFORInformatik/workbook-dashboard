// Clone function. Is here because it is used do clone objects.
export const clone = (object: any) => { return JSON.parse(JSON.stringify(object)); }

// Compare two arrays.
// The field parameter is optional and is used to compare a field in an object array
export const isSame = (a: any, b: any, field?: string) => {
  return (a.length === b.length && a.every((c: any, i: number) => {
    if (field) {
      return c[field] === b[i][field];
    }
    return c === b[i];
  }))
}

// Generic Comparing function to compare 2 string fields of the specified name
export const sortBy = (field: string) => {
  return (a: any, b: any) => {
    // If a field is null it should still be able to compare
    return (a[field] || "").localeCompare(b[field] || "");
  }
}
export const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface CustomWindow extends Window{
    _env_: any;
}

export interface Group {
  name: string;
}

export interface Role {
  name: string;
}

export interface User {
  username: string;
  firstName: string;
  lastName: string;
  password: string;

  role: Role[];
  groups: Group[];
  activeGroup: Group;

  enabled: boolean;
}

export interface propertyType {
  name: string;
  type: string;
  unit?: string;
}

export interface reference {
  name: string;
  type: string;
}

export interface Type {
  name: string;
  id: number;
  propertyTypes: propertyType[];
  references: reference[];
}

export interface Component {
  owner: string;
  rev: string;
  ownername: string;
  approval: string;
  name: string;
  id: number;
  version: number;
  group: string;
  created: Date;
}

export interface Project {
  id: number;
  name: string;
  owner: string;
  ownername: string;
  version: number;
  group: string;
  created: Date;
  desc: string;
  status: string;
}

export interface Variant {
  owner: string;
  ownername: string;
  created: Date;
  approval: string;
  name: string;
  id: number;
  version: number;
  group: string;
}

export interface Logger {
  name: string
  configuredLevel: string;
  effectiveLevel: string;
}

export interface LoggerList {
  levels : string[];
  loggers: Logger[]
}

export interface LiquibaseChangeSet {
  id: string,
  deploymentId: string,
  author: string,
  description: string,
  execType: string,
  changeLog: string,
  dateExecuted: string,
  comments: string,
  tag: string,
  contexts: string[],
  labels: string[],
  checksum: string,
  orderExecuted: number
}