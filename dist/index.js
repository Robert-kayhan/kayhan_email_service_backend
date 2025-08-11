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
dotenv_1.default.config(); // ✅ Load env first
//routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const template_route_1 = __importDefault(require("./routes/template.route"));
const leadGroup_route_1 = __importDefault(require("./routes/leadGroup.route"));
const leadFollowUp_route_1 = __importDefault(require("./routes/leadFollowUp.route"));
const Campaign_route_1 = __importDefault(require("./routes/Campaign.route"));
const sendEmail_routes_1 = __importDefault(require("./routes/sendEmail.routes"));
const Specification_routes_1 = __importDefault(require("./routes/Specification.routes"));
const flyer_routes_1 = __importDefault(require("./routes/flyer.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT;
app.set("trust proxy", 1);
// ✅ Middleware order matters!
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://89.116.134.75:3000",
        "https://cravebuy.com",
        "https://mailer.kayhanaudio.com.au"
    ],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// routes
app.use("/api/auth/", auth_routes_1.default);
app.use("/api/users/", user_routes_1.default);
app.use("/api/templates/", template_route_1.default);
app.use("/api/lead-group/", leadGroup_route_1.default);
app.use("/api/lead-follow-up/", leadFollowUp_route_1.default);
app.use("/api/campaign/", Campaign_route_1.default);
app.use("/api/send-email/", sendEmail_routes_1.default);
app.use("/api/product-specifications", Specification_routes_1.default);
app.use("/api/flyer", flyer_routes_1.default);
(0, connectDb_1.default)();
app.get("/api/check", (req, res) => {
    res.json({ status: "ok", message: "API is working ✅" });
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT} 🚀`);
});
