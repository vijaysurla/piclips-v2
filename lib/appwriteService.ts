import { Client, Account, Databases, Storage, ID, Query, Models, OAuthProvider } from 'appwrite';

let client: Client;
let account: Account;
let databases: Databases;
let storage: Storage;
let isInitialized = false;

const databaseId = process.env.NEXT_PUBLIC_DATABASE_ID as string;

const followCollectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW;
if (!followCollectionId) {
  console.error('NEXT_PUBLIC_COLLECTION_ID_FOLLOW is not defined in environment variables');
}

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
  image?: string;
  bio?: string;
}

export interface Like extends Models.Document {
  user_id: string;
  post_id: string;
}

export interface Comment extends Models.Document {
  user_id: string;
  post_id: string;
  text: string;
  created_at: string;
}

export interface Follow extends Models.Document {
  follower_id: string;
  following_id: string;
  created_at: string;
}

interface EnhancedPost extends Post {
  user?: Profile;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

interface ErrorPost {
  $id: string;
  error: true;
  errorMessage: string;
}

type PostResult = EnhancedPost | ErrorPost;

export const appwriteService = {
  handleAppwriteError: (error: any, action: string) => {
    if (error.code === 401) {
      console.error(`Unauthorized error during ${action}:`, error);
      throw new Error(`You are not authorized to ${action}. Please check your permissions or try logging in again.`);
    } else {
      console.error(`Error during ${action}:`, error);
      throw error;
    }
  },

  loginWithGoogle: async () => {
    ensureInitialized();
    try {
      // Get the current hostname to handle both www and non-www versions
      const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'piclips.com';
      const isWWW = currentHostname.startsWith('www.');
      const baseHostname = isWWW ? currentHostname.slice(4) : currentHostname;
      
      // Use the appropriate URL based on the environment
      const successUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/auth-callback'
        : `https://${baseHostname}/auth-callback`;
      
      const failureUrl = `${successUrl}?error=true`;
      
      console.log('Initiating Google login with callback URL:', successUrl);
      await account.createOAuth2Session(
        OAuthProvider.Google,
        successUrl,
        failureUrl
      );
    } catch (error) {
      console.error('Appwrite service error: loginWithGoogle', error);
      throw error;
    }
  },

  login: async () => {
    ensureInitialized();
    try {
      // Get the current hostname to handle both www and non-www versions
      const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'piclips.com';
      const isWWW = currentHostname.startsWith('www.');
      const baseHostname = isWWW ? currentHostname.slice(4) : currentHostname;
      
      // Use the appropriate URL based on the environment
      const successUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/auth-callback'
        : `https://${baseHostname}/auth-callback`;
      
      const failureUrl = `${successUrl}?error=true`;
      
      console.log('Initiating Google login with callback URL:', successUrl);
      await account.createOAuth2Session(
        OAuthProvider.Google,
        successUrl,
        failureUrl
      );
    } catch (error) {
      console.error('Appwrite service error: login', error);
      throw error;
    }
  },

  handleAuthCallback: async () => {
    ensureInitialized();
    try {
      console.log('Handling auth callback');
      const user = await account.get();
      console.log('User authenticated:', user);
      
      let profile = await appwriteService.getProfile(user.$id);
      
      if (!profile) {
        console.log('Creating new profile for user:', user.$id);
        profile = await appwriteService.createProfile(user.$id, user.name, '');
      } else {
        console.log('Existing profile found for user:', user.$id);
      }
      
      return { user, profile };
    } catch (error) {
      console.error('Appwrite service error: handleAuthCallback', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    ensureInitialized();
    try {
      const user = await account.get();
      const profile = await appwriteService.getProfile(user.$id);
      return { user, profile };
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

  createProfile: async (userId: string, name: string, image: string = '', bio?: string): Promise<Profile> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE as string;
      const defaultImageId = process.env.NEXT_PUBLIC_PLACEHOLDER_DEAFULT_IMAGE_ID;
    
      if (!defaultImageId) {
        throw new Error('NEXT_PUBLIC_PLACEHOLDER_DEAFULT_IMAGE_ID is not defined in environment variables');
      }

      const profileData: {
        user_id: string;
        name: string;
        image: string;
        bio?: string;
      } = {
        user_id: userId,
        name,
        image: image || defaultImageId,
      };

      if (bio) {
        profileData.bio = bio;
      }

      return await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        profileData
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
      const updateData = {
        name: data.name,
        bio: data.bio,
        image: data.image,
      };
      return await databases.updateDocument(
        databaseId,
        collectionId,
        profileId,
        updateData
      );
    } catch (error) {
      console.error('Appwrite service error: updateProfile', error);
      throw error;
    }
  },

  createPost: async (userId: string, videoUrl: string, caption: string): Promise<Post> => {
    ensureInitialized();
    try {
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

  getPost: async (postId: string): Promise<Post> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_POST as string;
      return await databases.getDocument(
        databaseId,
        collectionId,
        postId
      );
    } catch (error) {
      console.error(`Appwrite service error: getPost (ID: ${postId})`, error);
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

  createLike: async (userId: string, postId: string): Promise<Like> => {
    ensureInitialized();
    try {
      console.log('Creating like with userId:', userId, 'postId:', postId);
      if (!userId || !postId) {
        throw new Error('Both userId and postId are required to create a like');
      }
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE as string;
      
      // Check if the like already exists
      const existingLikes = await databases.listDocuments<Like>(
        databaseId,
        collectionId,
        [
          Query.equal('user_id', userId),
          Query.equal('post_id', postId)
        ]
      );

      if (existingLikes.documents.length > 0) {
        console.log('Like already exists');
        return existingLikes.documents[0];
      }

      // Create a new like
      const newLike = await databases.createDocument<Like>(
        databaseId,
        collectionId,
        ID.unique(),
        { user_id: userId, post_id: postId }
      );

      console.log('New like created:', newLike);
      return newLike;
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

  getLikeCount: async (postId: string): Promise<number> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE as string;
      const response = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('post_id', postId)]
      );
      return response.total;
    } catch (error) {
      console.error('Appwrite service error: getLikeCount', error);
      throw error;
    }
  },

  hasUserLikedPost: async (userId: string, postId: string): Promise<boolean> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE as string;
      const response = await databases.listDocuments<Like>(
        databaseId,
        collectionId,
        [Query.equal('post_id', postId), Query.equal('user_id', userId)]
      );
      return response.documents.length > 0;
    } catch (error) {
      console.error('Appwrite service error: hasUserLikedPost', error);
      throw error;
    }
  },

  createComment: async (userId: string, postId: string, text: string): Promise<Comment> => {
    ensureInitialized();
    try {
      console.log('Creating comment with userId:', userId, 'postId:', postId, 'text:', text);
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

  getCommentCount: async (postId: string): Promise<number> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_COMMENT as string;
      const response = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('post_id', postId)]
      );
      return response.total;
    } catch (error) {
      console.error('Appwrite service error: getCommentCount', error);
      throw error;
    }
  },

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
    const url = storage.getFilePreview(
      process.env.NEXT_PUBLIC_BUCKET_ID as string,
      fileId
    );
    return url.toString();
  },

  getFileView: (fileId: string): string => {
    ensureInitialized();
    const url = storage.getFileView(
      process.env.NEXT_PUBLIC_BUCKET_ID as string,
      fileId
    );
    return url.toString();
  },

  searchUsers: async (query: string): Promise<Profile[]> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_PROFILE as string;
      const response = await databases.listDocuments<Profile>(
        databaseId,
        collectionId,
        [Query.search('name', query), Query.limit(5)]
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite service error: searchUsers', error);
      throw error;
    }
  },

  getLikedPosts: async (userId: string): Promise<EnhancedPost[]> => {
    ensureInitialized();
    try {
      console.log('Fetching liked posts for user:', userId);
      const likeCollectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_LIKE as string;
      const postCollectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_POST as string;

      // Fetch all likes for the user
      const likes = await databases.listDocuments(
        databaseId,
        likeCollectionId,
        [Query.equal('user_id', userId)]
      );
      console.log('Fetched likes:', likes.documents);

      // Fetch the corresponding posts
      const likedPosts: PostResult[] = await Promise.all(
        likes.documents.map(async (like) => {
          console.log('Fetching post:', like.post_id);
          try {
            const post = await databases.getDocument<Post>(
              databaseId,
              postCollectionId,
              like.post_id
            );

            const userProfile = await appwriteService.getProfile(post.user_id);
            const likeCount = await appwriteService.getLikeCount(post.$id);
            const commentCount = await appwriteService.getCommentCount(post.$id);

            return {
              ...post,
              user: userProfile || undefined,
              likeCount,
              commentCount,
              isLiked: true
            };
          } catch (error) {
            console.error(`Error fetching post (ID: ${like.post_id}):`, error);
            return {
              $id: like.post_id,
              error: true,
              errorMessage: 'Post not found or inaccessible'
            };
          }
        })
      );

      // Filter out posts with errors, but log them for monitoring
      const validLikedPosts = likedPosts.filter((post): post is EnhancedPost => {
        if ('error' in post && post.error === true) {
          console.warn(`Liked post with ID ${post.$id} was not accessible:`, post.errorMessage);
          return false;
        }
        return true;
      });

      console.log('Fetched liked posts:', validLikedPosts);
      return validLikedPosts;
    } catch (error) {
      console.error('Appwrite service error: getLikedPosts', error);
      throw error;
    }
  },

  followUser: async (followerId: string, followingId: string): Promise<Follow> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW;
      if (!collectionId) {
        throw new Error('NEXT_PUBLIC_COLLECTION_ID_FOLLOW environment variable is not defined');
      }
    
      // Check if trying to follow self
      if (followerId === followingId) {
        throw new Error('Users cannot follow themselves');
      }

      // Check if the follow relationship already exists
      const existingFollow = await databases.listDocuments<Follow>(
        databaseId,
        collectionId,
        [
          Query.equal('follower_id', followerId),
          Query.equal('following_id', followingId)
        ]
      );

      if (existingFollow.documents.length > 0) {
        console.log('Already following');
        return existingFollow.documents[0];
      }

      // Create a new follow relationship
      const newFollow = await databases.createDocument<Follow>(
        databaseId,
        collectionId,
        ID.unique(),
        { 
          follower_id: followerId, 
          following_id: followingId,
          created_at: new Date().toISOString()
        }
      );

      console.log('New follow relationship created:', newFollow);
      return newFollow;
    } catch (error) {
      return appwriteService.handleAppwriteError(error, 'follow user');
    }
  },

  unfollowUser: async (followerId: string, followingId: string): Promise<void> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW as string;
      
      const existingFollow = await databases.listDocuments<Follow>(
        databaseId,
        collectionId,
        [
          Query.equal('follower_id', followerId),
          Query.equal('following_id', followingId)
        ]
      );

      if (existingFollow.documents.length > 0) {
        await databases.deleteDocument(databaseId, collectionId, existingFollow.documents[0].$id);
        console.log('Unfollowed successfully');
      } else {
        console.log('Follow relationship not found');
      }
    } catch (error) {
      return appwriteService.handleAppwriteError(error, 'unfollow user');
    }
  },

  isFollowing: async (followerId: string, followingId: string): Promise<boolean> => {
    ensureInitialized();
    try {
      if (!followCollectionId) {
        console.error('NEXT_PUBLIC_COLLECTION_ID_FOLLOW is not defined in environment variables');
        return false;
      }

      const existingFollow = await databases.listDocuments<Follow>(
        databaseId,
        followCollectionId,
        [
          Query.equal('follower_id', followerId),
          Query.equal('following_id', followingId)
        ]
      );

      return existingFollow.documents.length > 0;
    } catch (error) {
      console.error('Appwrite service error: isFollowing', error);
      return false;
    }
  },

  getFollowedUsers: async (userId: string): Promise<string[]> => {
    ensureInitialized();
    try {
      const collectionId = process.env.NEXT_PUBLIC_COLLECTION_ID_FOLLOW as string;
      
      const followedUsers = await databases.listDocuments<Follow>(
        databaseId,
        collectionId,
        [Query.equal('follower_id', userId)]
      );

      return followedUsers.documents.map(follow => follow.following_id);
    } catch (error) {
      console.error('Appwrite service error: getFollowedUsers', error);
      throw error;
    }
  },
};

export default appwriteService;
export { client, account, databases, storage };





















































































































