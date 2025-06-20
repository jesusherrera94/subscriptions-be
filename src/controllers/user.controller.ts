import { Request, Response } from 'express';
import { 
    db,
    auth,
    collection,
    doc,
    getDoc,
    addDoc,
    setDoc,
    createUserWithEmailAndPassword,
    query,
    where,
    getDocs,
    updateDoc
    } from '../config/firebase';

interface UserData {
  id?: string;
  username: string;
  fullname: string;
  email: string;
  password?: string;
  principalInterest: string;
  profilePicture?: string;
  uid?: string;
}

interface CommentData {
  account: string;
  name: string;
  comment: string;
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, fullname, email, password, principalInterest, profilePicture } = req.body;

    if (!username || !fullname || !email || !password || !principalInterest) {
      return res.status(400).json({ message: 'Missing required fields for user creation.' });
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const uid = user.uid;

    const usersCollectionRef = collection(db, 'users');
    const newUserRef = await addDoc(usersCollectionRef, {
      username,
      fullname,
      email,
      principalInterest,
      profilePicture: profilePicture || null,
      uid: uid,
    } as UserData);

    await setDoc(newUserRef, { id: newUserRef.id }, { merge: true });

    const createdUser = { id: newUserRef.id, username, fullname, email, principalInterest, profilePicture, uid };

    res.status(201).json({ message: 'User created successfully!', user: createdUser });

  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'auth/email-already-in-use') {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;

    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Assuming uid is unique, get the first matching document
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as UserData;
    res.status(200).json({ user: userData });
  } catch (error: any) {
    console.error('Error getting user by UID:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const addOrUpdateComment = async (req: Request, res: Response) => {
  try {
    const { account, name, comment } = req.body;

    // Validate input
    if (!account || typeof account !== 'string' || !/^\d{8}$/.test(account)) {
      return res.status(400).json({ message: 'Account must be an 8-digit number string.' });
    }
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Name is required.' });
    }
    if (!comment || typeof comment !== 'string') {
      return res.status(400).json({ message: 'Comment is required.' });
    }

    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('account', '==', account));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Update existing comment
      const commentDoc = querySnapshot.docs[0];
      await updateDoc(doc(commentsRef, commentDoc.id), { name, comment });
      return res.status(200).json({ message: 'Comment updated successfully.' });
    } else {
      // Add new comment
      await addDoc(commentsRef, { account, name, comment });
      return res.status(201).json({ message: 'Comment added successfully.' });
    }
  } catch (error: any) {
    console.error('Error adding/updating comment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};