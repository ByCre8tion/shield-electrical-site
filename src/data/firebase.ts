/* Firebase settings for the photo edit mode. These values are public by design: they identify
   the project, they are not passwords. Access is enforced by firestore.rules (only editors write). */
export const firebaseConfig = {
  apiKey: 'AIzaSyCUPsvT0uZ-b6HzGT_V3eRngf4cdTm5bpk',
  appId: '1:284129201238:web:d1b674557b82efc96f3ff7',
  projectId: 'shield-electrical-az',
  messagingSenderId: '284129201238',
};
/* Google accounts allowed to edit photos. Keep in sync with firestore.rules. */
export const editors = ['contact@bycre8tive.com'];
