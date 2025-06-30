import { auth } from "../lib/auth.js";

export const signIn = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email: email,
        password: password,
      },
    });
    console.log("Signed in");
    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};

export const signUp = async (username: string, email: string, password: string) => {
  try {
    await auth.api.signUpEmail({
      body: {
        name: username,
        email: email,
        password: password,
      },
    });
    return {
      success: true,
      message: "Signed up successfully."
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "An unknown error occurred."
    };
  }
};
