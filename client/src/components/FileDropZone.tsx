import { useState, useRef, useCallback } from 'react';
import type { SlideContent } from '@deckster/shared/types';
import { parseFile } from '../services/fileParser';
import './FileDropZone.css';

interface FileDropZoneProps {
  onFileParsed: (contents: SlideContent[], fileName: string) => void;
}

export function FileDropZone({ onFileParsed }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsingFileName, setParsingFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsParsing(true);
    setParsingFileName(file.name);

    try {
      const contents = await parseFile(file);
      if (contents.length === 0) {
        throw new Error('No text content found in the file. The presentation may contain only images.');
      }
      onFileParsed(contents, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setIsParsing(false);
    }
  }, [onFileParsed]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="dropzone-page">
      {/* Background grid */}
      <div className="dropzone-grid" />

      {/* Content */}
      <div className="dropzone-content">
        <div className="dropzone-brand">
          <span className="dropzone-logo">D</span>
          <h1 className="dropzone-title">Deckster</h1>
          <p className="dropzone-subtitle">Evaluator</p>
        </div>

        <div
          className={`dropzone-area ${isDragging ? 'dropzone-area--active' : ''} ${isParsing ? 'dropzone-area--parsing' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={!isParsing ? handleClick : undefined}
          role="button"
          tabIndex={0}
          aria-label="Drop a presentation file or click to browse"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx,.pdf"
            onChange={handleFileInput}
            className="sr-only"
          />

          {isParsing ? (
            <div className="dropzone-parsing">
              <div className="dropzone-spinner" />
              <p className="dropzone-parsing-text">
                Extracting slides from<br />
                <strong>{parsingFileName}</strong>
              </p>
            </div>
          ) : (
            <>
              <div className="dropzone-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4L24 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M16 12L24 4L32 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 28V38C8 40.2091 9.79086 42 12 42H36C38.2091 42 40 40.2091 40 38V28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="dropzone-cta">
                Drop your deck here
              </p>
              <p className="dropzone-hint">
                or click to browse — <span className="dropzone-formats">.pptx</span> and <span className="dropzone-formats">.pdf</span> supported
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="dropzone-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
            </svg>
            {error}
          </div>
        )}

        <p className="dropzone-tagline">
          Stress-test your presentation against realistic audience expectations.
        </p>
      </div>
    </div>
  );
}
