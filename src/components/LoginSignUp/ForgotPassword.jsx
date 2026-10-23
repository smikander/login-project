
import { useState } from "react";
import emailIcon from "../../Assets/email.png";

const ForgotPassword = ({ onBack }) => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                "http://localhost:3000/forgot-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim()
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setError(result.message || "Something went wrong.");
                return;
            }

            setSuccess(result.message);
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
                <div className="text">Reset Password</div>
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
                            <img
                                src={emailIcon}
                                alt=""
                                className="icon"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                autoComplete="email"
                                aria-label="Email address"
                                required
                            />
                        </div>
                    </div>

                    <div className="submit-container">
                        <button
                            type="submit"
                            className="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending..." : "Reset Password"}
                        </button>

                        <button
                            type="button"
                            className="submit inactive"
                            onClick={onBack}
                            disabled={isLoading}
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
