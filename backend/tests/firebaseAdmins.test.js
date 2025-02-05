const admin = require('firebase-admin');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  credential: applicationDefault()
});

test('should initialize Firebase Admin', () => {
  expect(admin.apps.length).toBeGreaterThan(0);
});

test('should get Firestore instance', () => {
  const db = getFirestore();
  expect(db).toBeDefined();
});