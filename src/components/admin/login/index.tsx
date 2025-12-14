"use client";

import { useState } from "react";
import { lexend } from "@/libs/fonts";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save token to localStorage
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // Save user data to localStorage
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        // Clear form
        setFormData({
          email: "",
          password: "",
        });

        // Redirect to dashboard
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${lexend.className} min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100`}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b bg-white">
          <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Welcome Back</h1>
            <p className="text-xs text-gray-500">
              Login to access your dashboard
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t text-center">
          <p className="text-xs text-gray-500">
            Secure login • © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { lexend } from "@/libs/fonts";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function Register() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     name: "",
//     confirmPassword: "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//     setError("");
//     setSuccess("");
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setSuccess("");

//     // Validation
//     if (
//       !formData.email ||
//       !formData.password ||
//       !formData.name ||
//       !formData.confirmPassword
//     ) {
//       setError("All fields are required");
//       setLoading(false);
//       return;
//     }

//     if (!formData.email.includes("@")) {
//       setError("Please enter a valid email address");
//       setLoading(false);
//       return;
//     }

//     if (formData.password.length < 6) {
//       setError("Password must be at least 6 characters");
//       setLoading(false);
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords do not match");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//           name: formData.name,
//         }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         setSuccess("Registration successful! Redirecting to login...");

//         // Clear form
//         setFormData({
//           email: "",
//           password: "",
//           name: "",
//           confirmPassword: "",
//         });

//         // Redirect to login after 2 seconds
//         setTimeout(() => {
//           router.push("/login");
//         }, 2000);
//       } else {
//         setError(data.message || "Registration failed. Please try again.");
//       }
//     } catch (err) {
//       console.error("Registration error:", err);
//       setError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className={`${lexend.className} min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100`}
//     >
//       <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
//         {/* Header */}
//         <div className="flex items-center gap-3 px-6 py-5 border-b bg-white">
//           <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center">
//             <span className="text-white font-bold text-lg">P</span>
//           </div>
//           <div>
//             <h1 className="text-lg font-bold text-gray-800">Create Account</h1>
//             <p className="text-xs text-gray-500">
//               Register for dashboard access
//             </p>
//           </div>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Full Name
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               placeholder="Enter your full name"
//               className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email Address
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               placeholder="Enter your email"
//               className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               placeholder="At least 6 characters"
//               className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               Must be at least 6 characters
//             </p>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Confirm Password
//             </label>
//             <input
//               type="password"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               required
//               placeholder="Confirm your password"
//               className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
//             />
//           </div>

//           {error && (
//             <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">
//               {error}
//             </div>
//           )}

//           {success && (
//             <div className="p-3 rounded-md bg-green-50 text-green-700 border border-green-200 text-sm">
//               {success}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-2.5 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
//           >
//             {loading ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 Creating Account...
//               </>
//             ) : (
//               "Register"
//             )}
//           </button>

//           <div className="text-center pt-2">
//             <p className="text-sm text-gray-600">
//               Already have an account?{" "}
//               <Link
//                 href="/login"
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Login here
//               </Link>
//             </p>
//           </div>
//         </form>

//         {/* Footer */}
//         <div className="px-6 py-4 bg-gray-50 border-t text-center">
//           <p className="text-xs text-gray-500">
//             Secure registration • © {new Date().getFullYear()}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
