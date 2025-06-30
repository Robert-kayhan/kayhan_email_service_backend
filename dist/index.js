"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const connectDb_1 = __importDefault(require("./db/connectDb"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
//routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const template_route_1 = __importDefault(require("./routes/template.route"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5002;
//middlewares
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
dotenv_1.default.config();
app.use((0, cors_1.default)({
    origin: "http://localhost:3000", // your Next.js frontend
    credentials: true, // allow cookies to be sent
}));
//routes
app.use("/api/auth/", auth_routes_1.default);
app.use("/api/users/", user_routes_1.default);
app.use("/api/templates/", template_route_1.default);
(0, connectDb_1.default)();
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT} 🚀`);
});
