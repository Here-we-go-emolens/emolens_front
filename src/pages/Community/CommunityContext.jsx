import { createContext, useContext, useMemo, useState } from 'react';
import {
  AI_INSIGHT_BY_EMOTION,
  INITIAL_COMMENTS_BY_POST,
  INITIAL_POSTS,
  getEmotionByLabel,
  getFilterFromEmotion,
  hydratePost,
} from './communityData';
import { detectToxicity } from '@/utils/moderation';

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const [selectedEmotionLabel, setSelectedEmotionLabel] = useState('부담감');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [reactionState, setReactionState] = useState({});
  const [commentsByPost, setCommentsByPost] = useState(INITIAL_COMMENTS_BY_POST);

  const toggleReaction = (postId, type) => {
    const key = `${postId}-${type}`;
    setReactionState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isReacted = (postId, type) => Boolean(reactionState[`${postId}-${type}`]);

  const getReactionCount = (post, type) => {
    if (type === 'comment') {
      return commentsByPost[post.id]?.length ?? 0;
    }
    const base = post.reactions[type] ?? 0;
    return base + (isReacted(post.id, type) ? 1 : 0);
  };

  const createPost = ({ emotion, title, content }) => {
    const nextPost = {
      id: Date.now(),
      emotionLabel: emotion.label,
      similarity: emotion.label === selectedEmotionLabel ? 92 : 64,
      title,
      content,
      tags: [emotion.label, '지금기록', '감정공유'],
      author: '나',
      time: '방금 전',
      matchReason: '방금 기록한 감정을 기준으로 AI 연결 피드에 바로 반영됐어요.',
      reactions: { empathy: 0, comfort: 0, understand: 0, comment: 0 },
    };

    setPosts((prev) => [nextPost, ...prev]);
    setCommentsByPost((prev) => ({ ...prev, [nextPost.id]: [] }));
    setSelectedEmotionLabel(emotion.label);
    return nextPost.id;
  };

  const getComments = (postId) => commentsByPost[postId] ?? [];

  const addComment = (postId, content) => {
    const moderation = detectToxicity(content);

    if (moderation.status === 'warning' || moderation.status === 'blocked') {
      return { ok: false, moderation };
    }

    const nextComment = {
      id: Date.now(),
      author: '나',
      content: content.trim(),
      createdAt: '방금 전',
      isHidden: moderation.status === 'hidden',
    };

    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), nextComment],
    }));

    return { ok: true, moderation, comment: nextComment };
  };

  const selectedEmotion = getEmotionByLabel(selectedEmotionLabel);
  const hydratedPosts = useMemo(() => posts.map(hydratePost), [posts]);
  const aiInsight = AI_INSIGHT_BY_EMOTION[selectedEmotionLabel] ?? AI_INSIGHT_BY_EMOTION.부담감;

  const value = {
    posts: hydratedPosts,
    selectedEmotion,
    selectedEmotionLabel,
    selectedFilter: getFilterFromEmotion(selectedEmotionLabel),
    aiInsight,
    setSelectedEmotionLabel,
    createPost,
    getComments,
    addComment,
    toggleReaction,
    isReacted,
    getReactionCount,
  };

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within CommunityProvider');
  }
  return context;
}
