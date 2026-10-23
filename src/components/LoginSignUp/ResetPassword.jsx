
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./LoginSignUp.css";
import passwordIcon from "../../Assets/password.png";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!token) {
            setError("The reset link is invalid or missing.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                "http://localhost:3000/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token, password })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setError(result.message || "Unable to reset password.");
                return;
            }

            setSuccess(result.message);
            setPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error(error);
            setError("Unable to connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-signup-container">
            <div className="header">
                <div className="text">Choose New Password</div>
                <div className="underline"></div>
            </div>

            <div className="form-container">
                <form
                    className="form"
                    onSubmit={handleSubmit}
                    noValidate
                >
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

                    <div className="input-group">
                        <div className="input-container">
                            <img src={passwordIcon} alt="" className="icon" />
                            <input
                                type="password"
                                placeholder="New password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="input-container">
                            <img src={passwordIcon} alt="" className="icon" />
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </div>

                    <div className="submit-container">
                        <button
                            type="submit"
                            className="submit"
                            disabled={isLoading || Boolean(success)}
                        >
                            {isLoading ? "Updating..." : "Update Password"}
                        </button>

                        <button
                            type="button"
                            className="submit inactive"
                            onClick={() => navigate("/")}
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
