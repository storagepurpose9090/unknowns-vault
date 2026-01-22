"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const ADMIN_UID = "8d36216f-c996-40aa-a924-73e94d194ad7"; // Your admin UID
  const ADMIN_EMAIL = "storagepurpose9090@gmail.com"; // Add your admin email here

  // Get logged-in user on page load
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Admin login
  const login = async () => {
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    else setUser(data.user);
  };

  // Upload mod function using secure API route
  const uploadMod = async () => {
    if (!file) {
      alert("Select a file first");
      return;
    }
    
    if (!user) {
      alert("You must be logged in to upload!");
      return;
    }

    if (user.id !== ADMIN_UID) {
      alert("You are not authorized to upload mods.");
      return;
    }

    setUploading(true);
    setSuccessMessage("");
    
    try {
      const path = `${Date.now()}-${file.name}`;

      // 1️⃣ Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("mods")
        .upload(path, file);

      if (uploadError) {
        alert("Storage upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }

      // 2️⃣ Get public URL
      const { data: urlData } = supabase.storage.from("mods").getPublicUrl(path);

      // 3️⃣ Call your secure server API route
      const response = await fetch('/api/uploadMod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          version,
          file_url: urlData.publicUrl,
          admin_email: user.email, // Pass for verification
        }),
      });

      let result = null;

const contentType = response.headers.get("content-type");
if (contentType && contentType.includes("application/json")) {
  result = await response.json();
}

if (!response.ok) {
  alert("❌ Failed to upload mod: " + (result?.error || "Unknown error"));
  return;
}


      if (response.ok) {
        setSuccessMessage(`✅ Mod "${name}" uploaded successfully!`);
        // Clear form
        setName("");
        setVersion("");
        setFile(null);
        
        // Clear file input visually
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        alert("❌ Failed to upload mod: " + result.error);
      }
      
    } catch (error: any) {
      alert("❌ Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmail("");
    setPassword("");
  };

  // 🔐 LOGIN SCREEN
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-4">
        <div className="space-y-6 w-full max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-purple-400 mb-2">Admin Portal</h1>
            <p className="text-gray-400">Login to manage your mods</p>
          </div>
          
          <div className="space-y-4 bg-gray-800/50 p-8 rounded-xl border border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              onClick={login}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold p-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Login to Admin Panel
            </button>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 text-center">
                Only authorized administrators can access this panel
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 📤 UPLOAD PANEL
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Mod Upload Portal
            </h1>
            <p className="text-gray-400 mt-2">
              Welcome back, <span className="text-purple-300">{user.email}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Admin UID: <code className="bg-gray-800 px-2 py-1 rounded text-xs">{ADMIN_UID}</code>
            </p>
          </div>
          
          <button
            onClick={logout}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg animate-fadeIn">
            <p className="text-green-400 flex items-center gap-2">
              <span className="text-xl">✅</span>
              {successMessage}
            </p>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Upload New Mod
          </h2>
          
          <div className="space-y-6 max-w-2xl">
            {/* Mod Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mod Name
              </label>
              <input
                placeholder="e.g., Biomes O' Plenty, Create, OptiFine"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Minecraft Version */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minecraft Version
              </label>
              <input
                placeholder="e.g., 1.20.1, 1.19.2, 1.18.2"
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mod File (.jar)
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input
                  type="file"
                  accept=".jar,.zip"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 transition"
                />
                {file && (
                  <div className="text-sm text-gray-300 bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-700">
                    📁 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload your mod .jar file. Max size: 100MB
              </p>
            </div>

            {/* Upload Button */}
            <div className="pt-4">
              <button
                onClick={uploadMod}
                disabled={uploading || !name || !version || !file}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  uploading || !name || !version || !file
                    ? 'bg-gray-700 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Uploading Mod...
                  </span>
                ) : (
                  '📤 Upload Mod to Database'
                )}
              </button>
              
              {(!name || !version || !file) && (
                <p className="text-sm text-yellow-500 mt-3">
                  ⚠️ Please fill in all fields and select a file to enable upload
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-gray-800/30 border border-gray-700 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">How it works:</h3>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">1</span>
              File uploads directly to Supabase Storage bucket
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">2</span>
              Public URL is generated for the uploaded file
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">3</span>
              Server API route (with Service Role Key) inserts mod info into database
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">4</span>
              Mod appears in your public mods list for users to download
            </li>
          </ol>
        </div>
      </div>
      
      {/* Add custom animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}