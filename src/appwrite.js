import { Client, Databases, ID, Query } from "appwrite";
// Appwrite configuration
const appWriteConfig = {
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  projectEndpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  collectionId: import.meta.env.VITE_APPWRITE_COLLECTION_ID,
};
// client of appwrite sdk
const client = new Client()
  .setEndpoint(appWriteConfig.projectEndpoint)
  .setProject(appWriteConfig.projectId);

// access database service
const databases = new Databases(client);
// 🟩🟩🟩 function to update the search count 🟩🟩🟩
export const updateSearchCount = async (searchTerm, movie) => {
  // 1. User Appwrite SDK to check if the search term exists in the database
  try {
    const result = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.collectionId,
      [Query.equal("searchTerm", searchTerm)],
    );
    // 2. If it exists, increment the count
    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await databases.updateDocument(
        appWriteConfig.databaseId,
        appWriteConfig.collectionId,
        doc.$id,
        {
          count: doc.count + 1,
        },
      );
    }
    // 3. If it doesn't exist, create a new record with count = 1
    else {
      await databases.createDocument(
        appWriteConfig.databaseId,
        appWriteConfig.collectionId,
        ID.unique(),
        {
          searchTerm,
          count: 1,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        },
      );
    }
  } catch (error) {
    console.error("Appwrite service error:", error.message); // This will tell you if it's a 401 (Permissions) or 404 (ID error)
    console.log("Full error object:", error);
  }
};

// 🟠🟠🟠🟠 function to get the trending list of movies 🟠🟠🟠🟠🟠
export const getTrendingListOfMovies = async () => {
  try {
    const result = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.collectionId,
      [Query.orderDesc("count"), Query.limit(5)],
    );
    return result.documents;
  } catch (error) {
    console.error("Appwrite service error:", error.message); // This will tell you if it's a 401 (Permissions) or 404 (ID error)
    console.log("Full error object:", error);
  }
};
