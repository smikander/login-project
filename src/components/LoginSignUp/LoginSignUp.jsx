
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginSignUp.css";
import "./ForgotPassword.css";
import ForgotPassword from "./ForgotPassword";

import userIcon from "../../Assets/user.png";
import emailIcon from "../../Assets/email.png";
import passwordIcon from "../../Assets/password.png";

const LoginSignUp = () => {
    const navigate = useNavigate();

    const [action, setAction] = useState("Sign Up");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const hasVisibleFieldError = (field) =>
        Boolean(fieldErrors[field] && (hasSubmitted || touchedFields[field]));

    const getFieldError = (field, value) => {
        if (field === "username" && action === "Sign Up") {
            return value.trim().length < 3
                ? "Username must be at least 3 characters."
                : "";
        }

        if (field === "email") {
            const trimmedEmail = value.trim();

            if (!trimmedEmail) return "Email is required.";
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
                return "Please enter a valid email address.";
            }
        }

        if (field === "password") {
            if (!value) return "Password is required.";
            if (value.length < 8) return "Password must be at least 8 characters.";
        }

        return "";
    };

    const validateForm = () => {
        const errors = {};
        const fields = action === "Sign Up"
            ? { username, email, password }
            : { email, password };

        Object.entries(fields).forEach(([field, value]) => {
            const fieldError = getFieldError(field, value);
            if (fieldError) errors[field] = fieldError;
        });

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleFieldChange = (field, value) => {
        if (field === "username") setUsername(value);
        if (field === "email") setEmail(value);
        if (field === "password") setPassword(value);

        setTouchedFields((previous) => ({
            ...previous,
            [field]: true
        }));

        if (hasSubmitted) {
            setFieldErrors((previous) => ({
                ...previous,
                [field]: getFieldError(field, value)
            }));
        }

        setError("");
        setSuccess("");
    };

    const changeAction = (nextAction) => {
        setAction(nextAction);
        setUsername("");
        setEmail("");
        setPassword("");
        setFieldErrors({});
        setTouchedFields({});
        setError("");
        setSuccess("");
        setHasSubmitted(false);
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        setHasSubmitted(true);

        if (isLoading) return;

        setError("");
        setSuccess("");

        if (!validateForm()) return;

        setIsLoading(true);

        const endpoint = action === "Sign Up"
            ? "http://localhost:3000/register"
            : "http://localhost:3000/login";

        const data = action === "Sign Up"
            ? { username: username.trim(), email: email.trim(), password }
            : { email: email.trim(), password };

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errors) {
                    setFieldErrors(result.errors);
                    setError("");
                } else {
                    setError(result.message || "Something went wrong.");
                }

                return;
            }

            if (action === "Sign Up") {
                setAction("Login");
                setUsername("");
                setEmail("");
                setPassword("");
                setFieldErrors({});
                setTouchedFields({});
                setError("");
                setHasSubmitted(false);
                setSuccess("Registration successful! You can now log in.");
            } else {
                localStorage.setItem("token", result.token);
                navigate("/dashboard");
            }
        } catch (error) {
            console.error(error);
            setError("Unable to connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    if (showForgotPassword) {
        return (
            <ForgotPassword
                onBack={() => setShowForgotPassword(false)}
            />
        );
    }

    return (

        <div className="login-signup-container">
            <div className="header">
                <div className="text">{action}</div>
                <div className="underline"></div>
            </div>

            <div className="form-container">
                <form className="form" onSubmit={handleSubmit} noValidate>
                    {error && (
                        <p className="error-message" role="alert">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="success-message" role="status">
                            {success}
                        </p>
                    )}

                    {action === "Sign Up" && (
                        <div className="input-group">
                            <div className="input-container">
                                <img src={userIcon} alt="" className="icon" />
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(event) =>
                                        handleFieldChange("username", event.target.value)
                                    }
                                    autoComplete="username"
                                    aria-invalid={hasVisibleFieldError("username")}
                                    aria-describedby={
                                        hasVisibleFieldError("username")
                                            ? "username-error"
                                            : undefined
                                    }
                                />
                            </div>
                            {hasVisibleFieldError("username") && (
                                <p id="username-error" className="field-error">
                                    {fieldErrors.username}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="input-group">
                        <div className="input-container">
                            <img src={emailIcon} alt="" className="icon" />
                            <input
                                id="email"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(event) =>
                                    handleFieldChange("email", event.target.value)
                                }
                                autoComplete="email"
                                aria-invalid={hasVisibleFieldError("email")}
                                aria-describedby={
                                    hasVisibleFieldError("email")
                                        ? "email-error"
                                        : undefined
                                }
                            />
                        </div>
                        {hasVisibleFieldError("email") && (
                            <p id="email-error" className="field-error">
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>

                    <div className="input-group">
                        <div className="input-container">
                            <img src={passwordIcon} alt="" className="icon" />
                            <input
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(event) =>
                                    handleFieldChange("password", event.target.value)
                                }
                                autoComplete={
                                    action === "Sign Up" ? "new-password" : "current-password"
                                }
                                aria-invalid={hasVisibleFieldError("password")}
                                aria-describedby={
                                    hasVisibleFieldError("password")
                                        ? "password-error"
                                        : undefined
                                }
                            />
                        </div>
                        {hasVisibleFieldError("password") && (
                            <p id="password-error" className="field-error">
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>

                    {action === "Login" && (
                        <div className="forgot-password">
                            Forgot your password?{" "}
                            <button
                                className="forgot-password-link"
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                            >
                                Click here!
                            </button>
                        </div>
                    )}

                    <div className="submit-container">
                        {action === "Sign Up" ? (
                            <>
                                <button
                                    type="submit"
                                    className="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Creating Account..." : "Sign Up"}
                                </button>

                                <button
                                    type="button"
                                    className="submit inactive"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        changeAction("Login");
                                    }}
                                    disabled={isLoading}
                                >
                                    Login
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="submit inactive"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        changeAction("Sign Up");
                                    }}
                                    disabled={isLoading}
                                >
                                    Sign Up
                                </button>

                                <button
                                    type="submit"
                                    className="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Logging In..." : "Login"}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginSignUp;
