import { useState, useRef, useCallback } from 'react';
import type { SlideContent } from '@deckster/shared/types';
import { parseFile } from '../services/fileParser';
import { Footer } from './Footer';

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-bg-primary">
      {/* Grid background */}
      <div
        className="fixed inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(circle at center, black 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 p-10 pb-16 animate-fade-in">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <img src="/logo-black.svg" alt="Deckster" className="h-7" />
          <p className="font-sans text-[13px] font-medium tracking-[0.2em] uppercase text-text-secondary">
            Evaluator
          </p>
        </div>

        {/* Drop area */}
        <div
          className={[
            'w-[480px] max-w-[90vw] min-h-[260px]',
            'flex flex-col items-center justify-center gap-4 p-10',
            'border-[1.5px] border-dashed border-border rounded-2xl',
            'bg-bg-secondary',
            'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
            'animate-fade-in-up [animation-delay:150ms]',
            'group',
            !isParsing && 'cursor-pointer hover:border-accent hover:bg-bg-accent-light hover:shadow-[0_0_24px_rgba(0,21,255,0.08)]',
            isDragging && '!border-accent !bg-bg-accent-light !shadow-[0_0_24px_rgba(0,21,255,0.08)] scale-[1.02]',
            isParsing && 'cursor-default !border-solid !border-accent !bg-bg-accent-light',
          ].filter(Boolean).join(' ')}
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
            <div className="flex flex-col items-center gap-6 animate-fade-in">
              <div className="w-10 h-10 border-[2.5px] border-border border-t-accent rounded-full animate-spin-slow" />
              <p className="text-center text-[15px] text-text-secondary leading-relaxed">
                Extracting slides from<br />
                <strong className="text-text-primary font-medium">{parsingFileName}</strong>
              </p>
            </div>
          ) : (
            <>
              <div className={[
                'text-text-secondary transition-all duration-300',
                'group-hover:text-accent group-hover:-translate-y-1',
                isDragging && '!text-accent !-translate-y-2',
              ].filter(Boolean).join(' ')}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4L24 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M16 12L24 4L32 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 28V38C8 40.2091 9.79086 42 12 42H36C38.2091 42 40 40.2091 40 38V28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-sans text-[22px] font-normal text-text-primary">
                Drop your deck here
              </p>
              <p className="text-sm text-text-secondary">
                or click to browse — <span className="text-text-accent font-medium">.pptx</span> and <span className="text-text-accent font-medium">.pdf</span> supported
              </p>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-error rounded-lg text-sm animate-fade-in">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
            </svg>
            {error}
          </div>
        )}

        {/* Tagline */}
        <p className="text-[15px] text-text-secondary/70 text-center max-w-[400px] animate-fade-in-up [animation-delay:300ms]">
          Stress-test your presentation against realistic audience expectations.
        </p>
      </div>
      <Footer />
    </div>
  );
}
