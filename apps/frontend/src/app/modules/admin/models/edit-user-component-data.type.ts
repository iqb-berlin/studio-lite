export type EditUserComponentData = {
  newUser: boolean,
  name?: string,
  password?: string,
  description?: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  isAdmin: boolean,
  emailApproved: boolean,
  // the logged-in administrator's own account, whose administrator right they cannot take away (#1950)
  isOwnAccount?: boolean
};
