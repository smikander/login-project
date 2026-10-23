require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateRegistration = (username, email, password) => {
    const errors = {};

    if (typeof username !== "string" || username.trim().length < 3) {
        errors.username = "Username must be at least 3 characters.";
    }

    if (typeof email !== "string" || !validateEmail(email.trim())) {
        errors.email = "Please enter a valid email address.";
    }

    if (typeof password !== "string" || password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
    }

    return errors;
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }

        req.user = user;
        next();
    });
};

app.get("/me", authenticateToken, (req, res) => {
    res.json({
        user: req.user
    });
});

app.get("/", (req, res) => {
    res.json({ message: "Backend is working!" });
});

app.get("/db-test", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS result");
        res.json({ message: "Database connection works!", result: rows[0].result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database connection failed" });
    }
});


app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const errors = validateRegistration(
            username,
            email,
            password
        );

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                message: "Please check your input.",
                errors
            });
        }

        const cleanUsername = username.trim();
        const cleanEmail = email.trim();

        const passwordHash = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            [cleanUsername, cleanEmail, passwordHash]
        );

        res.status(201).json({
            message: "User registered successfully"
        });
    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        res.status(500).json({
            message: "Registration failed"
        });
    }
});


app.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                message: "Email is required."
            });
        }

        const cleanEmail = email.trim();

        const [users] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [cleanEmail]
        );

        // Sama vastaus riippumatta siitä, löytyikö käyttäjä.
        const responseMessage =
            "If an account exists for this email, a reset link has been generated.";

        if (users.length === 0) {
            return res.json({ message: responseMessage });
        }

        const userId = users[0].id;

        // Poistetaan aiemmat palautustokenit tältä käyttäjältä.
        await db.query(
            "DELETE FROM password_reset_tokens WHERE user_id = ?",
            [userId]
        );

        // Luodaan kryptografisesti satunnainen token.
        const token = crypto.randomBytes(32).toString("hex");

        // Tietokantaan tallennetaan vain tokenin SHA-256-tiiviste.
        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Token vanhenee 15 minuutissa.
        await db.query(
            `INSERT INTO password_reset_tokens
                (user_id, token_hash, expires_at)
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
            [userId, tokenHash]
        );

        // Paikallinen testiversio: tulostetaan linkki backendin konsoliin.
        const resetUrl = new URL(
            "/reset-password",
            "http://localhost:5173"
        );

        resetUrl.searchParams.set("token", token);

        console.log("\nPassword reset link (local testing only):");
        console.log(resetUrl.toString());
        console.log("Link expires in 15 minutes.\n");

        res.json({ message: responseMessage });
    } catch (error) {
        console.error("Password reset request failed:", error);

        res.status(500).json({
            message: "Unable to process the password reset request."
        });
    }
});

app.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;

    if (
        typeof token !== "string" ||
        !/^[a-f0-9]{64}$/.test(token)
    ) {
        return res.status(400).json({
            message: "Invalid or expired reset link."
        });
    }

    if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
            message: "Password must be at least 8 characters."
        });
    }

    let connection;

    try {
        // Lasketaan tiiviste samasta tokenista, joka lähetettiin linkissä.
        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const passwordHash = await bcrypt.hash(password, 10);

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Lukitaan tokenrivi käsittelyn ajaksi.
        const [tokens] = await connection.query(
            `SELECT id, user_id
             FROM password_reset_tokens
             WHERE token_hash = ?
               AND used_at IS NULL
               AND expires_at > NOW()
             FOR UPDATE`,
            [tokenHash]
        );

        if (tokens.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                message: "Invalid or expired reset link."
            });
        }

        const resetToken = tokens[0];

        // Päivitetään salasana.
        await connection.query(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            [passwordHash, resetToken.user_id]
        );

        // Merkitään token käytetyksi.
        await connection.query(
            `UPDATE password_reset_tokens
             SET used_at = NOW()
             WHERE id = ?`,
            [resetToken.id]
        );

        // Mitätöidään myös käyttäjän muut palautustokenit.
        await connection.query(
            `UPDATE password_reset_tokens
             SET used_at = NOW()
             WHERE user_id = ?
               AND id <> ?
               AND used_at IS NULL`,
            [resetToken.user_id, resetToken.id]
        );

        await connection.commit();

        res.json({
            message: "Password reset successful. You can now log in."
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Password reset failed:", error);

        res.status(500).json({
            message: "Unable to reset password."
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                email: user.email 
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: "1h" 
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});