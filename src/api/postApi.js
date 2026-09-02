// src/api/postApi.js
//
// All admin calls require credentials so the admin_session cookie is sent.

import { apiUrl } from "../utils/apiBase";

const CRED = { credentials: "include" };

export const createPost = async (data) => {
  const res = await fetch(apiUrl("/posts"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    ...CRED,
  });
  if (!res.ok) throw new Error("Failed to create Post");
  return res.json();
};
export const getPostById = async (id) => {
  const response = await fetch(apiUrl(`/posts/id/${id}`), CRED);
  if (!response.ok) throw new Error("Failed to fetch post");
  return response.json();
};
export const getPostbyCategory_And_Date = async (date, category) => {
  const categoriesinlowercase = category.toLowerCase();
  const response = await fetch(
    apiUrl(`/posts/${date}/${categoriesinlowercase}`),
    CRED
  );
  if (!response.ok) throw new Error("Failed to fetch post");
  return response.json();
};
export const getPostBycategory = async (category) => {
  const categoriesinlowercase = category.toLowerCase();
  const res = await fetch(apiUrl(`/posts/${categoriesinlowercase}`), CRED);
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
};
export const getAllPostsBycategory = async (category) => {
  const res = await fetch(apiUrl(`/posts/all/${category}`), CRED);
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
};
export const getAllMiddayresultsBycategory = async (category) => {
  const res = await fetch(apiUrl(`/posts/midday/${category}`), CRED);
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
};
export const getPrizeBreakDownByPostandDraw = async (postId, draw_type) => {
  const res = await fetch(
    apiUrl(`/prize-breakdowns/${postId}/${draw_type}`),
    CRED
  );
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
};
export const getAllEveningresultsBycategory = async (category) => {
  const res = await fetch(apiUrl(`/posts/evening/${category}`), CRED);
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
};
export const getPrizeBreakDownByPost = async (id) => {
  const response = await fetch(apiUrl(`/prize-breakdowns/${id}`), CRED);
  if (!response.ok) throw new Error("Failed to fetch breakdowns tables");
  return await response.json();
};
export const getAllRecentsPosts = async () => {
  const res = await fetch(apiUrl("/posts/recent"), CRED);
  if (!res.ok) throw new Error("Failed to fetch lotteries");
  return res.json();
};
export const getAllposts = async () => {
  const res = await fetch(apiUrl("/posts/"), CRED);
  if (!res.ok) throw new Error("Failed to fetch lotteries");
  return res.json();
};
export const getAllcategories = async () => {
  const res = await fetch(apiUrl("/posts/category"), CRED);
  if (!res.ok) throw new Error("Failed to fetch lotteries");
  return res.json();
};
export const fetchNoOfcategories = async () => {
  const res = await fetch(apiUrl("/posts/category/n"), CRED);
  if (!res.ok) throw new Error("Failed to fetch lotteries");
  return res.json();
};
export const fetchNoOfposts = async () => {
  const res = await fetch(apiUrl("/posts/n"), CRED);
  if (!res.ok) throw new Error("Failed to fetch lotteries");
  return res.json();
};

export const updatePost = async (id, postData) => {
  try {
    const response = await fetch(apiUrl(`/posts/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
      ...CRED,
    });
    if (!response.ok) {
      throw new Error("Failed to update post");
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating post with ID ${id}:`, error);
    throw error;
  }
};