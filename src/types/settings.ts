export enum AccessOptions {
  ALL = 1,
  NOBODY = 2,
  MY_CONTACTS = 3,
}

export type Setting = {
  chatInvites: AccessOptions;
  messageForward: AccessOptions;
  phoneVisibility: AccessOptions;
};
