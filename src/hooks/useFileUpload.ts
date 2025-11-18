import { useState, useCallback, useRef } from 'react';

interface FileUploadState {
  files: File[];
  isUploading: boolean;
  progress: number;
  uploadedFiles: string[]; // URLs of uploaded files
  error: string | null;
}

interface FileUploadOptions {
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  maxFiles?: number;
  autoUpload?: boolean;
}

export const useFileUpload = (options: FileUploadOptions = {}) => {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/*', 'application/pdf'],
    maxFiles = 5,
    autoUpload = false
  } = options;
  
  const [state, setState] = useState<FileUploadState>({
    files: [],
    isUploading: false,
    progress: 0,
    uploadedFiles: [],
    error: null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Validate file
  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize) {
      setState(prev => ({ ...prev, error: `File ${file.name} exceeds maximum size of ${maxFileSize / (1024 * 1024)}MB` }));
      return false;
    }
    
    // Check file type
    if (allowedTypes.length > 0) {
      const isValidType = allowedTypes.some(type => {
        if (type === '*') return true;
        if (type.endsWith('/*')) {
          const baseType = type.slice(0, -1); // Remove the '*'
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });
      
      if (!isValidType) {
        setState(prev => ({ ...prev, error: `File ${file.name} has invalid type. Allowed types: ${allowedTypes.join(', ')}` }));
        return false;
      }
    }
    
    return true;
  }, [maxFileSize, allowedTypes]);
  
  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check max files limit
    if (state.files.length + fileArray.length > maxFiles) {
      setState(prev => ({ ...prev, error: `Maximum ${maxFiles} files allowed` }));
      return;
    }
    
    // Validate files
    const validFiles = fileArray.filter(validateFile);
    
    if (validFiles.length > 0) {
      setState(prev => ({
        ...prev,
        files: [...prev.files, ...validFiles],
        error: null
      }));
      
      // Auto upload if enabled
      if (autoUpload) {
        uploadFiles(validFiles);
      }
    }
  }, [state.files.length, maxFiles, validateFile, autoUpload]);
  
  // Remove file
  const removeFile = useCallback((index: number) => {
    setState(prev => {
      const newFiles = [...prev.files];
      newFiles.splice(index, 1);
      return { ...prev, files: newFiles };
    });
  }, []);
  
  // Clear all files
  const clearFiles = useCallback(() => {
    setState(prev => ({
      ...prev,
      files: [],
      uploadedFiles: [],
      progress: 0,
      error: null
    }));
  }, []);
  
  // Upload files
  const uploadFiles = useCallback(async (filesToUpload?: File[]) => {
    const files = filesToUpload || state.files;
    
    if (files.length === 0) {
      setState(prev => ({ ...prev, error: 'No files to upload' }));
      return;
    }
    
    setState(prev => ({ ...prev, isUploading: true, progress: 0, error: null }));
    
    try {
      // Simulate file upload progress
      const totalFiles = files.length;
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create object URL for demo purposes
        const fileUrl = URL.createObjectURL(file);
        uploadedUrls.push(fileUrl);
        
        // Update progress
        const progress = Math.round(((i + 1) / totalFiles) * 100);
        setState(prev => ({ ...prev, progress }));
      }
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadedFiles: [...prev.uploadedFiles, ...uploadedUrls]
      }));
      
      return uploadedUrls;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: 'File upload failed'
      }));
      
      return null;
    }
  }, [state.files]);
  
  // Trigger file input click
  const triggerFileSelect = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);
  
  // Get file input props
  const getFileInputProps = useCallback(() => ({
    ref: fileInputRef,
    type: 'file',
    multiple: maxFiles > 1,
    accept: allowedTypes.join(','),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files);
        // Reset input value to allow selecting the same file again
        e.target.value = '';
      }
    },
    style: { display: 'none' }
  }), [maxFiles, allowedTypes, handleFileSelect]);
  
  // Get drag and drop props
  const getDropZoneProps = useCallback(() => ({
    onDragOver: handleDragOver,
    onDrop: handleDrop
  }), [handleDragOver, handleDrop]);
  
  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);
  
  // Get file preview URL
  const getFilePreview = useCallback((file: File): string => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return ''; // No preview for non-image files
  }, []);
  
  return {
    ...state,
    handleFileSelect,
    removeFile,
    clearFiles,
    uploadFiles,
    triggerFileSelect,
    handleDragOver,
    handleDrop,
    getFileInputProps,
    getDropZoneProps,
    formatFileSize,
    getFilePreview
  };
};