"use client";
import React, { useState, useEffect } from "react";
import {
  Upload,
  Eye,
  Trash2,
  User,
  Mail,
  MessageSquare,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

export default function BannerPortal() {
  const [activeTab, setActiveTab] = useState("banners");

  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const res = await fetch("/api/contacts");
      const data = await res.json();
      setContacts(data);
    } catch (error) {
      console.error("Failed to load contacts:", error);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchContacts();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dragActive, setDragActive] = useState(false);
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoadingBanners(true);
    try {
      const res = await fetch("/api/banners");
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      console.error("Failed to load banners:", error);
    } finally {
      setLoadingBanners(false);
    }
  };

  const handleFileUpload = async (files) => {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const fileBase64 = e.target.result;
          const newBanner = {
            name: file.name,
            fileBase64,
            uploadDate: new Date().toISOString().split("T")[0],
            size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
          };

          toast.promise(
            fetch("/api/banners", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newBanner),
            }).then(async (res) => {
              if (!res.ok) throw new Error("Upload failed");
              const saved = await res.json();
              setBanners((prev) => [saved, ...prev]);
            }),
            {
              loading: "Uploading...",
              success: "Banner uploaded!",
              error: "Upload failed",
            }
          );
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Only image files are allowed!");
      }
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const deleteBanner = async (id) => {
    toast.promise(
      fetch(`/api/banners/${id}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        setBanners((prev) => prev.filter((b) => b._id !== id));
      }),
      {
        loading: "Deleting...",
        success: "Banner deleted!",
        error: "Delete failed",
      }
    );
  };
  const filteredContacts = contacts.filter((contact) => {
    const search = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(search) ||
      contact.email.toLowerCase().includes(search) ||
      contact.message.toLowerCase().includes(search) ||
      contact.service.toLowerCase().includes(search) || 
      contact.country.toLowerCase().includes(search) 
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab("banners")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "banners"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Banner Manager
              </button>
              <button
                onClick={() => setActiveTab("contacts")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "contacts"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Contact Responses
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "banners" && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Upload New Banner</h2>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                  Drag and drop your banner images here
                </p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <label className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                  Browse Files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-4">
                  Supports: JPG, PNG, GIF, WebP (Max 10MB each)
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Current Banners</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                  <div
                    key={banner._id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <img
                      src={banner.url}
                      alt={banner.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {banner.name}
                      </h3>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {banner.uploadDate}
                        </p>
                        <p>Size: {banner.size}</p>
                      </div>
                      <div className="flex justify-between mt-4">
                        <button
                          onClick={() => deleteBanner(banner._id)}
                          className="text-red-600 hover:text-red-800 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">
                  Contact Form Responses
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredContacts.length} of {contacts.length} contacts
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {contact.name}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {contact.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            Phone: {contact.phone}
                          </p>
                          <p className="text-sm text-gray-500">
                            Service: {contact.service}
                          </p>
                          <p className="text-sm text-gray-500">
                            Country: {contact.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{contact.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
