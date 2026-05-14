import apiClient from './apiClient';

export const getPosts = (params) =>
  apiClient.get('/api/community/posts', { params }).then((r) => r.data);

export const createPost = (body) =>
  apiClient.post('/api/community/posts', body).then((r) => r.data);

export const getPost = (postId) =>
  apiClient.get(`/api/community/posts/${postId}`).then((r) => r.data);

export const updatePost = (postId, body) =>
  apiClient.put(`/api/community/posts/${postId}`, body).then((r) => r.data);

export const deletePost = (postId) =>
  apiClient.delete(`/api/community/posts/${postId}`).then((r) => r.data);

export const getComments = (postId) =>
  apiClient.get(`/api/community/posts/${postId}/comments`).then((r) => r.data);

export const createComment = (postId, content, isHidden = false) =>
  apiClient.post(`/api/community/posts/${postId}/comments`, { content, isHidden }).then((r) => r.data);

export const deleteComment = (postId, commentId) =>
  apiClient.delete(`/api/community/posts/${postId}/comments/${commentId}`).then((r) => r.data);

export const toggleReaction = (postId, type) =>
  apiClient.post(`/api/community/posts/${postId}/reactions/${type}`).then((r) => r.data);
