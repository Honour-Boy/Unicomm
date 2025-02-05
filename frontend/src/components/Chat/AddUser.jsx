// import { db } from "../Firebase/firebase";
// import {
//   arrayUnion,
//   collection,
//   doc,
//   getDocs,
//   getDoc,
//   query,
//   serverTimestamp,
//   setDoc,
//   updateDoc,
//   where,
//   limit,
// } from "firebase/firestore";
// import { useState, useEffect } from "react";
// import useUserStore from "../Firebase/userStore";
// import { ProfilePic } from "../../assets";
// import LoadingSpinner from "../Common/LoadingComponent";

// const AddUser = ({ setAddMode, setToast }) => {
//   const [user, setUser] = useState(null);
//   const { currentUser } = useUserStore();
//   const [username, setUsername] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(null);
//   const [isAdding, setIsAdding] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);

//   useEffect(() => {
//     const fetchSuggestions = async () => {
//       try {
//         const userRef = collection(db, "users");
//         const q = query(userRef, limit(3));
//         const querySnapShot = await getDocs(q);

//         const suggestionList = querySnapShot.docs
//           .map((doc) => ({
//             ...doc.data(),
//             id: doc.id,
//           }))
//           .filter((suggestion) => suggestion.id !== currentUser.id); // Filter out the current user

//         setSuggestions(suggestionList);
//       } catch (err) {
//         console.log(err);
//       }
//     };

//     fetchSuggestions();
//   }, [currentUser.id]);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);
//     let username = formData.get("username").trim();
    
//     // Prepend "@" if not already present
//     if (!username.startsWith("@")) {
//       username = "@" + username;
//     }

//     setUser(null);
//     setIsLoading(true);

//     try {
//       const userRef = collection(db, "users");
//       const q = query(userRef, where("username", "==", username));
//       const querySnapShot = await getDocs(q);

//       if (!querySnapShot.empty) {
//         setIsLoading(false);
//         setUser({
//           ...querySnapShot.docs[0].data(),
//           id: querySnapShot.docs[0].id,
//         });
//       } else {
//         setUser(null);
//         setIsLoading(null);
//         setError("The username above was not found.");
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleAdd = async (userToAdd) => {
//     if (!userToAdd || !currentUser) return;

//     // Check if the user is trying to add themselves
//     if (userToAdd.id === currentUser.id) {
//       setToast("You cannot add yourself to the chat list.");
//       return;
//     }

//     setIsAdding(true);
//     const chatRef = collection(db, "chats");
//     const userChatsRef = collection(db, "userchats");
//     try {
//       const newChatRef = doc(chatRef);

//       const timestamp = serverTimestamp(); // Get server timestamp

//       // Ensure the userchats document exists for the other user
//       const userDocRef = doc(userChatsRef, userToAdd.id);
//       const userDocSnap = await getDoc(userDocRef);
//       if (!userDocSnap.exists()) {
//         await setDoc(userDocRef, { chats: [] });
//       }

//       // Ensure the userchats document exists for the current user
//       const currentUserDocRef = doc(userChatsRef, currentUser.id);
//       const currentUserDocSnap = await getDoc(currentUserDocRef);
//       if (!currentUserDocSnap.exists()) {
//         await setDoc(currentUserDocRef, { chats: [] });
//       }

//       // Check if the chat already exists for the current user
//       const currentUserChats = currentUserDocSnap.data()?.chats || [];
//       const existingChat = currentUserChats.find(
//         (chat) => chat.receiverId === userToAdd.id
//       );

//       if (existingChat) {
//         setToast("User is already in your chat list.");
//         setIsAdding(false);
//         return;
//       }

//       // Create new chat document
//       await setDoc(newChatRef, {
//         createdAt: timestamp,
//         messages: [],
//       });

//       // Update "userchats" collection for the other user
//       await updateDoc(userDocRef, {
//         chats: arrayUnion({
//           chatId: newChatRef.id,
//           lastMessage: "",
//           lastTranslatedMessage: "",
//           receiverId: currentUser.id,
//         }),
//         updatedAt: timestamp,
//       });

//       // Update "userchats" collection for the current user
//       await updateDoc(currentUserDocRef, {
//         chats: arrayUnion({
//           chatId: newChatRef.id,
//           lastMessage: "",
//           lastTranslatedMessage: "",
//           receiverId: userToAdd.id,
//         }),
//         updatedAt: timestamp,
//       });

//       setDisplay(true);
//       setUser(null); // Reset the user state after adding
//     } catch (err) {
//       console.log(err); // Log any errors
//     } finally {
//       setIsAdding(false); // Reset loading state
//       setAddMode(false);
//     }
//   };

//   return (
//     <div className="w-full h-max mt-2 bg-opacity-80 rounded-lg">
//       <form onSubmit={handleSearch} className="flex gap-2">
//         <input
//           type="text"
//           placeholder="Add user using username"
//           name="username"
//           onChange={(e) => setUsername(e.target.value)}
//           className="w-4/5 p-2 rounded-lg border-none outline-none text-black"
//         />
//         <button className="p-2 rounded-lg bg-[#6f6f6f] text-white border-none cursor-pointer">
//           Search
//         </button>
//       </form>
//       {isLoading === true && username !== "" && (
//         <div className="mt-3">
//           <LoadingSpinner />
//         </div>
//       )}
//       {!user && isLoading === null && (
//         <div className="mt-3 text-left">{error}</div>
//       )}
//       {user && (
//         <div className="mt-3 flex items-center justify-between">
//           <div className="flex items-center gap-5">
//             <img
//               src={ProfilePic}
//               alt="avatar"
//               className="w-10 h-10 rounded-full object-cover bg-white"
//             />
//             <span>{user.username}</span>
//           </div>
//           <button
//             onClick={() => handleAdd(user)}
//             className="p-2 rounded-lg bg-orange-600 text-white border-none cursor-pointer"
//           >
//             {isAdding ? "Adding..." : "Add User"}
//           </button>
//         </div>
//       )}
//       <div className="mt-5">
//         <h3 className="text-lg font-semibold">Suggestions</h3>
//         {suggestions.map((suggestion) => (
//           <div key={suggestion.id} className="mt-3 flex items-center justify-between">
//             <div className="flex items-center gap-5">
//               <img
//                 src={ProfilePic}
//                 alt="avatar"
//                 className="w-10 h-10 rounded-full object-cover bg-white"
//               />
//               <span>{suggestion.username}</span>
//             </div>
//             <button
//               onClick={() => handleAdd(suggestion)}
//               className="p-2 rounded-lg bg-orange-600 text-white border-none cursor-pointer"
//             >
//               {isAdding ? "Adding..." : "Add User"}
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AddUser;
