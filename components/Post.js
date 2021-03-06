import {
  BookmarkIcon,
  ChatIcon,
  DotsHorizontalIcon,
  EmojiHappyIcon,
  HeartIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/outline";
import { HeartIcon as HeartIconFilled} from '@heroicons/react/solid';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Moment from "react-moment";
import { db } from "../firebase";

function Post({ username, userImg, img, caption, id }) {
  const { data: session } = useSession();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);

  const sendComment = async (e) => {
    e.preventDefault();

    const commentToSend = comment;
    setComment("");

    await addDoc(collection(db, "posts", id, "comments"), {
      comment: commentToSend,
      username: session.user.username,
      userImg: session.user.image,
      timestamp: serverTimestamp(),
    });
  };

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, "posts", id, "comments"),
          orderBy("timestamp", "desc")
        ),
        (snapshot) => setComments(snapshot.docs)
      ),
    [db, id]
  );

  useEffect(
    () =>
      onSnapshot(collection(db, "posts", id, "likes"), (snapshot) =>
        setLikes(snapshot.docs)
      ),
    [db, id]
  );

  const likePost = async () => {
    if (hasLiked) {
      await deleteDoc(doc(db, "posts", id, "likes", session.user.uid));
    } else {
      await setDoc(doc(db, "posts", id, "likes", session.user.uid), {
        username: session.user.username,
      });
    }
  };

  useEffect(
    () =>
      setHasLiked(
        likes.findIndex((like) => like.id === session?.user?.uid) !== -1
      ),
    [likes]
  );

  return (
    <div className='bg-white my-7 border rounded-md'>
      {/* Header */}
      <div className='flex items-center p-4'>
        <img
          src={userImg}
          alt='user image'
          className='w-12 h-12 rounded-full object-contain border p-1'
        />
        <p className='pl-2 flex-1 font-bold'>{username}</p>
        <DotsHorizontalIcon className='h-5 w-5' />
      </div>

      {/* img */}
      <img src={img} alt='image' className='w-full object-cover md:h-[550px]' />

      {/* buttons */}
      {session && (
        <div className='flex items-center justify-between px-4 pt-4'>
          <div className='flex items-center space-x-6'>
            {hasLiked ? (
               <HeartIconFilled onClick={likePost} className='postBtn text-red-500' />
            ) : (
              <HeartIcon onClick={likePost} className='postBtn' />
            )}

            <ChatIcon className='postBtn' />
            <PaperAirplaneIcon className='postBtn rotate-45' />
          </div>
          <BookmarkIcon className='postBtn' />
        </div>
      )}

      {/* caption */}
      <div className='p-4 truncate'>
        {likes.length > 0 && (
          <section className='font-bold mb-1'>{likes.length} likes</section>
        )}
        <span className='font-bold'>{username}</span> {caption}
      </div>

      {/* comments */}
      {comments.length > 0 && (
        <div className='mx-4 h-20 overflow-y-scroll scrollbar-thumb-black scrollbar-thin'>
          {comments.map((comment) => (
            <div key={comment.id} className='flex items-center space-x-2 mb-3'>
              <img
                src={comment.data().userImg}
                alt='comment image'
                className='h-7 w-7 rounded-full'
              />
              <p className='text-sm flex-1'>
                <span className='font-bold'>{comment.data().username}</span>{" "}
                {comment.data().comment}
              </p>
              <Moment fromNow className='text-xs text-gray-400'>
                {comment.data().timestamp?.toDate()}
              </Moment>
            </div>
          ))}
        </div>
      )}

      {/* input box */}
      {session && (
        <form className='flex items-center p-4'>
          <EmojiHappyIcon className='h-7' />
          <input
            type='text'
            name='post'
            id='post'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Add a comment ...'
            className='flex-1 border-none focus:ring-0 outline-none'
          />
          <button
            type='submit'
            disabled={!comment.trim()}
            onClick={sendComment}
            className='font-semibold text-blue-500'>
            Post
          </button>
        </form>
      )}
    </div>
  );
}

export default Post;
