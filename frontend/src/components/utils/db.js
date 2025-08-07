import { openDB } from "idb";

// Helper function to sanitize email for DB naming
const sanitizeEmail = (email) => {
  if (!email) return "default";
  return email.toLowerCase().replace(/[@.]/g, "_");
};

// Initialize user-specific DB
export const initDB = async (userEmail) => {
  const dbName = `fileSystemDB_${sanitizeEmail(userEmail)}`;

  return await openDB(dbName, 3, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains("files")) {
        const store = db.createObjectStore("files", { keyPath: "id" });
        store.createIndex("owner", "owner", { unique: false });
      }
      if (!db.objectStoreNames.contains("deletedFiles")) {
        const store = db.createObjectStore("deletedFiles", { keyPath: "id" });
        store.createIndex("owner", "owner", { unique: false });
      }
    },
  });
};

// ========== FILES STORE FUNCTIONS ==========

export const saveFile = async (userEmail, file) => {
  const db = await initDB(userEmail);
  try {
    await db.put("files", file);
    return true;
  } catch (error) {
    console.error("Error saving file:", error);
    return false;
  }
};

export const saveFilesBulk = async (userEmail, files) => {
  const db = await initDB(userEmail);
  const tx = db.transaction("files", "readwrite");
  try {
    for (const file of files) {
      await tx.store.put(file);
    }
    await tx.done;
    return true;
  } catch (error) {
    console.error("Error saving files in bulk:", error);
    return false;
  }
};

export const getUserFiles = async (userEmail) => {
  const db = await initDB(userEmail);
  try {
    return (await db.getAll("files")).filter(
      (item) => item.owner === userEmail
    );
  } catch (error) {
    console.error("Error getting files:", error);
    return [];
  }
};

// export const getUserFiles = async (userEmail) => {
//   const db = await initDB(userEmail);
//   try {
//     const allFiles = await db.getAll("files");
//     const deletedFiles = await db.getAll("deletedFiles");
//     const deletedIds = new Set(deletedFiles.map((file) => file.id));

//     return allFiles.filter(
//       (item) => item.owner === userEmail && !deletedIds.has(item.id)
//     );
//   } catch (error) {
//     console.error("Error getting files:", error);
//     return [];
//   }
// };

export const getFileById = async (userEmail, id) => {
  const db = await initDB(userEmail);
  try {
    return await db.get("files", id);
  } catch (error) {
    console.error("Error getting file by ID:", error);
    return null;
  }
};

export const deleteFileById = async (userEmail, id) => {
  const db = await initDB(userEmail);
  try {
    await db.delete("files", id);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

export const clearFiles = async (userEmail) => {
  const db = await initDB(userEmail);
  try {
    await db.clear("files");
    return true;
  } catch (error) {
    console.error("Error clearing files:", error);
    return false;
  }
};

// ========== DELETED FILES STORE FUNCTIONS ==========

export const saveDeletedFile = async (userEmail, file) => {
  const db = await initDB(userEmail);
  try {
    await db.put("deletedFiles", file);
    return true;
  } catch (error) {
    console.error("Error saving deleted file:", error);
    return false;
  }
};

export const saveDeletedFilesBulk = async (userEmail, files) => {
  const db = await initDB(userEmail);
  const tx = db.transaction("deletedFiles", "readwrite");
  try {
    for (const file of files) {
      await tx.store.put(file);
    }
    await tx.done;
    return true;
  } catch (error) {
    console.error("Error saving deleted files in bulk:", error);
    return false;
  }
};

export const getUserDeletedFiles = async (userEmail) => {
  const db = await initDB(userEmail);
  try {
    return (await db.getAll("deletedFiles")).filter(
      (item) => item.owner === userEmail
    );
  } catch (error) {
    console.error("Error getting deleted files:", error);
    return [];
  }
};

export const getDeletedFileById = async (userEmail, id) => {
  const db = await initDB(userEmail);
  try {
    return await db.get("deletedFiles", id);
  } catch (error) {
    console.error("Error getting deleted file by ID:", error);
    return null;
  }
};

export const deleteDeletedFileById = async (userEmail, id) => {
  const db = await initDB(userEmail);
  try {
    await db.delete("deletedFiles", id);
    return true;
  } catch (error) {
    console.error("Error deleting deleted file:", error);
    return false;
  }
};

export const clearDeletedFiles = async (userEmail) => {
  const db = await initDB(userEmail);
  try {
    await db.clear("deletedFiles");
    return true;
  } catch (error) {
    console.error("Error clearing deleted files:", error);
    return false;
  }
};

// ========== USER MANAGEMENT FUNCTIONS ==========

export const getUserDBList = async () => {
  try {
    const databases = await indexedDB.databases();
    return databases
      .filter((db) => db.name && db.name.startsWith("fileSystemDB_"))
      .map((db) => db.name.replace("fileSystemDB_", ""));
  } catch (error) {
    console.error("Error listing user databases:", error);
    return [];
  }
};

export const migrateUserData = async (fromEmail, toEmail, options = {}) => {
  if (!fromEmail || !toEmail || fromEmail === toEmail) {
    throw new Error("Invalid email parameters for migration");
  }

  try {
    const fromDb = await openDB(`fileSystemDB_${sanitizeEmail(fromEmail)}`, 3);
    const toDb = await openDB(`fileSystemDB_${sanitizeEmail(toEmail)}`, 3);

    const migrateStore = async (storeName) => {
      const items = await fromDb.getAll(storeName);
      const tx = toDb.transaction(storeName, "readwrite");

      for (const item of items) {
        if (!options.overwrite) {
          const exists = await tx.store.get(item.id);
          if (exists) continue;
        }
        await tx.store.put(item);
      }

      await tx.done;
      return items.length;
    };

    const filesMigrated = await migrateStore("files");
    const deletedMigrated = options.skipDeleted
      ? 0
      : await migrateStore("deletedFiles");

    return {
      success: true,
      stats: {
        files: filesMigrated,
        deletedFiles: deletedMigrated,
      },
    };
  } catch (error) {
    console.error("Migration failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ========== UTILITY FUNCTIONS ==========

export const purgeAllData = async () => {
  try {
    const dbs = await getUserDBList();
    for (const dbName of dbs) {
      const db = await openDB(`fileSystemDB_${dbName}`, 3);
      await db.clear("files");
      await db.clear("deletedFiles");
    }
    return true;
  } catch (error) {
    console.error("Error purging all data:", error);
    return false;
  }
};
