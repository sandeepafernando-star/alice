'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';

export default function UploadFiles() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const uploadFile = async () => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/files`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = (await response.json()) as { error?: string; path?: string };

    if (!response.ok) {
      setStatus(data.error ?? 'Upload failed');
      return;
    }

    setStatus(`Uploaded: ${data.path ?? 'ok'}`);
  };

  return (
    <div className="flex items-center gap-3">
      <Input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="max-w-xs cursor-pointer"
      />
      <Button type="button" onClick={uploadFile}>
        Upload
      </Button>
      {status ? <p className="text-sm font-medium">{status}</p> : null}
    </div>
  );
}
