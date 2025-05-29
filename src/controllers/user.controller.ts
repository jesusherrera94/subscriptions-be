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
    const { id } = req.params;

    const userDocRef = doc(db, 'users', id);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userData = userDoc.data() as UserData;
    res.status(200).json({ user: userData });
  } catch (error: any) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};