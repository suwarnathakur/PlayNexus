import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { InputField } from './InputField';
import { useSound } from '../../hooks/useSound';

interface PasswordFieldProps {
  id?: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id = 'nexus-access-code',
  value,
  error,
  disabled = false,
  onChange,
  onFocus,
  onBlur,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { playSound } = useSound();

  const toggleShowPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    playSound('click');
    setShowPassword(prev => !prev);
  };

  return (
    <InputField
      id={id}
      label="ACCESS CODE"
      type={showPassword ? 'text' : 'password'}
      value={value}
      placeholder="ENTER ACCESS CODE"
      error={error}
      disabled={disabled}
      isValid={value.length >= 4}
      icon={<Lock size={18} />}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      autoComplete="current-password"
      rightElement={
        <button
          type="button"
          onClick={toggleShowPassword}
          title={showPassword ? 'Hide access code' : 'Show access code'}
          onMouseEnter={() => playSound('hover')}
          style={{
            background: 'transparent',
            border: 'none',
            color: showPassword ? 'var(--accent-cyan)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            transition: 'color 0.2s ease',
          }}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      }
    />
  );
};
