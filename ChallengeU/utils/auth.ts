let loggedIn = false;

export function isAuthenticated() {
  return loggedIn;
}

export function authenticate() {
  loggedIn = true;
}

export function signOut() {
  loggedIn = false;
}
