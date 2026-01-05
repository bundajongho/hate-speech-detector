import React, { useState } from 'react';

const InputArea = ({ value, onChange, placeholder = "Masukkan kalimat yang ingin dianalisis..." }) => {
  const charCount = value.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-neutral-text flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Masukkan Kalimat
        </label>
        {charCount > 0 && (
          <span className="text-xs font-medium text-neutral-muted bg-white/40 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-white/40 shadow-soft">
            {charCount} karakter
          </span>
        )}
      </div>
      
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field resize-none h-32 md:h-40 text-sm md:text-base"
        rows="6"
      />
      
      <p className="text-xs text-neutral-muted flex items-center gap-1.5">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Masukkan teks yang ingin dianalisis untuk mendeteksi kemungkinan hate speech
      </p>
    </div>
  );
};

export default InputArea;

