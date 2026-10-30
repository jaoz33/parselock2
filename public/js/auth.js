import { signUp, signIn, signInWithGoogle, signOut, getUser, getSession, onAuthStateChange } from './supabase.js';

export async function doSignUp(email, password) {
  return signUp(email, password);
}

export async function doSignIn(email, password) {
  return signIn(email, password);
}

export async function doGoogleSignIn() {
  return signInWithGoogle();
}

export async function doSignOut() {
  return signOut();
}

export async function currentUser() {
  return getUser();
}

export async function currentSession() {
  return getSession();
}

export function watchAuth(callback) {
  return onAuthStateChange(callback);
}
