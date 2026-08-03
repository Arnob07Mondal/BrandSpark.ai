const admin = require("firebase-admin");

// Configure the SDK to connect to the local Firestore emulator
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";

admin.initializeApp({
  projectId: "brandspark-d7323"
});

const db = admin.firestore();

async function checkProjects() {
  console.log("Checking Firestore Emulator projects collection...");
  try {
    const snapshot = await db.collection("projects").get();
    console.log(`Found ${snapshot.size} projects in local Firestore Emulator.`);
    snapshot.forEach(doc => {
      console.log(`- Project ID: ${doc.id}`);
      console.log("  Data:", JSON.stringify(doc.data(), null, 2));
    });
  } catch (error) {
    console.error("Error checking Firestore Emulator:", error);
  }
}

checkProjects();
