import axios from "axios";

const api = axios.create({
baseURL: "https://timarni-qr-backend.onrender.com",
});

export default api;

