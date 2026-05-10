import React from 'react';
import { useNavigate } from 'react-router-dom';

const GuestActionButtons: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="sl-header-actions">
      <button className="sl-auth-btn sl-btn-login" onClick={() => navigate('/login')}>ログイン</button>
      <button className="sl-auth-btn sl-btn-signup" onClick={() => navigate('/register')}>サインアップ</button>
    </div>
  );
};

export default GuestActionButtons;
