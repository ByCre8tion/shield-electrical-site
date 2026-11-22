/* Firebase settings for the photo edit mode. These values are public by design: they identify
   the project, they are not passwords. Access is enforced by firestore.rules (only editors write). */
export const firebaseConfig = {
  apiKey: '',            // TODO: paste from Firebase console > Project settings > Your apps
  appId: '',             // TODO: paste from the same place
  projectId: 'shield-electrical-az',
  messagingSenderId: '284129201238',
};
/* Google accounts allowed to edit photos. Keep in sync with firestore.rules. */
export const editors = ['contact@bycre8tive.com'];
