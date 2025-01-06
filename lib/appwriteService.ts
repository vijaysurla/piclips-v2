import { Client, Account, Databases, Storage, ID, Query, Models, OAuthProvider } from 'appwrite';

let client: Client;
let account: Account;
let databases: Databases;
let storage: Storage;
let isInitialized = false;

const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID as string;

const initializeAppwrite = () => {
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

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
    return true;
  } catch (error) {
    console.error('Failed to initialize Appwrite client:', error);
    return false;
  }
};

const ensureInitialized = () => {
  if (typeof window === 'undefined') return; // Skip initialization on server-side
  if (!isInitialized) {
    const initialized = initializeAppwrite();
    if (!initialized) {
      throw new Error('Appwrite client is not properly initialized');
    }
  }
};

export interface Post extends Models.Document {
  user_id: string;
  video_url: string;
  text: string;
    created_at: string;
}

export interface Profile extends Models.Document {
  user_id: string;
  name: string;
  image: string;
}

export interface Like extends Models.Document {
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment extends Models.Document {
  user_id: string;
  post_id: string;
  text: string;
  created_at: string;
}

export const appwriteService = {
  loginWithGoogle: async () => {
    ensureInitialized();
    try {
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth-callback`;
      console.log('Initiating Google login with callback URL:', callbackUrl);
      await account.createOAuth2Session(
        OAuthProvider.Google,
        callbackUrl,
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/failure`
      );
    } catch (error) {
      console.error('Appwrite service error: loginWithGoogle', error);
      throw error;
    }
  },

  handleAuthCallback: async () => {
    ensureInitialized();
    try {
      console.log('Handling auth callback');
      const user = await account.get();
      console.log('User authenticated:', user);
      
      const profile = await appwriteService.getProfile(user.$id);
      
      if (!profile) {
        console.log('Creating new profile for user:', user.$id);
        await appwriteService.createProfile(user.$id, user.name, '');
      } else {
        console.log('Existing profile found for user:', user.$id);
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
  createProfile: async (userId: string, name: string, image: string = ''): Promise<Profile> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE as string;
      return await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        { user_id: userId, name, image: image || process.env.NEXT_PUBLIC_PLACEHOLDER_DEAFULT_IMAGE_ID }
      );
    } catch (error) {
      console.error('Appwrite service error: createProfile', error);
      throw error;
    }
  },

  getProfile: async (userId: string): Promise<Profile | null> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE as string;
      const response = await databases.listDocuments<Profile>(
        databaseId,
        collectionId,
        [Query.equal('user_id', userId)]
      );
      return response.documents[0] || null;
    } catch (error) {
      console.error('Appwrite service error: getProfile', error);
      throw error;
    }
  },

  updateProfile: async (profileId: string, data: Partial<Profile>): Promise<Profile> => {
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
  createPost: async (userId: string, videoUrl: string, caption: string): Promise<Post> => {
    ensureInitialized();
    try {
      // First get the user's profile to include their name
      const userProfile = await appwriteService.getProfile(userId);
      const userName = userProfile?.name || 'User';

      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_POST as string;
      return await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        { 
          user_id: userId,
          video_url: videoUrl,
          text: caption,
          created_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Appwrite service error: createPost', error);
      throw error;
    }
  },

  getPosts: async (limit: number = 10): Promise<Post[]> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_POST as string;
      const response = await databases.listDocuments<Post>(
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

  deletePost: async (postId: string): Promise<void> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_POST as string;
      await databases.deleteDocument(databaseId, collectionId, postId);
    } catch (error) {
      console.error('Appwrite service error: deletePost', error);
      throw error;
    }
  },

  updatePost: async (postId: string, data: Partial<Post>): Promise<Post> => {
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

  // Like Collection
  createLike: async (userId: string, postId: string): Promise<Like> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE as string;
      return await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        { user_id: userId, post_id: postId, created_at: new Date().toISOString() }
      );
    } catch (error) {
      console.error('Appwrite service error: createLike', error);
      throw error;
    }
  },

  deleteLike: async (likeId: string): Promise<void> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE as string;
      await databases.deleteDocument(databaseId, collectionId, likeId);
    } catch (error) {
      console.error('Appwrite service error: deleteLike', error);
      throw error;
    }
  },

  getLikes: async (postId: string): Promise<Like[]> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE as string;
      const response = await databases.listDocuments<Like>(
        databaseId,
        collectionId,
        [Query.equal('post_id', postId)]
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite service error: getLikes', error);
      throw error;
    }
  },

  // Comment Collection
  createComment: async (userId: string, postId: string, text: string): Promise<Comment> => {
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

  getComments: async (postId: string): Promise<Comment[]> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_COMMENT as string;
      const response = await databases.listDocuments<Comment>(
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

  deleteComment: async (commentId: string): Promise<void> => {
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
  uploadFile: async (file: File): Promise<string> => {
    ensureInitialized();
    try {
      const response = await storage.createFile(
        process.env.NEXT_PUBLIC_BUCKET_ID as string,
        ID.unique(),
        file
      );
      return response.$id;
    } catch (error) {
      console.error('Appwrite service error: uploadFile', error);
      throw error;
    }
  },

  deleteFile: async (fileId: string): Promise<void> => {
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

  getFilePreview: (fileId: string): string => {
    ensureInitialized();
    return storage.getFilePreview(
      process.env.NEXT_PUBLIC_BUCKET_ID as string,
      fileId
    ).toString();
  },

  getFileView: (fileId: string): string => {
    ensureInitialized();
    const url = storage.getFileView(
      process.env.NEXT_PUBLIC_BUCKET_ID as string,
      fileId
    );
    return url.toString();
  },
};

export { client, account, databases, storage };













































