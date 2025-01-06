import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

let client: Client;
let account: Account;
let databases: Databases;
let storage: Storage;
let isInitialized = false;

const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID as string;

const initializeAppwrite = () => {
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

  console.log('Initializing with:', { endpoint, projectId, databaseId });

  if (!endpoint) console.error('Missing NEXT_PUBLIC_ENDPOINT');
  if (!projectId) console.error('Missing NEXT_PUBLIC_PROJECT_ID');
  if (!databaseId) console.error('Missing NEXT_PUBLIC_DATABASE_ID');

  if (!endpoint || !projectId || !databaseId) {
    console.error('Appwrite configuration is incomplete. Please check your environment variables.');
    return false;
  }

  try {
    client = new Client();
    client.setEndpoint(endpoint).setProject(projectId);

    account = new Account(client);
    databases = new Databases(client);
    storage = new Storage(client);

    isInitialized = true;
    console.log('Appwrite client initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Appwrite client:', error);
    return false;
  }
};

const ensureInitialized = () => {
  if (!isInitialized) {
    const initialized = initializeAppwrite();
    if (!initialized) {
      throw new Error('Appwrite client is not properly initialized');
    }
  }
};

export const appwriteService = {
  // Authentication
  loginWithGoogle: async () => {
    ensureInitialized();
    try {
      const googleAuthUrl = account.createOAuth2Session('google', 'http://localhost:3000/auth-callback');
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('Appwrite service error: loginWithGoogle', error);
      throw error;
    }
  },

  handleAuthCallback: async () => {
    ensureInitialized();
    try {
      const user = await account.get();
      const profile = await appwriteService.getProfile(user.$id);
      
      if (!profile) {
        // Create a new profile if it doesn't exist
        await appwriteService.createProfile(user.$id, user.name, '');
      }
      
      return user;
    } catch (error) {
      console.error('Appwrite service error: handleAuthCallback', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    ensureInitialized();
    try {
      return await account.get();
    } catch (error) {
      console.error('Appwrite service error: getCurrentUser', error);
      return null;
    }
  },

  logout: async () => {
    ensureInitialized();
    try {
      return await account.deleteSession('current');
    } catch (error) {
      console.error('Appwrite service error: logout', error);
      throw error;
    }
  },

  // Profile Collection
  createProfile: async (userId: string, name: string, image: string = '') => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE as string;
      return await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        { user_id: userId, name, image }
      );
    } catch (error) {
      console.error('Appwrite service error: createProfile', error);
      throw error;
    }
  },

  getProfile: async (userId: string) => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE as string;
      const response = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('user_id', userId)]
      );
      return response.documents[0];
    } catch (error) {
      console.error('Appwrite service error: getProfile', error);
      throw error;
    }
  },

  updateProfile: async (profileId: string, data: { name?: string, image?: string }) => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE as string;
      return await databases.updateDocument(
        databaseId,
        collectionId,
        profileId,
        data
      );
    } catch (error) {
      console.error('Appwrite service error: updateProfile', error);
      throw error;
    }
  },

  // Post Collection
  createPost: async (userId: string, videoUrl: string, caption: string) => {
    ensureInitialized();
    try {
      console.log('Creating post with:', { userId, videoUrl, caption });
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_POST as string;
      const response = await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        { user_id: userId, video_url: videoUrl, text: caption, created_at: new Date().toISOString() }
      );
      console.log('Post created successfully. Response:', response);
      return response;
    } catch (error) {
      console.error('Appwrite service error: createPost', error);
      throw error;
    }
  },

  getPosts: async (limit: number = 10) => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_POST as string;
      const response = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.orderDesc('created_at'), Query.limit(limit)]
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite service error: getPosts', error);
      throw error;
    }
  },

  deletePost: async (postId: string) => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_POST as string;
      await databases.deleteDocument(databaseId, collectionId, postId);
    } catch (error) {
      console.error('Appwrite service error: deletePost', error);
      throw error;
    }
  },

  updatePost: async (postId: string, data: { text?: string }) => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_POST as string;
      return await databases.updateDocument(
        databaseId,
        collectionId,
        postId,
        data
      );
    } catch (error) {
      console.error('Appwrite service error: updatePost', error);
      throw error;
    }
  },

  // Comment Collection
  createComment: async (userId: string, postId: string, text: string) => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_COMMENT as string;
      return await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        { user_id: userId, post_id: postId, text, created_at: new Date().toISOString() }
      );
    } catch (error) {
      console.error('Appwrite service error: createComment', error);
      throw error;
    }
  },

  getComments: async (postId: string) => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_COMMENT as string;
      const response = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('post_id', postId), Query.orderDesc('created_at')]
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite service error: getComments', error);
      throw error;
    }
  },

  deleteComment: async (commentId: string) => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_COMMENT as string;
      await databases.deleteDocument(databaseId, collectionId, commentId);
    } catch (error) {
      console.error('Appwrite service error: deleteComment', error);
      throw error;
    }
  },

  // File Upload
  uploadFile: async (file: File) => {
    ensureInitialized();
    try {
      console.log('Uploading file:', file.name);
      const response = await storage.createFile(
        process.env.NEXT_PUBLIC_BUCKET_ID as string,
        ID.unique(),
        file
      );
      console.log('File uploaded successfully. Response:', response);
      return response.$id;
    } catch (error) {
      console.error('Appwrite service error: uploadFile', error);
      throw error;
    }
  },

  deleteFile: async (fileId: string) => {
    ensureInitialized();
    try {
      await storage.deleteFile(
        process.env.NEXT_PUBLIC_BUCKET_ID as string,
        fileId
      );
    } catch (error) {
      console.error('Appwrite service error: deleteFile', error);
      throw error;
    }
  },

  getFilePreview: (fileId: string) => {
    ensureInitialized();
    return storage.getFilePreview(
      process.env.NEXT_PUBLIC_BUCKET_ID as string,
      fileId
    );
  },

  getFileView: (fileId: string) => {
    ensureInitialized();
    console.log('Getting file view for file ID:', fileId);
    const url = storage.getFileView(
      process.env.NEXT_PUBLIC_BUCKET_ID as string,
      fileId
    );
    console.log('File view URL:', url.toString());
    return url.toString(); // Return the URL as a string
  },
};

export { client, account, databases, storage };























