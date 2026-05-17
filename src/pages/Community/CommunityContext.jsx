import { createContext, useContext, useEffect, useState } from 'react';
import {
  AI_INSIGHT_BY_EMOTION,
  getEmotionByLabel,
  getFilterFromEmotion,
} from './communityData';
import * as communityApi from '@/services/communityApi';

const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const [selectedEmotionLabel, setSelectedEmotionLabel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reactionState, setReactionState] = useState({});

  const fetchPosts = async (emotionLabel) => {
    setLoading(true);
    try {
      const data = await communityApi.getPosts({
        emotionLabel: emotionLabel || undefined,
        page: 0,
        size: 50,
      });
      const fetched = data.content ?? [];
      setPosts(fetched);
      const initialReactions = {};
      fetched.forEach((post) => {
        (Array.isArray(post.myReactions) ? post.myReactions : []).forEach((type) => {
          initialReactions[`${post.id}-${type}`] = true;
        });
      });
      setReactionState((prev) => ({ ...prev, ...initialReactions }));
    } catch (e) {
      console.error('게시글 로딩 실패', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(selectedEmotionLabel);
  }, [selectedEmotionLabel]);

  const toggleReaction = async (postId, type) => {
    const key = `${postId}-${type}`;
    const wasReacted = Boolean(reactionState[key]);
    const nowReacted = !wasReacted;

    // 낙관적 업데이트
    setReactionState((prev) => ({ ...prev, [key]: nowReacted }));
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const delta = nowReacted ? 1 : -1;
        return {
          ...p,
          reactions: { ...p.reactions, [type]: Math.max(0, (p.reactions?.[type] ?? 0) + delta) },
        };
      }),
    );

    try {
      const result = await communityApi.toggleReaction(postId, type);
      setReactionState((prev) => ({ ...prev, [key]: result.reacted }));
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return { ...p, reactions: { ...p.reactions, [type]: result.count } };
        }),
      );
      return result;
    } catch {
      // 롤백
      setReactionState((prev) => ({ ...prev, [key]: wasReacted }));
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const delta = wasReacted ? 1 : -1;
          return {
            ...p,
            reactions: { ...p.reactions, [type]: Math.max(0, (p.reactions?.[type] ?? 0) + delta) },
          };
        }),
      );
    }
  };

  const isReacted = (postId, type) => Boolean(reactionState[`${postId}-${type}`]);

  const setReactionStateFromPost = (post) => {
    const patch = {};
    (Array.isArray(post.myReactions) ? post.myReactions : []).forEach((type) => {
      patch[`${post.id}-${type}`] = true;
    });
    setReactionState((prev) => ({ ...prev, ...patch }));
  };

  const getReactionCount = (post, type) => {
    if (type === 'comment') return post.commentCount ?? 0;
    return post.reactions?.[type] ?? 0;
  };

  const createPost = async ({ emotion, title, content }) => {
    const tags = [emotion.label, '지금기록', '감정공유'];
    const id = await communityApi.createPost({
      emotionLabel: emotion.label,
      title,
      content,
      tags,
    });
    if (emotion.label === selectedEmotionLabel) {
      // 같은 필터 상태에서 글 작성 시 useEffect가 트리거되지 않으므로 직접 갱신
      await fetchPosts(emotion.label);
    } else {
      setSelectedEmotionLabel(emotion.label);
    }
    return id;
  };

  const getComments = async (postId) => {
    return communityApi.getComments(postId);
  };

  const addComment = async (postId, content, isHidden = false) => {
    await communityApi.createComment(postId, content, isHidden);
  };

  const hydratedPosts = posts.map((post) => ({
    ...post,
    emotion: getEmotionByLabel(post.emotionLabel),
    similarity: post.similarity ?? 0,
    author: post.authorName,
    content: post.contentPreview ?? post.content ?? '',
    time: formatTime(post.createdAt),
  }));

  const selectedEmotion = getEmotionByLabel(selectedEmotionLabel);
  const aiInsight = AI_INSIGHT_BY_EMOTION[selectedEmotionLabel] ?? AI_INSIGHT_BY_EMOTION['부담감'];

  const value = {
    posts: hydratedPosts,
    loading,
    selectedEmotion,
    selectedEmotionLabel,
    selectedFilter: selectedEmotionLabel ? getFilterFromEmotion(selectedEmotionLabel) : 'all',
    aiInsight,
    setSelectedEmotionLabel,
    createPost,
    getComments,
    addComment,
    toggleReaction,
    isReacted,
    getReactionCount,
    setReactionStateFromPost,
    refreshPosts: () => fetchPosts(selectedEmotionLabel),
  };

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

function formatTime(isoString) {
  if (!isoString) return '';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within CommunityProvider');
  }
  return context;
}
