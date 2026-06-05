'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  updatedAt: string;
  owner?: { name: string };
}

export default function Home() {
  const [userId, setUserId] = useState('alice-id');
  const [ownedDocs, setOwnedDocs] = useState<Document[]>([]);
  const [sharedDocs, setSharedDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('userId');
    if (storedUser) setUserId(storedUser);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [userId]);

  const fetchDocuments = async () => {
    setLoading(true);
    const res = await fetch('/api/documents', {
      headers: { 'x-user-id': userId },
    });
    const data = await res.json();
    setOwnedDocs(data.ownedDocuments || []);
    setSharedDocs(data.sharedDocuments || []);
    setLoading(false);
  };

  const createDocument = async () => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': userId 
      },
      body: JSON.stringify({ title: 'Untitled Document', content: '' }),
    });
    const doc = await res.json();
    router.push(`/document/${doc.id}`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-user-id': userId },
      body: formData,
    });

    if (res.ok) {
      const doc = await res.json();
      router.push(`/document/${doc.id}`);
    } else {
      const error = await res.json();
      alert(error.error || 'Upload failed');
    }
    setUploading(false);
  };

  const switchUser = (newUserId: string) => {
    setUserId(newUserId);
    localStorage.setItem('userId', newUserId);
    fetchDocuments();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Ajaia Docs</h1>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => switchUser('alice-id')}
                  className={`px-3 py-1 rounded ${
                    userId === 'alice-id'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Alice
                </button>
                <button
                  onClick={() => switchUser('bob-id')}
                  className={`px-3 py-1 rounded ${
                    userId === 'bob-id'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Bob
                </button>
              </div>
              <span className="text-sm text-gray-600">
                Logged in as: <strong>{userId === 'alice-id' ? 'Alice' : 'Bob'}</strong>
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900">My Documents</h2>
          <div className="flex gap-3">
            <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
              {uploading ? 'Uploading...' : '📄 Upload .txt/.md'}
              <input
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <button
              onClick={createDocument}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              + New Document
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            {ownedDocs.length === 0 && sharedDocs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No documents yet. Create your first document!</p>
              </div>
            ) : (
              <>
                {ownedDocs.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Owned by me</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {ownedDocs.map((doc) => (
                        <Link
                          key={doc.id}
                          href={`/document/${doc.id}`}
                          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition border border-gray-200"
                        >
                          <h3 className="font-semibold text-gray-900 mb-2">{doc.title}</h3>
                          <p className="text-sm text-gray-500">
                            Updated {new Date(doc.updatedAt).toLocaleDateString()}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {sharedDocs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Shared with me</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {sharedDocs.map((doc) => (
                        <Link
                          key={doc.id}
                          href={`/document/${doc.id}`}
                          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition border border-gray-200"
                        >
                          <h3 className="font-semibold text-gray-900 mb-2">{doc.title}</h3>
                          <p className="text-sm text-gray-500">
                            Owner: {doc.owner?.name || 'Unknown'} • Updated{' '}
                            {new Date(doc.updatedAt).toLocaleDateString()}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}