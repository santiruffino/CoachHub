import { useState, useRef } from 'react';
import { Button } from '../../../components/ui/Button';
import { Upload, X, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '../../../lib/api';

interface VideoUploadProps {
    onUploadComplete: (url: string) => void;
}

export function VideoUpload({ onUploadComplete }: VideoUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            // Validate size (e.g., max 50MB)
            if (selectedFile.size > 50 * 1024 * 1024) {
                alert('File size too large (max 50MB)');
                return;
            }
            // Validate type
            if (!selectedFile.type.startsWith('video/')) {
                alert('Please select a video file');
                return;
            }
            setFile(selectedFile);
            setUploadedUrl(null);
            setProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setProgress(0);

        try {
            // 1. Get presigned URL
            const { data } = await api.post('/exercises/presign', {
                fileName: file.name,
                fileType: file.type,
            });

            const { uploadUrl, publicUrl } = data;

            // 2. Upload to MinIO/S3
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', uploadUrl, true);
            xhr.setRequestHeader('Content-Type', file.type);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    setProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    setUploadedUrl(publicUrl);
                    onUploadComplete(publicUrl);
                    setIsUploading(false);
                } else {
                    console.error('Upload failed', xhr.statusText);
                    alert('Upload failed');
                    setIsUploading(false);
                }
            };

            xhr.onerror = () => {
                console.error('Upload error');
                alert('Upload error');
                setIsUploading(false);
            };

            xhr.send(file);

        } catch (error) {
            console.error('Error getting presigned URL', error);
            alert('Error initiating upload');
            setIsUploading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setUploadedUrl(null);
        setProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/*"
                    className="hidden"
                    id="video-upload"
                />

                {!file ? (
                    <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">Click to upload video</span>
                        <span className="text-xs text-gray-500 mt-1">MP4, MOV up to 50MB</span>
                    </label>
                ) : (
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
                        <div className="flex items-center truncate">
                            <CheckCircle className={clsx("h-5 w-5 mr-2", uploadedUrl ? "text-green-500" : "text-blue-500")} />
                            <span className="text-sm text-blue-700 truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <button onClick={clearFile} type="button" className="text-blue-500 hover:text-blue-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {file && !uploadedUrl && (
                <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            onClick={handleUpload}
                            disabled={isUploading}
                            variant="secondary"
                            className="w-full"
                        >
                            {isUploading ? `Uploading ${progress}%` : 'Upload Video'}
                        </Button>
                    </div>
                </div>
            )}

            {uploadedUrl && (
                <div className="text-sm text-green-600 font-medium text-center">
                    Video uploaded successfully!
                </div>
            )}
        </div>
    );
}
