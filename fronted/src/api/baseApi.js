import axios from "axios";

const baseApi = axios.create({
    baseURL: "http://localhost/Project-VI/Project-VI/backend/",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

export default baseApi;

