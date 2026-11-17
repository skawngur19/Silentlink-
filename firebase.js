/* Firebase web configuration and client-side services. */
const firebaseConfig = {
  apiKey: "AIzaSyCD62__c-pmP0l-lft9zeNKWzZi7AsNKtI",
  authDomain: "silentlink-dfd40.firebaseapp.com",
  projectId: "silentlink-dfd40",
  storageBucket: "silentlink-dfd40.firebasestorage.app",
  messagingSenderId: "83807994563",
  appId: "1:83807994563:web:0c7820253df05e555a5876",
};

if (!window.firebase) {
  window.firebaseServiceError = new Error("Firebase SDK failed to load. Check your internet connection and reload.");
} else {
  firebase.initializeApp(firebaseConfig);

  const auth = firebase.auth();
  const db = firebase.firestore();
  const signIds = new Set(SIGNS.map((sign) => sign.id));

  async function loadProfile(user) {
    const snapshot = await db.collection("users").doc(user.uid).get();
    if (!snapshot.exists) {
      const error = new Error("Your account is missing its SilentLink role profile.");
      error.code = "profile/not-found";
      throw error;
    }

    const profile = snapshot.data();
    if (!["teacher", "learner", "consultant"].includes(profile.role)) {
      const error = new Error("Your SilentLink role profile is invalid.");
      error.code = "profile/invalid";
      throw error;
    }
    return profile;
  }

  async function loadSigns(role) {
    const collection = db.collection("signs");
    let snapshot = await collection.get();

    if (snapshot.empty && role === "teacher") {
      const batch = db.batch();
      SIGNS.forEach((sign) => {
        batch.set(collection.doc(sign.id), sign);
      });
      await batch.commit();
      snapshot = await collection.get();
    }

    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

  async function loadLearners(userId) {
    const snapshot = await db.collection("learners")
      .where("ownerUid", "==", userId)
      .get();
    return Promise.all(snapshot.docs.map(async (doc) => {
      const attemptsSnapshot = await doc.ref.collection("attempts")
        .orderBy("createdAt", "desc")
        .get();
      const profile = doc.data();
      return {
        id: doc.id,
        name: profile.nickname,
        grade: profile.grade,
        ownerUid: profile.ownerUid,
        createdAt: profile.createdAt,
        mastery: {},
        attempts: attemptsSnapshot.docs.map((attemptDoc) => ({
          id: attemptDoc.id,
          ...attemptDoc.data(),
        })),
        initials: profile.nickname.slice(0, 1).toUpperCase(),
        color: "#4338CA",
        bg: "#E0E7FF",
        bg2: "#C7D2FE",
      };
    }));
  }

  async function createLearner(userId, nickname, grade) {
    const normalizedNickname = nickname.trim();
    if (!normalizedNickname || normalizedNickname.length > 32) {
      throw new Error("Enter a classroom nickname between 1 and 32 characters.");
    }
    if (!["Kinder", "Grade 1", "Grade 2"].includes(grade)) {
      throw new Error("Choose a valid grade.");
    }

    const ref = db.collection("learners").doc();
    const profile = {
      nickname: normalizedNickname,
      grade,
      ownerUid: userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    await ref.set(profile);
    return {
      id: ref.id,
      name: normalizedNickname,
      grade,
      ownerUid: userId,
      mastery: {},
      attempts: [],
      initials: normalizedNickname.slice(0, 1).toUpperCase(),
      color: "#4338CA",
      bg: "#E0E7FF",
      bg2: "#C7D2FE",
    };
  }

  window.firebaseService = {
    auth,
    db,
    onAuthStateChanged(callback) {
      return auth.onAuthStateChanged(callback);
    },
    async signIn(email, password) {
      return auth.signInWithEmailAndPassword(email, password);
    },
    async signOut() {
      return auth.signOut();
    },
    loadProfile,
    loadSigns,
    loadLearners,
    createLearner,
    async saveSign(sign) {
      if (!signIds.has(sign.id)) throw new Error("This sign cannot be saved to the reference catalog.");
      await db.collection("signs").doc(sign.id).set(sign, { merge: true });
    },
  };
}
