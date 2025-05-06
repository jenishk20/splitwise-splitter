const { default: axios } = require("axios");
const express = require("express");
require("dotenv").config();

const getAuthURL = (req, res) => {
  const clientId = process.env.SPLITWISE_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;
  const authUrl = `https://secure.splitwise.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
  return authUrl;
};

const getToken = async (code) => {
  console.log("Coming here", code);
  const response = await axios.post(
    "https://secure.splitwise.com/oauth/token",
    null,
    {
      params: {
        grant_type: "authorization_code",
        client_id: process.env.SPLITWISE_CLIENT_ID,
        client_secret: process.env.SPLITWISE_CLIENT_SECRET,
        code,
        redirect_uri: process.env.REDIRECT_URI,
      },
    }
  );
  console.log("Response is ", response.data);
  return response.data;
};

const getCurrentUser = async (accessToken) => {
  const response = await axios.get(
    "https://secure.splitwise.com/api/v3.0/get_current_user",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return response.data;
};

module.exports = { getAuthURL, getToken, getCurrentUser };
